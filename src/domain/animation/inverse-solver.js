import { D2R, qangle, qarc, qaxis, qinv, qmul, qnorm, qrot, R2D } from '../math/quat.js';
import { vcross, vdot, vlen, vnorm, vscale } from '../math/vec3.js';
import { ease } from './easing.js';
import { sampleKeys } from './keyframes.js';

/**
 * Supported easing candidates for parametric curve fitting.
 */
export const EASING_CANDIDATES = [
  'linear',
  'inOutSine',
  'outQuad',
  'inQuad',
  'outSine',
  'inSine',
  'inOutQuad',
  'outCubic',
  'inCubic',
];

/**
 * Solves elevation and azimuth angles (in degrees) from a normalized 3D direction vector.
 * Matching the forward kinematics aim formula in OP_EVALUATORS.aim:
 * d = [lateral * cos(el) * cos(az), sin(el), cos(el) * sin(az)]
 *
 * @param {number[]} dir - [x, y, z] normalized direction vector in character space
 * @param {number} lateral - 1 for Left limb, -1 for Right limb
 * @returns {{ elev: number, azim: number }}
 */
export function solveAimAngles(dir, lateral = 1) {
  const normDir = vnorm(dir);
  const dx = normDir[0];
  const dy = normDir[1];
  const dz = normDir[2];

  // Elevation: sin(el) = dy
  const elRad = Math.asin(Math.min(1, Math.max(-1, dy)));
  const cosEl = Math.cos(elRad);

  // Azimuth:
  // dx = lateral * cos(el) * cos(az)  =>  cos(az) = dx * lateral / cosEl
  // dz = cos(el) * sin(az)            =>  sin(az) = dz / cosEl
  let azRad = 0;
  if (Math.abs(cosEl) > 1e-5) {
    azRad = Math.atan2(dz, dx * lateral);
  } else {
    azRad = 0;
  }

  return {
    elev: Number((elRad * R2D).toFixed(2)),
    azim: Number((azRad * R2D).toFixed(2)),
  };
}

/**
 * Solves roll angle (axial twist) around the bone's aiming direction.
 *
 * @param {number[]} targetQuat - Desired local bone quaternion [x, y, z, w]
 * @param {number[]} restDir - Rest direction vector (e.g. [1, 0, 0] or [-1, 0, 0])
 * @param {number} elevDeg - Elevation in degrees
 * @param {number} azimDeg - Azimuth in degrees
 * @param {number} lateral - Limb lateral factor (1 or -1)
 * @returns {number} Roll angle in degrees
 */
export function solveAimRoll(targetQuat, restDir, elevDeg, azimDeg, lateral = 1) {
  const el = elevDeg * D2R;
  const az = azimDeg * D2R;
  const d = [lateral * Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
  const dc = vnorm(d);
  const rc = vnorm(restDir);

  // The swing rotation aligning restDir to dc:
  const qSwing = qarc(rc, dc);

  // Twist rotation is the residual: qTarget = qTwist * qSwing => qTwist = qTarget * inv(qSwing)
  const qTwist = qmul(targetQuat, qinv(qSwing));

  // Extract roll angle around axis dc
  // For a quaternion q = [axis * sin(theta/2), cos(theta/2)]:
  const dot = vdot([qTwist[0], qTwist[1], qTwist[2]], dc);
  const rollRad = 2 * Math.atan2(dot, qTwist[3]);
  let rollDeg = rollRad * R2D;

  // Normalize to [-180, 180]
  while (rollDeg > 180) rollDeg -= 360;
  while (rollDeg < -180) rollDeg += 360;

  return Number(rollDeg.toFixed(2));
}

/**
 * Decomposes a rotation quaternion into Euler angles (Pitch, Yaw, Roll)
 * along XYZ convention matching ClipKit semantic spine / hip axes.
 *
 * @param {number[]} q - Normalized quaternion [x, y, z, w]
 * @returns {{ pitch: number, yaw: number, roll: number }} In degrees
 */
export function decomposeEulerXYZ(q) {
  const [x, y, z, w] = qnorm(q);

  // Pitch (around X axis)
  const sinPitch = 2 * (w * x - y * z);
  let pitchRad;
  if (Math.abs(sinPitch) >= 1) {
    pitchRad = Math.sign(sinPitch) * (Math.PI / 2);
  } else {
    pitchRad = Math.asin(sinPitch);
  }

  // Yaw (around Y axis)
  const sinYawCosPitch = 2 * (w * y + z * x);
  const cosYawCosPitch = 1 - 2 * (x * x + y * y);
  const yawRad = Math.atan2(sinYawCosPitch, cosYawCosPitch);

  // Roll (around Z axis)
  const sinRollCosPitch = 2 * (w * z + x * y);
  const cosRollCosPitch = 1 - 2 * (x * x + z * z);
  const rollRad = Math.atan2(sinRollCosPitch, cosRollCosPitch);

  return {
    pitch: Number((pitchRad * R2D).toFixed(2)),
    yaw: Number((yawRad * R2D).toFixed(2)),
    roll: Number((rollRad * R2D).toFixed(2)),
  };
}

/**
 * Calculates flexion angle (in degrees) between two bone direction vectors.
 * Useful for elbows and knees.
 */
export function calculateFlexionAngle(upperBoneDir, lowerBoneDir, restAngle = 0) {
  const u = vnorm(upperBoneDir);
  const v = vnorm(lowerBoneDir);
  const dot = Math.min(1, Math.max(-1, vdot(u, v)));
  const angle = Math.acos(dot) * R2D;
  return Number(Math.max(0, angle - restAngle).toFixed(2));
}

/**
 * Applies a forward-backward zero-phase low-pass smoothing filter
 * to remove high-frequency mocap sensor jitter without phase delay.
 *
 * @param {number[]} samples - Array of scalar values
 * @param {object} options - Filter parameters
 * @returns {number[]} Smoothed samples
 */
export function filterJitter(samples, options = {}) {
  if (!samples || samples.length <= 3) return [...(samples || [])];

  const windowSize = Math.max(3, (options.windowSize || 5) | 1); // must be odd
  const half = Math.floor(windowSize / 2);
  const n = samples.length;

  // Simple triangular/Gaussian kernel weights
  const kernel = [];
  let weightSum = 0;
  for (let i = -half; i <= half; i++) {
    const w = Math.exp(-(i * i) / (2 * 1.5 * 1.5));
    kernel.push(w);
    weightSum += w;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= weightSum;

  // Forward pass
  const fwd = new Array(n);
  for (let i = 0; i < n; i++) {
    let acc = 0;
    for (let k = -half; k <= half; k++) {
      const idx = Math.min(n - 1, Math.max(0, i + k));
      acc += samples[idx] * kernel[k + half];
    }
    fwd[i] = acc;
  }

  // Backward pass (for exact zero phase delay)
  const out = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let acc = 0;
    for (let k = -half; k <= half; k++) {
      const idx = Math.min(n - 1, Math.max(0, i + k));
      acc += fwd[idx] * kernel[k + half];
    }
    out[i] = Number(acc.toFixed(4));
  }

  if (options.preserveEndpoints !== false) {
    out[0] = samples[0];
    out[n - 1] = samples[n - 1];
  }

  return out;
}

/**
 * Evaluates the best easing function for a segment between points[i0] and points[i1],
 * returning the optimal easing, the maximum error, and the index of maximum residual.
 */
export function evaluateEasingSegment(points, i0, i1) {
  const p0 = points[i0];
  const p1 = points[i1];
  const span = Math.max(1e-6, p1[0] - p0[0]);
  const delta = p1[1] - p0[1];

  let bestEasing = 'linear';
  let minMaxError = Infinity;
  let bestMaxIndex = i0;

  for (const easing of EASING_CANDIDATES) {
    let maxErr = 0;
    let maxIdx = i0;

    for (let i = i0 + 1; i < i1; i++) {
      const t = points[i][0];
      const actualVal = points[i][1];
      const u = (t - p0[0]) / span;
      const interpVal = p0[1] + delta * ease(easing, u);
      const err = Math.abs(actualVal - interpVal);

      if (err > maxErr) {
        maxErr = err;
        maxIdx = i;
      }
    }

    if (maxErr < minMaxError) {
      minMaxError = maxErr;
      bestEasing = easing;
      bestMaxIndex = maxIdx;
    }
  }

  return { bestEasing, maxError: minMaxError, maxIndex: bestMaxIndex };
}

/**
 * Easing-aware recursive curve simplification (extending RDP to temporal easing curves).
 */
export function simplifyEasingCurve(points, epsilon = 0.8, i0 = 0, i1 = points.length - 1) {
  if (i1 - i0 < 1) return [];
  if (i1 - i0 === 1) {
    return [
      [points[i0][0], points[i0][1], 'linear'],
      [points[i1][0], points[i1][1], 'linear'],
    ];
  }

  const { bestEasing, maxError, maxIndex } = evaluateEasingSegment(points, i0, i1);

  if (maxError <= epsilon) {
    return [
      [points[i0][0], points[i0][1], 'linear'],
      [points[i1][0], points[i1][1], bestEasing],
    ];
  }

  // If error exceeds epsilon, split at point of maximum residual
  const left = simplifyEasingCurve(points, epsilon, i0, maxIndex);
  const right = simplifyEasingCurve(points, epsilon, maxIndex, i1);

  return left.concat(right.slice(1));
}

/**
 * Perpendicular distance from point p to line segment (a, b).
 */
function perpendicularDistance(p, a, b) {
  const dt = b[0] - a[0];
  const dv = b[1] - a[1];
  if (Math.abs(dt) < 1e-7 && Math.abs(dv) < 1e-7) {
    return Math.hypot(p[0] - a[0], p[1] - a[1]);
  }
  const num = Math.abs(dv * p[0] - dt * p[1] + b[0] * a[1] - b[1] * a[0]);
  const den = Math.hypot(dt, dv);
  return num / den;
}

/**
 * Classical Ramer-Douglas-Peucker (RDP) algorithm on 2D points.
 */
export function rdpSimplify(points, epsilon = 0.5) {
  if (points.length <= 2) return [...points];

  let maxDist = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, index + 1), epsilon);
    const right = rdpSimplify(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }

  return [first, last];
}

/**
 * Fits the best easing curve between two keyframes based on intermediate points.
 */
export function fitBestEasing(kf0, kf1, intermediates = []) {
  if (!intermediates.length) return 'linear';

  let bestEasing = 'linear';
  let minError = Infinity;
  const span = Math.max(1e-6, kf1[0] - kf0[0]);
  const delta = kf1[1] - kf0[1];

  for (const easing of EASING_CANDIDATES) {
    let sumSqErr = 0;
    for (const [t, v] of intermediates) {
      const u = (t - kf0[0]) / span;
      const interp = kf0[1] + delta * ease(easing, u);
      const diff = interp - v;
      sumSqErr += diff * diff;
    }

    if (sumSqErr < minError) {
      minError = sumSqErr;
      bestEasing = easing;
    }
  }

  return bestEasing;
}

/**
 * Refines an extremum point to sub-frame accuracy using quadratic vertex interpolation.
 */
function refineExtremum(points, i) {
  if (i <= 0 || i >= points.length - 1) return [...points[i]];
  const p1 = points[i - 1];
  const p2 = points[i];
  const p3 = points[i + 1];

  const dt = p2[0] - p1[0];
  const v1 = p1[1];
  const v2 = p2[1];
  const v3 = p3[1];
  const denom = v1 - 2 * v2 + v3;

  if (Math.abs(denom) < 1e-5) return [...p2];

  const delta = (0.5 * (v1 - v3)) / denom;
  if (Math.abs(delta) > 1.0) return [...p2]; // Clamp to within 1 sample interval

  const tPeak = Number((p2[0] + delta * dt).toFixed(4));
  const vPeak = Number((v2 - (v1 - v3) ** 2 / (8 * denom)).toFixed(3));

  return [tPeak, vPeak];
}

/**
 * Compresses a dense time-series into sparse, easing-annotated keyframes.
 *
 * @param {number[]} times - Array of timestamps (seconds)
 * @param {number[]} values - Array of channel values
 * @param {object} options - Compression tolerances
 * @returns {Array<[number, number, string?]>} Compressed keyframe list
 */
export function compressChannel(times, values, options = {}) {
  if (!times || !values || times.length === 0) return [];
  if (times.length === 1) return [[times[0], values[0], 'linear']];

  const epsilon = options.epsilon ?? 0.8;
  const doFilter = options.filterJitter === true; // only filter if requested

  const processedValues = doFilter
    ? filterJitter(values, {
        windowSize: options.windowSize || 5,
        preserveEndpoints: true,
      })
    : values;

  const points = times.map((t, i) => [Number(t.toFixed(4)), Number(processedValues[i].toFixed(3))]);

  // Seed significant inflection points and extrema
  const keyIndices = [0];
  for (let i = 1; i < points.length - 1; i++) {
    const d1 = points[i][1] - points[i - 1][1];
    const d2 = points[i + 1][1] - points[i][1];
    if (d1 * d2 < 0 && (Math.abs(d1) >= 0.8 || Math.abs(d2) >= 0.8)) {
      // Sub-frame refine vertex
      points[i] = refineExtremum(points, i);
      keyIndices.push(i);
    }
  }
  if (keyIndices[keyIndices.length - 1] !== points.length - 1) {
    keyIndices.push(points.length - 1);
  }

  // Simplify each segment between extrema
  const finalKeys = [];
  for (let s = 0; s < keyIndices.length - 1; s++) {
    const i0 = keyIndices[s];
    const i1 = keyIndices[s + 1];
    const segKeys = simplifyEasingCurve(points, epsilon, i0, i1);

    if (finalKeys.length === 0) {
      finalKeys.push(...segKeys);
    } else {
      finalKeys.push(...segKeys.slice(1));
    }
  }

  return finalKeys;
}

/**
 * High-level decompiler from raw sampled animation frames into a clean ClipKit clip.
 *
 * @param {object} sampleData - Raw sampled animation from VRMA/GLB/BVH
 * @param {object} options - Options for inverse solving and compression
 * @returns {{ clip: object, telemetry: object }}
 */
export function decompileAnimation(sampleData, options = {}) {
  const {
    duration = 1.0,
    times = [],
    boneRotations = {},
    hipsTranslation = [],
    expressions = {},
    name = 'imported_clip',
  } = sampleData;

  const count = times.length;
  const rawChannels = {};

  // 1. Extract Root & Hip Translations
  if (hipsTranslation && hipsTranslation.length >= count) {
    const hipX = [];
    const hipY = [];
    const hipZ = [];
    for (let f = 0; f < count; f++) {
      const tr = hipsTranslation[f];
      hipX.push(tr[0]);
      hipY.push(tr[1]);
      hipZ.push(tr[2]);
    }
    rawChannels.hip_x = hipX;
    rawChannels.hip_y = hipY;
    rawChannels.hip_z = hipZ;
  }

  // 2. Spine & Hip Axis Decomposition
  if (boneRotations.Spine) {
    const lean = [];
    const sideLean = [];
    const twist = [];
    const hasSpineMulti = !!(boneRotations.Spine1 && boneRotations.Spine2);

    for (let f = 0; f < count; f++) {
      const euler0 = decomposeEulerXYZ(boneRotations.Spine[f]);
      const euler1 = boneRotations.Spine1 ? decomposeEulerXYZ(boneRotations.Spine1[f]) : null;
      const euler2 = boneRotations.Spine2 ? decomposeEulerXYZ(boneRotations.Spine2[f]) : null;

      if (hasSpineMulti) {
        // Multi-bone spine: total rotation is distributed across Spine (0.4), Spine1 (0.3), Spine2 (0.3)
        lean.push(euler0.pitch + euler1.pitch + euler2.pitch);
        sideLean.push(euler0.roll + euler1.roll + euler2.roll);
        twist.push(euler0.yaw + euler1.yaw + euler2.yaw);
      } else {
        // Single spine bone
        lean.push(euler0.pitch);
        sideLean.push(euler0.roll);
        twist.push(euler0.yaw);
      }
    }
    rawChannels.lean = lean;
    rawChannels.side_lean = sideLean;
    rawChannels.twist = twist;
  }

  if (boneRotations.Hips) {
    const hipPitch = [];
    const hipTwist = [];
    const hipRoll = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.Hips[f]);
      hipPitch.push(euler.pitch);
      hipTwist.push(euler.yaw);
      hipRoll.push(euler.roll);
    }
    rawChannels.hip_pitch = hipPitch;
    rawChannels.hip_twist = hipTwist;
    rawChannels.hip_roll = hipRoll;
  }

  // 3. Neck & Head
  if (boneRotations.Head || boneRotations.Neck) {
    const headPitch = [];
    const headYaw = [];
    for (let f = 0; f < count; f++) {
      const eNeck = boneRotations.Neck ? decomposeEulerXYZ(boneRotations.Neck[f]) : null;
      const eHead = boneRotations.Head ? decomposeEulerXYZ(boneRotations.Head[f]) : null;
      const p = (eNeck ? eNeck.pitch : 0) + (eHead ? eHead.pitch : 0);
      const y = (eNeck ? eNeck.yaw : 0) + (eHead ? eHead.yaw : 0);
      headPitch.push(p);
      headYaw.push(y);
    }
    rawChannels.head_pitch = headPitch;
    rawChannels.head_yaw = headYaw;
  }

  // 4. Arms (Aim Channels)
  if (boneRotations.LeftArm) {
    const elev = [];
    const azim = [];
    const roll = [];
    for (let f = 0; f < count; f++) {
      const q = boneRotations.LeftArm[f];
      const dir = qrot(q, [1, 0, 0]);
      const angles = solveAimAngles(dir, 1);
      elev.push(angles.elev);
      azim.push(angles.azim);
      roll.push(solveAimRoll(q, [1, 0, 0], angles.elev, angles.azim, 1));
    }
    rawChannels.armL_elev = elev;
    rawChannels.armL_azim = azim;
    rawChannels.armL_roll = roll;
  }

  if (boneRotations.RightArm) {
    const elev = [];
    const azim = [];
    const roll = [];
    for (let f = 0; f < count; f++) {
      const q = boneRotations.RightArm[f];
      const dir = qrot(q, [-1, 0, 0]);
      const angles = solveAimAngles(dir, -1);
      elev.push(angles.elev);
      azim.push(angles.azim);
      roll.push(solveAimRoll(q, [-1, 0, 0], angles.elev, angles.azim, -1));
    }
    rawChannels.armR_elev = elev;
    rawChannels.armR_azim = azim;
    rawChannels.armR_roll = roll;
  }

  // 5. Elbows (Local axis: [0, 1, 0], left sign: -1, right sign: +1)
  if (boneRotations.LeftForeArm) {
    const elbowL = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.LeftForeArm[f]);
      elbowL.push(-euler.yaw);
    }
    rawChannels.elbowL = elbowL;
  }

  if (boneRotations.RightForeArm) {
    const elbowR = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.RightForeArm[f]);
      elbowR.push(euler.yaw);
    }
    rawChannels.elbowR = elbowR;
  }

  // 6. Legs & Knees (Leg swing axis: [1, 0, 0] with sign: -1)
  if (boneRotations.LeftUpLeg) {
    const swing = [];
    const abd = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.LeftUpLeg[f]);
      swing.push(-euler.pitch);
      abd.push(euler.roll);
    }
    rawChannels.legL_swing = swing;
    rawChannels.legL_abd = abd;
  }

  if (boneRotations.RightUpLeg) {
    const swing = [];
    const abd = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.RightUpLeg[f]);
      swing.push(-euler.pitch);
      abd.push(-euler.roll);
    }
    rawChannels.legR_swing = swing;
    rawChannels.legR_abd = abd;
  }

  if (boneRotations.LeftLeg) {
    const kneeL = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.LeftLeg[f]);
      kneeL.push(euler.pitch);
    }
    rawChannels.kneeL = kneeL;
  }

  if (boneRotations.RightLeg) {
    const kneeR = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.RightLeg[f]);
      kneeR.push(euler.pitch);
    }
    rawChannels.kneeR = kneeR;
  }

  // 7. Feet (Pitch axis: [1, 0, 0] with sign: 1)
  if (boneRotations.LeftFoot) {
    const footL = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.LeftFoot[f]);
      footL.push(euler.pitch);
    }
    rawChannels.footL_pitch = footL;
  }

  if (boneRotations.RightFoot) {
    const footR = [];
    for (let f = 0; f < count; f++) {
      const euler = decomposeEulerXYZ(boneRotations.RightFoot[f]);
      footR.push(euler.pitch);
    }
    rawChannels.footR_pitch = footR;
  }

  // 8. Compress each channel into sparse keyframes
  const compressedChannels = {};
  let totalRawKeys = 0;
  let totalCompressedKeys = 0;
  let maxChannelError = 0;
  let sumChannelError = 0;
  let channelCount = 0;

  for (const [ch, vals] of Object.entries(rawChannels)) {
    totalRawKeys += vals.length;
    const kfs = compressChannel(times, vals, options);
    compressedChannels[ch] = kfs;
    totalCompressedKeys += kfs.length;

    // Calculate reconstruction error for this channel
    let chErr = 0;
    for (let i = 0; i < vals.length; i++) {
      const approx = sampleKeys(kfs, times[i]);
      chErr += Math.abs(approx - vals[i]);
    }
    const meanErr = chErr / Math.max(1, vals.length);
    if (meanErr > maxChannelError) maxChannelError = meanErr;
    sumChannelError += meanErr;
    channelCount++;
  }

  // 9. Compress expressions
  const compressedExpressions = {};
  for (const [exprName, vals] of Object.entries(expressions)) {
    if (Array.isArray(vals) && vals.length === count) {
      compressedExpressions[exprName] = compressChannel(times, vals, {
        ...options,
        epsilon: 0.05,
      });
    }
  }

  const reductionRatio =
    totalRawKeys > 0 ? Number(((1 - totalCompressedKeys / totalRawKeys) * 100).toFixed(1)) : 0;

  const avgAngularError =
    channelCount > 0 ? Number((sumChannelError / channelCount).toFixed(2)) : 0;

  const clip = {
    name,
    duration: Number(duration.toFixed(3)),
    channels: compressedChannels,
  };

  if (Object.keys(compressedExpressions).length > 0) {
    clip.expressions = compressedExpressions;
  }

  const telemetry = {
    totalRawKeys,
    totalCompressedKeys,
    reductionRatio,
    avgAngularError,
    maxChannelError: Number(maxChannelError.toFixed(2)),
  };

  return { clip, telemetry };
}

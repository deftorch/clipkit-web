import { sampleKeys } from '../animation/keyframes.js';
import { D2R, qinv, qrot, R2D } from '../math/quat.js';
import { vadd, vlen, vnorm, vsub } from '../math/vec3.js';
import { evalPose } from './pose-evaluator.js';
import { restPositions } from './rig-context.js';

/**
 * Canonical helper defining whether a foot is planted on the ground plane.
 * Shared between the foot-slide validation rule and the Foot IK solver.
 *
 * @param {object} clip - Animation clip object
 * @param {number} t - Timestamp in seconds
 * @param {string} side - 'Left' | 'Right' | 'kiri' | 'kanan'
 * @param {number|null} toeHeight - World Y coordinate of toe joint
 * @param {number} floorY - Ground plane height in meters
 * @param {number} contactThreshold - Height threshold above floor for contact
 * @returns {boolean}
 */
export function isFootPlanted(
  clip,
  t,
  side,
  toeHeight = null,
  floorY = 0,
  contactThreshold = 0.03,
) {
  const isLeft = side === 'Left' || side === 'kiri' || side === 'L';
  const win = isLeft ? clip?.windows?.planted_L : clip?.windows?.planted_R;

  if (win && Array.isArray(win) && win.length >= 2) {
    return t >= win[0] && t <= win[1];
  }

  if (toeHeight != null) {
    return toeHeight - floorY < contactThreshold;
  }

  return false;
}

/**
 * Solves analytical two-bone Inverse Kinematics for a humanoid leg.
 * Uses the closed-form Law of Cosines to calculate exact knee flexion and hip swing angles.
 * Supports optional bone offset vectors (offset1, offset2) for exact rest pose angle calibration.
 *
 * @param {object} params
 * @param {number[]} params.hipPos - World coordinates of hip joint [x, y, z]
 * @param {number[]} params.targetFootPos - Target world coordinates of ankle [x, y, z]
 * @param {number} params.l1 - Upper leg length (hip to knee)
 * @param {number} params.l2 - Lower leg length (knee to ankle)
 * @param {number[]} [params.offset1] - Rest offset vector of knee from hip
 * @param {number[]} [params.offset2] - Rest offset vector of foot from knee
 * @param {boolean} [params.isLeft=true] - Whether solving for left or right leg
 * @returns {{ kneeAngle: number, swingAngle: number, abdAngle: number, footPitch: number }}
 */
export function solveTwoBoneLegIK({
  hipPos,
  targetFootPos,
  l1,
  l2,
  offset1 = null,
  offset2 = null,
  isLeft = true,
}) {
  const actualL1 = offset1 ? vlen(offset1) : l1;
  const actualL2 = offset2 ? vlen(offset2) : l2;
  const th1_0 = offset1 ? Math.atan2(offset1[2], -offset1[1]) : 0;
  const th2_0 = offset2 ? Math.atan2(offset2[2], -offset2[1]) : 0;

  // Distance from hip to target foot
  const D = vsub(targetFootPos, hipPos);
  const dist = vlen(D);

  // Fully extended straight leg reach check
  if (dist >= actualL1 + actualL2) {
    const targetPitch = Math.atan2(D[2], -D[1]);
    const thighPitch = (targetPitch - th1_0) * R2D;
    const targetRoll = Math.atan2(D[0], -D[1]) * R2D;
    const abdAngle = isLeft ? targetRoll : -targetRoll;
    return {
      kneeAngle: 0,
      swingAngle: Number(thighPitch.toFixed(2)),
      abdAngle: Number(abdAngle.toFixed(2)),
      footPitch: Number(thighPitch.toFixed(2)),
    };
  }

  // Clamp distance to avoid numerical singularity in triangle inequalities
  const minReach = Math.abs(actualL1 - actualL2) + 1e-4;
  const d = Math.max(minReach, dist);

  // 1. Law of Cosines for Knee angle (beta)
  // cos(beta) = (l1^2 + l2^2 - d^2) / (2 * l1 * l2)
  const cosBeta = (actualL1 * actualL1 + actualL2 * actualL2 - d * d) / (2 * actualL1 * actualL2);
  const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
  const geomKnee = Math.PI - beta;
  const calibratedKnee = geomKnee + (th2_0 - th1_0);
  const kneeAngle = Math.max(0, calibratedKnee * R2D);

  // 2. Law of Cosines for Hip angle (alpha)
  // cos(alpha) = (l1^2 + d^2 - l2^2) / (2 * l1 * d)
  const cosAlpha = (actualL1 * actualL1 + d * d - actualL2 * actualL2) / (2 * actualL1 * d);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  // Target vector pitch in sagittal plane (Z: forward, Y: up, -Y: down)
  const targetPitch = Math.atan2(D[2], -D[1]);
  // Upper leg pitch rotated forward by alpha and calibrated against rest orientation
  const thighPitch = (targetPitch + alpha - th1_0) * R2D;

  // In ClipKit / Motus rig:
  // leg_swing sign is -1 (positive swings leg forward)
  const swingAngle = thighPitch;

  // Abduction in frontal plane (X vs -Y)
  // For Left leg (+X), positive roll moves leg toward +X
  // For Right leg (-X), negative roll moves leg toward -X
  const targetRoll = Math.atan2(D[0], -D[1]) * R2D;
  const abdAngle = isLeft ? targetRoll : -targetRoll;

  // Foot pitch counteracts thigh swing and knee flexion to keep sole horizontal
  const footPitch = swingAngle - kneeAngle;

  return {
    kneeAngle: Number(kneeAngle.toFixed(2)),
    swingAngle: Number(swingAngle.toFixed(2)),
    abdAngle: Number(abdAngle.toFixed(2)),
    footPitch: Number(footPitch.toFixed(2)),
  };
}

/**
 * Detects foot contact intervals from forward kinematics poses.
 *
 * @param {object} clip
 * @param {Array<object>} poses
 * @param {object} ctx
 * @param {number} floorY
 * @param {number} contactThreshold
 * @returns {{ left: number[][] | null, right: number[][] | null }}
 */
export function findPlantedWindows(clip, poses, ctx, floorY, contactThreshold = 0.03) {
  const FPS = 30;
  const dur = clip.duration;
  const I = ctx.idx;
  const res = { left: null, right: null };

  for (const [side, key] of [
    ['Left', 'left'],
    ['Right', 'right'],
  ]) {
    const ti = I[side + 'ToeBase'];
    let inContact = false;
    let startT = 0;
    const wins = [];

    for (let f = 0; f < poses.length; f++) {
      const t = Math.min(f / FPS, dur);
      const y = poses[f].pos[ti][1];
      const isPlanted = y - floorY < contactThreshold;

      if (isPlanted && !inContact) {
        inContact = true;
        startT = t;
      } else if (!isPlanted && inContact) {
        inContact = false;
        if (t - startT >= 0.08) {
          wins.push([Number(startT.toFixed(2)), Number(t.toFixed(2))]);
        }
      }
    }
    if (inContact && dur - startT >= 0.08) {
      wins.push([Number(startT.toFixed(2)), Number(dur.toFixed(2))]);
    }
    if (wins.length > 0) res[key] = wins[0];
  }

  return res;
}

/**
 * Applies analytic foot IK to an animation clip to firmly pin foot positions during contact.
 * Eliminates foot sliding artifacts and updates leg swing, knee, and foot pitch channels.
 *
 * @param {object} rig - Rig definition
 * @param {object} ctx - Rig context
 * @param {object} clip - Animation clip object
 * @param {object} [options={}]
 * @param {number} [options.blendWindow=0.05] - Blend-in / blend-out duration at contact transitions
 * @param {boolean} [options.autoPlanted=true] - Automatically populate clip.windows if missing
 * @returns {object} Modified clip with foot sliding resolved
 */
export function applyFootIK(rig, ctx, clip, options = {}) {
  const FPS = 30;
  const dur = clip.duration;
  const frames = Math.ceil(dur * FPS - 1e-9);
  const blendWindow = options.blendWindow != null ? options.blendWindow : 0.04;

  const I = ctx.idx;
  const restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  // Compute baseline poses
  const poses = [];
  for (let f = 0; f <= frames; f++) {
    const t = Math.min(f / FPS, dur);
    poses.push(evalPose(rig, ctx, clip, t));
  }

  // Determine planted intervals for Left and Right legs
  const detected = findPlantedWindows(clip, poses, ctx, floorY);
  const plantedL = clip.windows?.planted_L || (options.autoPlanted ? detected.left : null);
  const plantedR = clip.windows?.planted_R || (options.autoPlanted ? detected.right : null);

  if (!plantedL && !plantedR) {
    return JSON.parse(JSON.stringify(clip));
  }

  // Calculate bone lengths from rest pose offsets
  const leftHipIdx = I.LeftUpLeg;
  const leftKneeIdx = I.LeftLeg;
  const leftFootIdx = I.LeftFoot;
  const l1_L = vlen(ctx.offsets[leftKneeIdx]);
  const l2_L = vlen(ctx.offsets[leftFootIdx]);

  const rightHipIdx = I.RightUpLeg;
  const rightKneeIdx = I.RightLeg;
  const rightFootIdx = I.RightFoot;
  const l1_R = vlen(ctx.offsets[rightKneeIdx]);
  const l2_R = vlen(ctx.offsets[rightFootIdx]);

  const channels = JSON.parse(JSON.stringify(clip.channels || {}));

  // Helper to extract or generate keyframes for a channel
  const processLeg = (side, plantedWin, hipIdx, kneeIdx, footIdx) => {
    if (!plantedWin) return;
    const isLeft = side === 'Left';
    const prefix = isLeft ? 'legL' : 'legR';
    const kneeKey = isLeft ? 'kneeL' : 'kneeR';
    const footKey = isLeft ? 'footL_pitch' : 'footR_pitch';
    const swingKey = `${prefix}_swing`;

    const offset1 = ctx.offsets[kneeIdx];
    const offset2 = ctx.offsets[footIdx];
    const l1 = vlen(offset1);
    const l2 = vlen(offset2);

    const [t0, t1] = plantedWin;
    // Find initial contact frame
    const startFrame = Math.max(0, Math.floor(t0 * FPS));
    const plantAnklePos = poses[startFrame].pos[footIdx].slice();
    // Ensure toe does not penetrate floor
    const toeIdx = I[side + 'ToeBase'];
    const currentToeY = poses[startFrame].pos[toeIdx][1];
    if (currentToeY < floorY) {
      plantAnklePos[1] += floorY - currentToeY;
    }

    const abdKey = `${prefix}_abd`;
    const swingKeys = channels[swingKey] ? [...channels[swingKey]] : [[0, 0]];
    const abdKeys = channels[abdKey] ? [...channels[abdKey]] : [[0, 0]];
    const kneeKeys = channels[kneeKey] ? [...channels[kneeKey]] : [[0, 0]];
    const footKeys = channels[footKey] ? [...channels[footKey]] : [[0, 0]];

    const newSwingKeys = [];
    const newAbdKeys = [];
    const newKneeKeys = [];
    const newFootKeys = [];

    for (let f = 0; f <= frames; f++) {
      const t = Math.min(f / FPS, dur);
      const inContact = t >= t0 && t <= t1;
      const inBlendOut = t > t1 && t <= t1 + blendWindow && blendWindow > 0;

      if (inContact || inBlendOut) {
        // Evaluate hip position and parent (Hips) orientation
        const currentHipPos = poses[f].pos[hipIdx];
        const hipsRot = poses[f].delta[0];
        const D_world = vsub(plantAnklePos, currentHipPos);
        const D_local = qrot(qinv(hipsRot), D_world);

        const ik = solveTwoBoneLegIK({
          hipPos: [0, 0, 0],
          targetFootPos: D_local,
          l1,
          l2,
          offset1,
          offset2,
          isLeft,
        });

        // Compute hips pitch to keep foot horizontal in world space
        const fwd = qrot(hipsRot, [0, 0, 1]);
        const hipsPitch = Math.atan2(fwd[1], fwd[2]) * R2D;
        const flatFootPitch = Number((ik.footPitch + hipsPitch).toFixed(2));

        // Maintain 100% pin during contact; blend out smoothly during lift-off
        let w = 1.0;
        if (inBlendOut) {
          w = (t1 + blendWindow - t) / blendWindow;
        }

        const origSwing = sampleKeys(swingKeys, t);
        const origAbd = sampleKeys(abdKeys, t);
        const origKnee = sampleKeys(kneeKeys, t);
        const origFoot = sampleKeys(footKeys, t);

        const blendedSwing = Number((origSwing * (1 - w) + ik.swingAngle * w).toFixed(2));
        const blendedAbd = Number((origAbd * (1 - w) + ik.abdAngle * w).toFixed(2));
        const blendedKnee = Number((origKnee * (1 - w) + ik.kneeAngle * w).toFixed(2));
        const blendedFoot = Number((origFoot * (1 - w) + flatFootPitch * w).toFixed(2));

        newSwingKeys.push([Number(t.toFixed(4)), blendedSwing, 'linear']);
        newAbdKeys.push([Number(t.toFixed(4)), blendedAbd, 'linear']);
        newKneeKeys.push([Number(t.toFixed(4)), blendedKnee, 'linear']);
        newFootKeys.push([Number(t.toFixed(4)), blendedFoot, 'linear']);
      } else {
        newSwingKeys.push([Number(t.toFixed(4)), sampleKeys(swingKeys, t), 'linear']);
        newAbdKeys.push([Number(t.toFixed(4)), sampleKeys(abdKeys, t), 'linear']);
        newKneeKeys.push([Number(t.toFixed(4)), sampleKeys(kneeKeys, t), 'linear']);
        newFootKeys.push([Number(t.toFixed(4)), sampleKeys(footKeys, t), 'linear']);
      }
    }

    channels[swingKey] = newSwingKeys;
    channels[abdKey] = newAbdKeys;
    channels[kneeKey] = newKneeKeys;
    channels[footKey] = newFootKeys;
  };

  processLeg('Left', plantedL, leftHipIdx, leftKneeIdx, leftFootIdx);
  processLeg('Right', plantedR, rightHipIdx, rightKneeIdx, rightFootIdx);

  const outClip = {
    ...JSON.parse(JSON.stringify(clip)),
    channels,
  };

  outClip.windows = outClip.windows || {};
  if (plantedL && !outClip.windows.planted_L) outClip.windows.planted_L = plantedL;
  if (plantedR && !outClip.windows.planted_R) outClip.windows.planted_R = plantedR;

  return outClip;
}

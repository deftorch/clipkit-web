import { sampleKeys } from './keyframes.js';

/**
 * Standard anatomical hierarchy levels for kinetic chain propagation.
 * Energy flows from core mass (pelvis) outward to extremities (fingers).
 */
export const HIERARCHY_LEVELS = {
  PELVIS: 'pelvis',
  SPINE: 'spine',
  SHOULDERS: 'shoulders',
  WRISTS: 'wrists',
  FINGERS: 'fingers',
};

export const DEFAULT_PROPAGATION_DELAYS = {
  [HIERARCHY_LEVELS.PELVIS]: 0.0, // t0 + 0ms (Root / Pelvis)
  [HIERARCHY_LEVELS.SPINE]: 0.03, // t0 + 30ms (Spine / Chest / Thighs)
  [HIERARCHY_LEVELS.SHOULDERS]: 0.06, // t0 + 60ms (Shoulders / Neck / Knees)
  [HIERARCHY_LEVELS.WRISTS]: 0.1, // t0 + 100ms (Elbows / Wrists / Feet)
  [HIERARCHY_LEVELS.FINGERS]: 0.13, // t0 + 130ms (Fingers / Face)
};

export const CHANNEL_HIERARCHY_MAP = {
  // Level 0: Pelvis & Root motion
  hip_x: HIERARCHY_LEVELS.PELVIS,
  hip_y: HIERARCHY_LEVELS.PELVIS,
  hip_z: HIERARCHY_LEVELS.PELVIS,
  hip_pitch: HIERARCHY_LEVELS.PELVIS,
  hip_twist: HIERARCHY_LEVELS.PELVIS,
  hip_roll: HIERARCHY_LEVELS.PELVIS,

  // Level 1: Spine, Torso & Thighs
  lean: HIERARCHY_LEVELS.SPINE,
  side_lean: HIERARCHY_LEVELS.SPINE,
  twist: HIERARCHY_LEVELS.SPINE,
  legL_swing: HIERARCHY_LEVELS.SPINE,
  legL_abd: HIERARCHY_LEVELS.SPINE,
  legR_swing: HIERARCHY_LEVELS.SPINE,
  legR_abd: HIERARCHY_LEVELS.SPINE,

  // Level 2: Shoulders, Upper Arms, Neck & Knees
  head_pitch: HIERARCHY_LEVELS.SHOULDERS,
  head_yaw: HIERARCHY_LEVELS.SHOULDERS,
  armL_elev: HIERARCHY_LEVELS.SHOULDERS,
  armL_azim: HIERARCHY_LEVELS.SHOULDERS,
  armL_roll: HIERARCHY_LEVELS.SHOULDERS,
  armR_elev: HIERARCHY_LEVELS.SHOULDERS,
  armR_azim: HIERARCHY_LEVELS.SHOULDERS,
  armR_roll: HIERARCHY_LEVELS.SHOULDERS,
  kneeL: HIERARCHY_LEVELS.SHOULDERS,
  kneeR: HIERARCHY_LEVELS.SHOULDERS,

  // Level 3: Forearms, Elbows, Wrists, Feet & Face
  elbowL: HIERARCHY_LEVELS.WRISTS,
  elbowR: HIERARCHY_LEVELS.WRISTS,
  footL_pitch: HIERARCHY_LEVELS.WRISTS,
  footR_pitch: HIERARCHY_LEVELS.WRISTS,
  jaw_open: HIERARCHY_LEVELS.WRISTS,
  eye_yaw: HIERARCHY_LEVELS.WRISTS,
  eye_pitch: HIERARCHY_LEVELS.WRISTS,

  // Level 4: Digits (Fingers)
  thumbL: HIERARCHY_LEVELS.FINGERS,
  indexL: HIERARCHY_LEVELS.FINGERS,
  middleL: HIERARCHY_LEVELS.FINGERS,
  ringL: HIERARCHY_LEVELS.FINGERS,
  littleL: HIERARCHY_LEVELS.FINGERS,
  spreadL: HIERARCHY_LEVELS.FINGERS,
  thumbR: HIERARCHY_LEVELS.FINGERS,
  indexR: HIERARCHY_LEVELS.FINGERS,
  middleR: HIERARCHY_LEVELS.FINGERS,
  ringR: HIERARCHY_LEVELS.FINGERS,
  littleR: HIERARCHY_LEVELS.FINGERS,
  spreadR: HIERARCHY_LEVELS.FINGERS,
};

/**
 * Calculates damped sinusoidal overshoot offset at time offset dt.
 * deltaTheta(dt) = amplitude * exp(-damping * dt) * cos(2 * PI * freq * dt)
 */
export function calculateDampedOvershoot(amplitude, dt, damping = 12, frequency = 4.0) {
  if (dt < 0) return 0;
  return amplitude * Math.exp(-damping * dt) * Math.cos(2 * Math.PI * frequency * dt);
}

/**
 * Generates an organic 4-phase motion rhythm sequence:
 * Anticipation -> Acceleration -> Overshoot -> Settle
 */
export function generateRhythmKeyframes({
  startVal,
  targetVal,
  t0,
  t1,
  template = 'action',
  anticipationScale = 0.12,
  overshootScale = 0.1,
  damping = 14,
  frequency = 4.5,
}) {
  const span = Math.max(0.05, t1 - t0);
  const delta = targetVal - startVal;

  let aScale = anticipationScale;
  let oScale = overshootScale;
  let tAntiRatio = 0.2;
  let tAccelRatio = 0.65;
  let tOverRatio = 0.82;

  if (template === 'heavy') {
    aScale = 0.18;
    oScale = 0.05;
    tAntiRatio = 0.28;
    tAccelRatio = 0.72;
    tOverRatio = 0.88;
  } else if (template === 'snappy') {
    aScale = 0.08;
    oScale = 0.15;
    tAntiRatio = 0.14;
    tAccelRatio = 0.55;
    tOverRatio = 0.76;
  } else if (template === 'subtle') {
    aScale = 0.05;
    oScale = 0.04;
    tAntiRatio = 0.18;
    tAccelRatio = 0.65;
    tOverRatio = 0.82;
  }

  // Phase 1: Anticipation (movement in opposite direction)
  const tAnti = Number((t0 + span * tAntiRatio).toFixed(4));
  const vAnti = Number((startVal - delta * aScale).toFixed(4));

  // Phase 2: Rapid acceleration through strike/movement
  const tAccel = Number((t0 + span * tAccelRatio).toFixed(4));
  const vAccel = Number((startVal + delta * 0.75).toFixed(4));

  // Phase 3: Overshoot past target
  const tOver = Number((t0 + span * tOverRatio).toFixed(4));
  const vOver = Number((targetVal + delta * oScale).toFixed(4));

  // Phase 4: Settle at target
  const tEnd = Number(t1.toFixed(4));
  const vEnd = Number(targetVal.toFixed(4));

  return [
    [Number(t0.toFixed(4)), Number(startVal.toFixed(4)), 'inSine'],
    [tAnti, vAnti, 'inQuad'],
    [tAccel, vAccel, 'outQuad'],
    [tOver, vOver, 'inOutSine'],
    [tEnd, vEnd, 'inOutSine'],
  ];
}

/**
 * Shifts keyframes hierarchically based on anatomical depth.
 */
export function applyHierarchicalDelays(clip, options = {}) {
  const delays = {
    ...DEFAULT_PROPAGATION_DELAYS,
    ...(options.delays || {}),
  };
  const delayStep = options.delayStep ?? 0.03;
  const channelMap = options.channelMap || CHANNEL_HIERARCHY_MAP;
  const dur = clip.duration || 1.0;

  const resultChannels = {};

  for (const [ch, kfs] of Object.entries(clip.channels || {})) {
    if (!Array.isArray(kfs) || kfs.length === 0) {
      resultChannels[ch] = kfs;
      continue;
    }

    const level = channelMap[ch] || HIERARCHY_LEVELS.PELVIS;
    let offset = delays[level] ?? 0;
    if (options.delayScale != null) {
      offset *= options.delayScale;
    }

    if (offset <= 1e-4) {
      resultChannels[ch] = JSON.parse(JSON.stringify(kfs));
      continue;
    }

    // Shift keyframes forward by offset
    const shifted = [];
    const firstVal = kfs[0][1];

    // Always maintain initial keyframe at t=0
    shifted.push([0, firstVal, kfs[0][2] || 'linear']);

    const startIndex = Math.abs(kfs[0][0]) < 1e-4 ? 1 : 0;
    for (let i = startIndex; i < kfs.length; i++) {
      const origT = kfs[i][0];
      const val = kfs[i][1];
      const easing = kfs[i][2] || 'inOutSine';

      const newT = Number(Math.min(dur, origT + offset).toFixed(4));

      // Skip duplicate timestamp at 0
      if (newT > 1e-4) {
        shifted.push([newT, val, easing]);
      }
    }

    // Ensure final keyframe closes cleanly at clip duration
    const lastKey = shifted[shifted.length - 1];
    if (lastKey[0] < dur - 1e-4) {
      const finalVal = kfs[kfs.length - 1][1];
      shifted.push([dur, finalVal, 'linear']);
    }

    // Deduplicate any keys that collapsed onto the same timestamp
    const cleanKeys = [];
    for (const key of shifted) {
      if (cleanKeys.length > 0) {
        const prev = cleanKeys[cleanKeys.length - 1];
        if (Math.abs(prev[0] - key[0]) < 1e-4) {
          cleanKeys[cleanKeys.length - 1] = key;
          continue;
        }
      }
      cleanKeys.push(key);
    }

    resultChannels[ch] = cleanKeys;
  }

  return {
    ...clip,
    channels: resultChannels,
  };
}

/**
 * Appends organic decaying sinusoidal overshoot to settling keyframe transitions.
 */
export function applyDampedOvershoot(clip, options = {}) {
  const damping = options.damping ?? 12;
  const frequency = options.frequency ?? 4.0;
  const overshootScale = options.overshootScale ?? 0.08;
  const dur = clip.duration || 1.0;
  const targetLevels =
    options.targetLevels ||
    new Set([HIERARCHY_LEVELS.SHOULDERS, HIERARCHY_LEVELS.WRISTS, HIERARCHY_LEVELS.FINGERS]);

  const channelMap = options.channelMap || CHANNEL_HIERARCHY_MAP;
  const resultChannels = {};

  for (const [ch, kfs] of Object.entries(clip.channels || {})) {
    if (!Array.isArray(kfs) || kfs.length < 2) {
      resultChannels[ch] = kfs;
      continue;
    }

    const level = channelMap[ch] || HIERARCHY_LEVELS.PELVIS;
    if (!targetLevels.has(level)) {
      resultChannels[ch] = JSON.parse(JSON.stringify(kfs));
      continue;
    }

    const newKeys = [];
    for (let i = 0; i < kfs.length; i++) {
      const curKey = kfs[i];
      newKeys.push([...curKey]);

      // Check if this keyframe represents an arrival/stop
      const nextKey = kfs[i + 1];
      const prevKey = kfs[i - 1];

      if (prevKey && (!nextKey || nextKey[0] - curKey[0] >= 0.2)) {
        const incomingDelta = curKey[1] - prevKey[1];
        // If there is significant movement arriving here, calculate overshoot
        if (Math.abs(incomingDelta) >= 10) {
          const tStop = curKey[0];
          const availableSpan = nextKey ? nextKey[0] - tStop : dur - tStop;
          const settleDuration = Math.min(0.25, availableSpan * 0.8);

          if (settleDuration >= 0.08) {
            const peakOvershoot = incomingDelta * overshootScale;
            const tPeak = Number((tStop + settleDuration * 0.4).toFixed(4));
            const vPeak = Number((curKey[1] + peakOvershoot).toFixed(4));

            const tRebound = Number((tStop + settleDuration * 0.75).toFixed(4));
            const reboundOffset = calculateDampedOvershoot(
              peakOvershoot,
              settleDuration * 0.75,
              damping,
              frequency,
            );
            const vRebound = Number((curKey[1] + reboundOffset).toFixed(4));

            if (tPeak < (nextKey ? nextKey[0] : dur)) {
              newKeys.push([tPeak, vPeak, 'outQuad']);
            }
            if (tRebound < (nextKey ? nextKey[0] : dur) && tRebound > tPeak) {
              newKeys.push([tRebound, vRebound, 'inOutSine']);
            }
          }
        }
      }
    }

    // Sort and deduplicate
    newKeys.sort((a, b) => a[0] - b[0]);
    const deduped = [];
    for (const key of newKeys) {
      if (deduped.length > 0) {
        const prev = deduped[deduped.length - 1];
        if (Math.abs(prev[0] - key[0]) < 1e-4) {
          continue;
        }
      }
      deduped.push(key);
    }

    resultChannels[ch] = deduped;
  }

  return {
    ...clip,
    channels: resultChannels,
  };
}

/**
 * Main domain entry point for the Automated Overlap & Kinetic Chain Engine.
 * Non-destructively processes a ClipKit animation clip.
 */
export function applyOverlap(clip, options = {}) {
  if (!clip || typeof clip !== 'object') {
    throw new Error('Invalid clip supplied to applyOverlap');
  }

  let result = JSON.parse(JSON.stringify(clip));

  // 1. Hierarchical propagation delays (unless explicitly disabled)
  if (options.enablePropagation !== false) {
    result = applyHierarchicalDelays(result, options);
  }

  // 2. Damped oscillation overshoot on settling phases (unless explicitly disabled)
  if (options.enableOvershoot !== false) {
    result = applyDampedOvershoot(result, options);
  }

  if (result.name) {
    result.name = options.name || `${result.name}_overlap`;
  }

  return result;
}

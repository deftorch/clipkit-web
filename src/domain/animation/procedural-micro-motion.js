import { sampleKeys } from './keyframes.js';

/**
 * Creates a deterministic pseudo-random number generator using LCG algorithm.
 *
 * @param {number} seed
 * @returns {() => number} Returns float in [0, 1)
 */
export function createRng(seed = 42) {
  let s = Math.abs(seed | 0) || 42;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Applies procedural idle micro-dynamics (breathing, postural weight shifting, and eye saccades).
 *
 * @param {object} clip - Animation clip object
 * @param {object} [options={}]
 * @param {boolean} [options.breathing=true] - Apply thoracic breathing oscillation
 * @param {number} [options.breathFreq=0.23] - Breathing rate in Hz (~4.35s period)
 * @param {number} [options.breathAmp=0.75] - Breathing amplitude on lean in degrees
 * @param {boolean} [options.weightShift=true] - Apply subtle postural weight sway
 * @param {number} [options.swayFreq=0.08] - Weight shift rate in Hz (~12.5s period)
 * @param {number} [options.swayAmp=0.6] - Weight shift amplitude on hip roll in degrees
 * @param {boolean} [options.eyeSaccades=true] - Apply anticipatory eye saccades
 * @param {number} [options.seed=42] - PRNG seed for deterministic output
 * @param {number} [options.fps=30] - Sampling rate in frames per second
 * @returns {object} New clip with procedural micro-dynamics applied
 */
export function applyMicroDynamics(clip, options = {}) {
  const dur = clip.duration || 1;
  const isLoop = !!clip.loop;
  const FPS = options.fps || 30;
  const frames = Math.ceil(dur * FPS - 1e-9);
  const rng = createRng(options.seed ?? 42);

  const enableBreathing = options.breathing !== false;
  const enableWeightShift = options.weightShift !== false;
  const enableSaccades = options.eyeSaccades !== false;

  // Harmonize frequencies if loop is true to guarantee zero jump between ends
  const rawBreathFreq = options.breathFreq ?? 0.23;
  const breathFreq = isLoop ? Math.max(1, Math.round(rawBreathFreq * dur)) / dur : rawBreathFreq;
  const breathAmp = options.breathAmp ?? 0.75;
  const armBreathAmp = options.armBreathAmp ?? 0.4;

  const rawSwayFreq = options.swayFreq ?? 0.08;
  const swayFreq = isLoop ? Math.max(1, Math.round(rawSwayFreq * dur)) / dur : rawSwayFreq;
  const swayAmp = options.swayAmp ?? 0.6;

  const channels = JSON.parse(JSON.stringify(clip.channels || {}));
  const expressions = JSON.parse(JSON.stringify(clip.expressions || {}));

  // Helper to modulate an existing channel
  const modulateChannel = (chName, computeDelta) => {
    const existing = channels[chName] ? [...channels[chName]] : [[0, 0]];
    const newKeys = [];

    for (let f = 0; f <= frames; f++) {
      const t = Math.min(f / FPS, dur);
      const baseVal = sampleKeys(existing, t);
      const delta = computeDelta(t);
      newKeys.push([Number(t.toFixed(4)), Number((baseVal + delta).toFixed(3)), 'linear']);
    }

    channels[chName] = newKeys;
  };

  // 1. Thoracic breathing oscillation (pitch on lean, subtle elevation on arms)
  if (enableBreathing) {
    // Inhale leans slightly backward/chest rises, exhale leans forward
    modulateChannel('lean', (t) => {
      return -breathAmp * Math.sin(2 * Math.PI * breathFreq * t);
    });

    modulateChannel('armL_elev', (t) => {
      return armBreathAmp * Math.sin(2 * Math.PI * breathFreq * t);
    });

    modulateChannel('armR_elev', (t) => {
      return armBreathAmp * Math.sin(2 * Math.PI * breathFreq * t);
    });
  }

  // 2. Postural weight shift (lateral sway on hip_roll and compensating side_lean)
  if (enableWeightShift) {
    modulateChannel('hip_roll', (t) => {
      return swayAmp * Math.sin(2 * Math.PI * swayFreq * t);
    });

    // Invert side_lean to keep head and shoulders stabilized
    modulateChannel('side_lean', (t) => {
      return -swayAmp * 0.75 * Math.sin(2 * Math.PI * swayFreq * t);
    });
  }

  // 3. Anticipatory eye saccades (micro eye movements)
  if (enableSaccades) {
    const saccadeInterval = 1.8;
    const saccadeCount = Math.floor(dur / saccadeInterval);

    if (saccadeCount > 0 || dur >= 1.0) {
      const lookLeftKeys = expressions.lookLeft ? [...expressions.lookLeft] : [[0, 0]];
      const lookRightKeys = expressions.lookRight ? [...expressions.lookRight] : [[0, 0]];
      const newLookLeft = [];
      const newLookRight = [];

      let curT = 0.5 + rng() * 0.5;
      const saccades = [];

      while (curT < dur - 0.3) {
        const dir = rng() > 0.5 ? 'left' : 'right';
        const intensity = 0.2 + rng() * 0.35;
        const sDur = 0.12 + rng() * 0.08;
        saccades.push({ t0: curT, t1: curT + sDur, dir, intensity });
        curT += 1.4 + rng() * 1.2;
      }

      for (let f = 0; f <= frames; f++) {
        const t = Math.min(f / FPS, dur);
        let leftVal = sampleKeys(lookLeftKeys, t);
        let rightVal = sampleKeys(lookRightKeys, t);

        for (const s of saccades) {
          if (t >= s.t0 && t <= s.t1) {
            const u = (t - s.t0) / (s.t1 - s.t0);
            const w = Math.sin(Math.PI * u) * s.intensity;
            if (s.dir === 'left') leftVal = Math.min(1, leftVal + w);
            else rightVal = Math.min(1, rightVal + w);
          }
        }

        newLookLeft.push([Number(t.toFixed(4)), Number(leftVal.toFixed(3)), 'linear']);
        newLookRight.push([Number(t.toFixed(4)), Number(rightVal.toFixed(3)), 'linear']);
      }

      expressions.lookLeft = newLookLeft;
      expressions.lookRight = newLookRight;
    }
  }

  return {
    ...JSON.parse(JSON.stringify(clip)),
    channels,
    expressions,
  };
}

import { evalPose } from '../rig/pose-evaluator.js';

/**
 * Computes fighting game style combat frame data, timing windows,
 * and hitbox anchor distal velocity.
 *
 * @param {object} rig - Rig definition
 * @param {object} ctx - Rig context
 * @param {object} clip - Animation clip object
 * @param {object} [options={}]
 * @param {number} [options.fps=60] - Target frame rate for frame data (default: 60)
 * @returns {object|null}
 */
export function computeCombatFrameData(rig, ctx, clip, options = {}) {
  const fps = options.fps || 60;
  const dur = clip.duration || 1.0;
  const totalFrames = Math.round(dur * fps);

  const wins = clip.windows || {};
  const activeWin = wins.hitbox || wins.active;

  if (!activeWin && !options.force && !clip.claims?.combat) {
    return null;
  }

  const [t0, t1] = activeWin || [0, dur];
  const startupFrames = Math.max(0, Math.round(t0 * fps));
  const activeFrames = Math.max(1, Math.round((t1 - t0) * fps));
  const recoveryFrames = Math.max(0, totalFrames - startupFrames - activeFrames);

  // Determine likely anchor bone for hitbox
  let anchor = clip.hitbox_joint || clip.claims?.hitbox_bone;
  if (!anchor) {
    const ch = clip.channels || {};
    if (ch.elbowR || ch.armR_elev || ch.armR_azim) {
      anchor = 'RightHand';
    } else if (ch.elbowL || ch.armL_elev || ch.armL_azim) {
      anchor = 'LeftHand';
    } else if (ch.kneeR || ch.legR_swing) {
      anchor = 'RightFoot';
    } else if (ch.kneeL || ch.legL_swing) {
      anchor = 'LeftFoot';
    } else {
      anchor = 'RightHand';
    }
  }

  const anchorIdx = ctx.idx[anchor];
  let peakSpeed = 0;
  let peakSpeedT = t0;

  if (anchorIdx != null) {
    const sampleFps = 60;
    const sampleStep = 1 / sampleFps;
    const endT = Math.min(dur, t1);
    for (let t = t0; t <= endT; t += sampleStep) {
      const p1 = evalPose(rig, ctx, clip, t);
      const nextT = Math.min(t + sampleStep, dur);
      if (nextT <= t) break;
      const p2 = evalPose(rig, ctx, clip, nextT);
      const pos1 = p1.pos[anchorIdx];
      const pos2 = p2.pos[anchorIdx];
      if (pos1 && pos2) {
        const dist = Math.hypot(pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2]);
        const speed = dist / (nextT - t);
        if (speed > peakSpeed) {
          peakSpeed = speed;
          peakSpeedT = t;
        }
      }
    }
  }

  return {
    fps,
    totalFrames,
    durationSec: Number(dur.toFixed(3)),
    frameData: {
      startup: startupFrames,
      active: activeFrames,
      recovery: recoveryFrames,
      notation: `${startupFrames}-${activeFrames}-${recoveryFrames}`,
    },
    windows: {
      hitbox: activeWin || null,
      cancel: wins.cancel || null,
      parry: wins.parry || null,
      invulnerable: wins.inv || null,
    },
    hitboxAnchor: {
      joint: anchor,
      peakSpeed_ms: Number(peakSpeed.toFixed(2)),
      peakSpeed_t: Number(peakSpeedT.toFixed(3)),
    },
  };
}

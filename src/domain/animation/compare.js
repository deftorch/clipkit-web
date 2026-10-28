import { qangle, R2D } from '../math/quat.js';
import { evalPose } from '../rig/pose-evaluator.js';
import { restPositions } from '../rig/rig-context.js';
import { validate } from '../validation/validator.js';
import { FPS } from '../validation/vrm10/constants.js';

/**
 * Computes essential physical and kinematic metrics for an animation clip.
 */
export function computeClipMetrics(rig, ctx, limits, clip, style = 'stylized') {
  const dur = clip.duration || 1.0;
  const frames = Math.ceil(dur * FPS - 1e-9);
  const tAt = (f) => Math.min(f / FPS, dur);

  const poses = [];
  for (let f = 0; f <= frames; f++) {
    poses.push(evalPose(rig, ctx, clip, tAt(f)));
  }

  const I = ctx.idx;
  const restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  // 1. Root travel
  const p0 = poses[0].pos[I.Hips];
  const pEnd = poses[frames].pos[I.Hips];
  const rootTravel = Number(
    Math.hypot(pEnd[0] - p0[0], pEnd[1] - p0[1], pEnd[2] - p0[2]).toFixed(4),
  );

  // 2. Airtime (duration where both feet are off the floor)
  let airFrames = 0;
  const footThreshold = floorY + 0.02; // 2cm above floor
  for (let f = 0; f <= frames; f++) {
    const lY = poses[f].pos[I.LeftToeBase][1];
    const rY = poses[f].pos[I.RightToeBase][1];
    if (lY > footThreshold && rY > footThreshold) {
      airFrames++;
    }
  }
  const airtime = Number(((airFrames / (frames + 1)) * dur).toFixed(4));

  // 3. Peak angular speeds (overall & per joint)
  let peakSpeed = 0;
  let peakJoint = '';
  const jointSpeeds = {};

  for (let i = 0; i < ctx.n; i++) {
    const jName = ctx.names[i];
    let jPeak = 0;
    for (let f = 1; f <= frames; f++) {
      const s = qangle(poses[f - 1].local[i], poses[f].local[i]) * R2D * FPS;
      if (s > jPeak) jPeak = s;
      if (s > peakSpeed) {
        peakSpeed = s;
        peakJoint = jName;
      }
    }
    jointSpeeds[jName] = Number(jPeak.toFixed(2));
  }

  // 4. Validation issues
  const valResult = validate(rig, ctx, limits, clip, style);

  return {
    name: clip.name || 'unnamed',
    duration: dur,
    rootTravel,
    airtime,
    peakAngularSpeed: Number(peakSpeed.toFixed(2)),
    peakJoint,
    jointSpeeds,
    issues: {
      fail: valResult.fail,
      warn: valResult.warn,
    },
  };
}

/**
 * Compares two clips and calculates metric differences.
 */
export function compareClips(rig, ctx, limits, clipA, clipB, style = 'stylized') {
  const metricsA = computeClipMetrics(rig, ctx, limits, clipA, style);
  const metricsB = computeClipMetrics(rig, ctx, limits, clipB, style);

  const jointDiffs = {};
  for (const jName of ctx.names) {
    const spA = metricsA.jointSpeeds[jName] || 0;
    const spB = metricsB.jointSpeeds[jName] || 0;
    jointDiffs[jName] = Number((spB - spA).toFixed(2));
  }

  const diff = {
    duration: Number((metricsB.duration - metricsA.duration).toFixed(4)),
    rootTravel: Number((metricsB.rootTravel - metricsA.rootTravel).toFixed(4)),
    airtime: Number((metricsB.airtime - metricsA.airtime).toFixed(4)),
    peakAngularSpeed: Number((metricsB.peakAngularSpeed - metricsA.peakAngularSpeed).toFixed(2)),
    jointSpeeds: jointDiffs,
    failCount: metricsB.issues.fail - metricsA.issues.fail,
    warnCount: metricsB.issues.warn - metricsA.issues.warn,
  };

  return {
    clipA: metricsA.name,
    clipB: metricsB.name,
    metricsA,
    metricsB,
    diff,
  };
}

import { describe, expect, it } from 'vitest';
import {
  calculateFlexionAngle,
  compressChannel,
  decompileAnimation,
  decomposeEulerXYZ,
  filterJitter,
  fitBestEasing,
  rdpSimplify,
  solveAimAngles,
  solveAimRoll,
} from '../src/domain/animation/inverse-solver.js';
import { D2R, qarc, qaxis, qmul, qnorm, qrot } from '../src/domain/math/quat.js';

describe('Inverse Semantic Solver & Keyframe Compressor (Phase 4)', () => {
  it('solveAimAngles correctly recovers elevation and azimuth from 3D direction vector', () => {
    // Left arm pointed directly forward: elev=0, azim=90 deg
    const fwdLeft = [0, 0, 1];
    const leftAngles = solveAimAngles(fwdLeft, 1);
    expect(leftAngles.elev).toBeCloseTo(0, 1);
    expect(leftAngles.azim).toBeCloseTo(90, 1);

    // Right arm pointed directly upward: elev=90 deg
    const upRight = [0, 1, 0];
    const rightUp = solveAimAngles(upRight, -1);
    expect(rightUp.elev).toBeCloseTo(90, 1);

    // Left arm pointed 45 degrees up and 30 degrees forward
    const el = 45 * D2R;
    const az = 30 * D2R;
    const dir = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
    const recovered = solveAimAngles(dir, 1);
    expect(recovered.elev).toBeCloseTo(45, 1);
    expect(recovered.azim).toBeCloseTo(30, 1);
  });

  it('solveAimRoll extracts axial twist angle around bone direction', () => {
    const el = 0;
    const az = 0;
    const restDir = [1, 0, 0];
    const rollAngle = 35 * D2R;

    // Bone with only roll around restDir
    const qRoll = qaxis(restDir, rollAngle);
    const recoveredRoll = solveAimRoll(qRoll, restDir, el, az, 1);
    expect(recoveredRoll).toBeCloseTo(35, 1);
  });

  it('decomposeEulerXYZ extracts pitch, yaw, and roll', () => {
    const qPitch = qaxis([1, 0, 0], 25 * D2R);
    const euler = decomposeEulerXYZ(qPitch);
    expect(euler.pitch).toBeCloseTo(25, 1);
    expect(euler.yaw).toBeCloseTo(0, 1);
    expect(euler.roll).toBeCloseTo(0, 1);
  });

  it('calculateFlexionAngle calculates bend between limbs', () => {
    const upper = [0, -1, 0];
    const lower = [0, 0, 1]; // 90 degree bend
    const bend = calculateFlexionAngle(upper, lower);
    expect(bend).toBeCloseTo(90, 1);
  });

  it('filterJitter suppresses sensor noise with zero phase lag', () => {
    // Generate noisy sine wave
    const n = 50;
    const clean = [];
    const noisy = [];
    for (let i = 0; i < n; i++) {
      const v = 20 * Math.sin((i / 50) * Math.PI * 2);
      clean.push(v);
      const noise = (i % 2 === 0 ? 1 : -1) * 3.0; // +/- 3 deg jitter
      noisy.push(v + noise);
    }

    const smoothed = filterJitter(noisy, { windowSize: 5 });
    expect(smoothed.length).toBe(n);

    // Variance to clean signal should be lower on smoothed than on noisy
    let noisyErr = 0;
    let smoothedErr = 0;
    for (let i = 2; i < n - 2; i++) {
      noisyErr += Math.abs(noisy[i] - clean[i]);
      smoothedErr += Math.abs(smoothed[i] - clean[i]);
    }
    expect(smoothedErr).toBeLessThan(noisyErr * 0.7);
  });

  it('rdpSimplify and fitBestEasing reduce dense samples into sparse keyframes', () => {
    // Generate a smooth transition from 0 to 45 over 30 frames (1 second)
    const times = [];
    const values = [];
    for (let f = 0; f <= 30; f++) {
      const t = f / 30;
      times.push(t);
      // inOutSine curve
      const u = 0.5 * (1 - Math.cos(Math.PI * t));
      values.push(45 * u);
    }

    const compressed = compressChannel(times, values, { epsilon: 0.5 });

    // Should compress 31 dense samples into 3 to 5 keyframes
    expect(compressed.length).toBeLessThanOrEqual(5);
    expect(compressed[0][0]).toBe(0);
    expect(compressed[0][1]).toBeCloseTo(0, 1);
    expect(compressed[compressed.length - 1][0]).toBe(1);
    expect(compressed[compressed.length - 1][1]).toBeCloseTo(45, 1);
  });

  it('decompileAnimation generates complete ClipKit clip with telemetry report', () => {
    const count = 31;
    const times = [];
    const armR = [];
    const spine = [];

    for (let i = 0; i < count; i++) {
      const t = i / 30;
      times.push(t);
      // Arm raising
      const elev = -70 + 100 * t;
      armR.push(qaxis([0, 0, 1], elev * D2R));
      // Spine twist
      const tw = 15 * Math.sin(t * Math.PI);
      spine.push(qaxis([0, 1, 0], tw * D2R));
    }

    const { clip, telemetry } = decompileAnimation({
      duration: 1.0,
      times,
      boneRotations: {
        RightArm: armR,
        Spine: spine,
      },
      hipsTranslation: times.map(() => [0, 0, 0]),
      name: 'decompiled_test',
    });

    expect(clip).toBeDefined();
    expect(clip.name).toBe('decompiled_test');
    expect(clip.duration).toBe(1.0);
    expect(clip.channels.armR_elev).toBeDefined();
    expect(clip.channels.twist).toBeDefined();

    // Telemetry assertions
    expect(telemetry.totalRawKeys).toBeGreaterThan(50);
    expect(telemetry.totalCompressedKeys).toBeLessThan(telemetry.totalRawKeys);
    expect(telemetry.reductionRatio).toBeGreaterThan(60); // > 60% sample reduction
    expect(telemetry.avgAngularError).toBeLessThan(3.5); // <= 3.5 deg loss budget
  });
});

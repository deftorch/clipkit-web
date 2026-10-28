import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import limits from '../src/data/limits.json';
import { loadRigs } from '../src/data/load-rigs.js';
import { composeClips } from '../src/domain/animation/compose.js';
import {
  applyDampedOvershoot,
  applyHierarchicalDelays,
  applyOverlap,
  calculateDampedOvershoot,
  DEFAULT_PROPAGATION_DELAYS,
  generateRhythmKeyframes,
  HIERARCHY_LEVELS,
} from '../src/domain/animation/overlap-processor.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import { validate } from '../src/domain/validation/validator.js';

describe('Overlap & Kinetic Chain Engine (Milestone 5)', () => {
  it('calculateDampedOvershoot produces decaying harmonic oscillation', () => {
    const amp = 10;
    const v0 = calculateDampedOvershoot(amp, 0.0, 12, 4);
    expect(v0).toBeCloseTo(10, 1);

    // After 0.25s (with decay factor 12), amplitude should decay significantly
    const vLater = calculateDampedOvershoot(amp, 0.25, 12, 4);
    expect(Math.abs(vLater)).toBeLessThan(Math.abs(v0) * 0.1);

    // After 0.5s, should be nearly zero
    const vEnd = calculateDampedOvershoot(amp, 0.5, 12, 4);
    expect(Math.abs(vEnd)).toBeLessThan(0.1);
  });

  it('generateRhythmKeyframes implements 4-phase Anticipation -> Acceleration -> Overshoot -> Settle', () => {
    const kfs = generateRhythmKeyframes({
      startVal: 0,
      targetVal: 50,
      t0: 0,
      t1: 1.0,
      template: 'action',
      anticipationScale: 0.1,
      overshootScale: 0.08,
    });

    expect(kfs.length).toBe(5);

    // Phase 0: Start
    expect(kfs[0][0]).toBe(0);
    expect(kfs[0][1]).toBe(0);

    // Phase 1: Anticipation (value dips negative before moving positive)
    expect(kfs[1][0]).toBeGreaterThan(0);
    expect(kfs[1][0]).toBeLessThan(0.3);
    expect(kfs[1][1]).toBeLessThan(0); // Dips below 0!

    // Phase 2: Rapid acceleration through majority of motion
    expect(kfs[2][0]).toBeGreaterThan(kfs[1][0]);
    expect(kfs[2][1]).toBeGreaterThan(30);

    // Phase 3: Overshoot past 50
    expect(kfs[3][0]).toBeGreaterThan(kfs[2][0]);
    expect(kfs[3][1]).toBeGreaterThan(50); // Overshoots target!

    // Phase 4: Settle at exactly 50
    expect(kfs[4][0]).toBe(1.0);
    expect(kfs[4][1]).toBe(50);
  });

  it('applyHierarchicalDelays propagates timing offsets based on anatomical depth', () => {
    const testClip = {
      name: 'test_chain',
      duration: 1.0,
      channels: {
        hip_pitch: [
          [0, 0],
          [0.4, 20],
          [0.8, 0],
        ],
        lean: [
          [0, 0],
          [0.4, 20],
          [0.8, 0],
        ],
        armR_elev: [
          [0, 0],
          [0.4, 20],
          [0.8, 0],
        ],
        elbowR: [
          [0, 0],
          [0.4, 20],
          [0.8, 0],
        ],
        indexR: [
          [0, 0],
          [0.4, 20],
          [0.8, 0],
        ],
      },
    };

    const delayed = applyHierarchicalDelays(testClip);

    // Initial keyframe at t=0 must be preserved for all channels
    for (const [ch, keys] of Object.entries(delayed.channels)) {
      expect(keys[0][0]).toBe(0);
      expect(keys[0][1]).toBe(0);
    }

    // Pelvis (hip_pitch) has 0ms offset
    expect(delayed.channels.hip_pitch[1][0]).toBeCloseTo(0.4, 3);

    // Spine (lean) has 30ms offset
    expect(delayed.channels.lean[1][0]).toBeCloseTo(
      0.4 + DEFAULT_PROPAGATION_DELAYS[HIERARCHY_LEVELS.SPINE],
      3,
    );

    // Shoulders/Arm (armR_elev) has 60ms offset
    expect(delayed.channels.armR_elev[1][0]).toBeCloseTo(
      0.4 + DEFAULT_PROPAGATION_DELAYS[HIERARCHY_LEVELS.SHOULDERS],
      3,
    );

    // Forearm/Wrist (elbowR) has 100ms offset
    expect(delayed.channels.elbowR[1][0]).toBeCloseTo(
      0.4 + DEFAULT_PROPAGATION_DELAYS[HIERARCHY_LEVELS.WRISTS],
      3,
    );

    // Fingers (indexR) has 130ms offset
    expect(delayed.channels.indexR[1][0]).toBeCloseTo(
      0.4 + DEFAULT_PROPAGATION_DELAYS[HIERARCHY_LEVELS.FINGERS],
      3,
    );
  });

  it('applyDampedOvershoot adds settling oscillations to distal joints', () => {
    const testClip = {
      name: 'punch_stop',
      duration: 1.0,
      channels: {
        armR_elev: [
          [0, -70],
          [0.3, 40],
          [1.0, 40],
        ],
        elbowR: [
          [0, 0],
          [0.3, 90],
          [1.0, 90],
        ],
      },
    };

    const withOvershoot = applyDampedOvershoot(testClip, {
      overshootScale: 0.1,
    });

    // elbowR should receive overshoot keyframe past 90 degrees around t=0.35s
    const elbowKeys = withOvershoot.channels.elbowR;
    expect(elbowKeys.length).toBeGreaterThan(testClip.channels.elbowR.length);

    const maxVal = Math.max(...elbowKeys.map((k) => k[1]));
    expect(maxVal).toBeGreaterThan(90); // Overshot past 90 degrees!
  });

  it('applyOverlap processes full clips non-destructively and passes validation', () => {
    const { motus } = loadRigs();
    const ctx = makeCtx(motus);
    const slash = defaultClips.slash;

    const overlapped = applyOverlap(slash, {
      delayStep: 0.03,
      damping: 14,
      overshootScale: 0.06,
    });

    expect(overlapped).toBeDefined();
    expect(overlapped.name).toBe('slash_overlap');
    expect(overlapped.duration).toBe(slash.duration);

    // Ensure original clip was not mutated
    expect(slash.name).toBe('slash');

    const valResult = validate(motus, ctx, limits, overlapped, 'stylized');
    expect(valResult.fail).toBe(0);
  });

  it('composeClips applies overlap as a layer effect', () => {
    const base = {
      name: 'base_jump',
      duration: 1.0,
      channels: {
        hip_y: [
          [0, 0.9],
          [0.5, 1.4],
          [1.0, 0.9],
        ],
      },
    };

    const punchLayer = {
      ref: 'punch',
      clip: {
        name: 'punch',
        duration: 0.8,
        channels: {
          armR_elev: [
            [0, -70],
            [0.3, 30],
            [0.8, -70],
          ],
        },
      },
      effect: 'overlap',
      mode: 'override',
    };

    const { clip: composed, warnings } = composeClips(base, [punchLayer]);
    expect(composed.channels.armR_elev).toBeDefined();
    expect(composed.channels.armR_elev.length).toBeGreaterThan(0);
    expect(warnings.length).toBe(0);
  });
});

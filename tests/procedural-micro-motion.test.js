import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import { applyMicroDynamics, createRng } from '../src/domain/animation/procedural-micro-motion.js';

describe('Procedural Micro-Motion & Idle Dynamics (Milestone 7)', () => {
  it('generates identical deterministic random sequences with the same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const s1 = [rng1(), rng1(), rng1(), rng1()];
    const s2 = [rng2(), rng2(), rng2(), rng2()];
    expect(s1).toEqual(s2);
  });

  it('applies thoracic breathing oscillation to lean and arms', () => {
    const baseClip = defaultClips.idle;
    const modulated = applyMicroDynamics(baseClip, {
      breathing: true,
      weightShift: false,
      eyeSaccades: false,
      breathAmp: 1.0,
    });

    expect(modulated).toBeDefined();
    expect(modulated.channels.lean).toBeDefined();
    expect(modulated.channels.armL_elev).toBeDefined();
    expect(modulated.channels.armR_elev).toBeDefined();

    // Verify lean keys have smooth oscillation
    const leanKeys = modulated.channels.lean;
    expect(leanKeys.length).toBeGreaterThan(10);
    const vals = leanKeys.map((k) => k[1]);
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    expect(maxVal - minVal).toBeGreaterThan(1.0);
  });

  it('applies postural weight shifting on hip_roll and side_lean', () => {
    const baseClip = defaultClips.idle;
    const modulated = applyMicroDynamics(baseClip, {
      breathing: false,
      weightShift: true,
      eyeSaccades: false,
      swayAmp: 0.8,
    });

    expect(modulated.channels.hip_roll).toBeDefined();
    expect(modulated.channels.side_lean).toBeDefined();

    const rollKeys = modulated.channels.hip_roll;
    expect(rollKeys.length).toBeGreaterThan(10);
  });

  it('generates anticipatory eye saccades within valid expression range [0, 1]', () => {
    const baseClip = defaultClips.idle;
    const modulated = applyMicroDynamics(baseClip, {
      breathing: false,
      weightShift: false,
      eyeSaccades: true,
      seed: 123,
    });

    expect(modulated.expressions.lookLeft).toBeDefined();
    expect(modulated.expressions.lookRight).toBeDefined();

    for (const key of modulated.expressions.lookLeft) {
      expect(key[1]).toBeGreaterThanOrEqual(0);
      expect(key[1]).toBeLessThanOrEqual(1);
    }
  });

  it('guarantees seamless loop continuity when clip.loop is true', () => {
    const baseClip = {
      ...defaultClips.idle,
      loop: true,
    };
    const modulated = applyMicroDynamics(baseClip, {
      breathing: true,
      weightShift: true,
      eyeSaccades: false,
    });

    const leanKeys = modulated.channels.lean;
    const firstLean = leanKeys[0][1];
    const lastLean = leanKeys[leanKeys.length - 1][1];
    expect(Math.abs(firstLean - lastLean)).toBeLessThan(0.05);

    const rollKeys = modulated.channels.hip_roll;
    const firstRoll = rollKeys[0][1];
    const lastRoll = rollKeys[rollKeys.length - 1][1];
    expect(Math.abs(firstRoll - lastRoll)).toBeLessThan(0.05);
  });
});

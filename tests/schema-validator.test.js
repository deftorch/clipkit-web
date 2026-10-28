import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import { loadRigs } from '../src/data/load-rigs.js';
import {
  findClosestChannel,
  levenshtein,
  validateSchema,
} from '../src/domain/validation/schema-validator.js';

describe('Schema Validator & Channel Suggestions', () => {
  const { motus } = loadRigs();

  it('computes Levenshtein string distance correctly', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('neck_pitch', 'head_pitch')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
  });

  it('suggests closest valid channel names including aliases', () => {
    const valid = Object.keys(motus.channels);
    expect(findClosestChannel('neck_pitch', valid)).toBe('head_pitch');
    expect(findClosestChannel('legL_flex', valid)).toBe('legL_swing');
    expect(findClosestChannel('knee_flex_L', valid)).toBe('kneeL');
    expect(findClosestChannel('hip_x_pos', valid)).toBe('hip_x');
  });

  it('validates default clips successfully with zero schema errors', () => {
    for (const [name, clip] of Object.entries(defaultClips)) {
      const res = validateSchema(clip, motus);
      expect(res.valid, `Clip ${name} should have valid schema`).toBe(true);
      expect(res.errors.length).toBe(0);
    }
  });

  it('rejects invalid duration and non-object inputs', () => {
    expect(validateSchema(null).valid).toBe(false);
    expect(validateSchema([]).valid).toBe(false);
    expect(validateSchema({ duration: -1 }).valid).toBe(false);
    expect(validateSchema({ duration: 35 }).valid).toBe(false);
  });

  it('detects unknown channels with actionable hints and did-you-mean suggestions', () => {
    const clip = {
      duration: 1.0,
      channels: {
        neck_pitch: [
          [0, 10],
          [1, 20],
        ],
      },
    };
    const res = validateSchema(clip, motus);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    const err = res.errors.find((e) => e.path === 'channels.neck_pitch');
    expect(err).toBeDefined();
    expect(err.code).toBe('CHANNEL_UNKNOWN');
    expect(err.hint).toContain("did you mean 'head_pitch'");
  });

  it('validates window boundaries and event timestamps', () => {
    const clip = {
      duration: 1.0,
      windows: {
        hitbox: [0.5, 0.2], // start > end
      },
      events: [
        { t: 1.5, id: 'step' }, // t > duration
      ],
    };
    const res = validateSchema(clip, motus);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.path === 'windows.hitbox')).toBe(true);
    expect(res.errors.some((e) => e.path === 'events[0].t')).toBe(true);
  });
});

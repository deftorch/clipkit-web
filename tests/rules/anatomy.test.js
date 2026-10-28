import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import limits from '../../src/data/limits.json';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/anatomy.js';
import { FPS } from '../../src/domain/validation/vrm10/constants.js';

describe('Rule: anatomy', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('checks knee, elbow, and neck flexion on idle clip', () => {
    const clip = defaultClips.idle;
    const dur = clip.duration;
    const frames = Math.ceil(dur * FPS - 1e-9);
    const poses = [];
    const tAt = (f) => Math.min(f / FPS, dur);
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, tAt(f)));
    }

    const res = check({
      ctx,
      limits,
      poses,
      tAt,
    });

    expect(res.lines.length).toBe(3);
    expect(res.lines[0][1]).toContain('lutut: fleksi');
    expect(res.lines[1][1]).toContain('siku: tekuk maks');
    expect(res.lines[2][1]).toContain('leher-kepala: tekuk maks');
    expect(res.lines.every((l) => l[0] === 'PASS')).toBe(true);
  });

  it('fails when flexion bounds are violated', () => {
    const clip = defaultClips.idle;
    const dur = clip.duration;
    const frames = Math.ceil(dur * FPS - 1e-9);
    const poses = [];
    const tAt = (f) => Math.min(f / FPS, dur);
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, tAt(f)));
    }

    const res = check({
      ctx,
      limits: {
        anatomy: {
          knee_flex_min: 80,
          knee_flex_max: 85,
          elbow_flex_max: 5,
          neck_bend_max: 1,
        },
      },
      poses,
      tAt,
    });

    expect(res.lines[0][0]).toBe('FAIL');
    expect(res.lines[1][0]).toBe('FAIL');
    expect(res.lines[2][0]).toBe('FAIL');
  });
});

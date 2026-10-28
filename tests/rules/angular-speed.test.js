import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import limits from '../../src/data/limits.json';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/angular-speed.js';
import { FPS } from '../../src/domain/validation/vrm10/constants.js';

describe('Rule: angular-speed', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('evaluates angular speed and acceleration for slash clip', () => {
    const clip = defaultClips.slash;
    const dur = clip.duration;
    const frames = Math.ceil(dur * FPS - 1e-9);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, Math.min(f / FPS, dur)));
    }

    const res = check({
      ctx,
      limits,
      style: 'stylized',
      poses,
      frames,
      FPS,
    });

    expect(res).toBeDefined();
    expect(res.lines).toBeInstanceOf(Array);
    expect(res.lines.length).toBe(2);
    expect(res.lines[0][1]).toContain('kecepatan sudut maks');
    expect(res.lines[1][1]).toContain('percepatan sudut maks');
    expect(res.speedSeries.length).toBe(frames + 1);
  });

  it('triggers WARN or FAIL when speed exceeds limits', () => {
    const clip = defaultClips.slash;
    const dur = clip.duration;
    const frames = Math.ceil(dur * FPS - 1e-9);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, Math.min(f / FPS, dur)));
    }

    const restrictiveLimits = {
      styles: {
        realistic: {
          ang_speed_warn: 10,
          ang_speed_fail: 20,
          ang_accel_warn: 50,
        },
      },
    };

    const res = check({
      ctx,
      limits: restrictiveLimits,
      style: 'realistic',
      poses,
      frames,
      FPS,
    });

    expect(res.lines[0][0]).toBe('FAIL');
    expect(res.lines[1][0]).toBe('WARN');
  });
});

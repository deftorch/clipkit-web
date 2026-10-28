import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import limits from '../../src/data/limits.json';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/loop.js';
import { FPS } from '../../src/domain/validation/vrm10/constants.js';

describe('Rule: loop', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('skips non-looping clips', () => {
    const clip = defaultClips.slash;
    expect(clip.loop).toBeFalsy();
    const res = check({ ctx, clip, limits, style: 'stylized', poses: [], frames: 0 });
    expect(res.lines.length).toBe(0);
  });

  it('checks loop pose difference for walk clip', () => {
    const clip = defaultClips.walk;
    expect(clip.loop).toBe(true);
    const dur = clip.duration;
    const frames = Math.ceil(dur * FPS - 1e-9);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, Math.min(f / FPS, dur)));
    }

    const res = check({
      ctx,
      clip,
      limits,
      style: 'stylized',
      poses,
      frames,
    });

    expect(res.lines.length).toBe(1);
    expect(res.lines[0][0]).toBe('PASS');
    expect(res.lines[0][1]).toContain('loop: selisih pose awal-akhir');
  });

  it('fails if loop pose difference exceeds tolerance', () => {
    const clip = { name: 'broken_loop', duration: 1.0, loop: true };
    const frames = 30;
    // Poses where joint 0 has an 80 degree rotation difference between t=0 and t=1
    const baseLocal = Array.from({ length: ctx.n }, () => [0, 0, 0, 1]);
    const rotLocal = Array.from({ length: ctx.n }, (_, i) =>
      i === 0 ? [0, 0.6428, 0, 0.766] : [0, 0, 0, 1],
    );
    const poses = Array.from({ length: frames + 1 }, (_, f) => ({
      local: f === frames ? rotLocal : baseLocal,
    }));

    const res = check({
      ctx,
      clip,
      limits,
      style: 'stylized',
      poses,
      frames,
    });

    expect(res.lines[0][0]).toBe('FAIL');
    expect(res.lines[0][1]).toContain('loop: selisih pose awal-akhir');
  });
});

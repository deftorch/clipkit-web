import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import limits from '../../src/data/limits.json';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/root-motion.js';
import { FPS } from '../../src/domain/validation/vrm10/constants.js';

describe('Rule: root-motion', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('measures root motion and speed for dodge clip with distance/duration claims', () => {
    const clip = defaultClips.dodge;
    const dur = clip.duration;
    const frames = Math.ceil(dur * FPS - 1e-9);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, Math.min(f / FPS, dur)));
    }

    const res = check({
      limits,
      clip,
      style: 'stylized',
      poses,
      frames,
      FPS,
    });

    expect(res.lines.length).toBeGreaterThanOrEqual(3);
    expect(res.lines[0][1]).toContain('root motion:');
    expect(res.lines[1][1]).toContain('kecepatan root maks');
    expect(res.lines[2][1]).toContain('klaim jarak');
    expect(res.rootSpeed.length).toBe(frames + 1);
  });

  it('flags teleportation speed when exceeding limit', () => {
    const clip = { duration: 1.0 };
    const frames = 30;
    // Massive root displacement in one frame
    const poses = Array.from({ length: frames + 1 }, (_, i) => ({
      root: i === 1 ? [100.0, 0, 0] : [0, 0, 0],
    }));

    const res = check({
      limits,
      clip,
      style: 'stylized',
      poses,
      frames,
      FPS: 30,
    });

    const failLine = res.lines.find((l) => l[0] === 'FAIL' && l[1].includes('teleport'));
    expect(failLine).toBeDefined();
  });
});

import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import limits from '../../src/data/limits.json';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx, restPositions } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/floor.js';
import { FPS } from '../../src/domain/validation/vrm10/constants.js';

describe('Rule: floor', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const I = ctx.idx;
  const restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  it('checks floor penetration and sliding on idle clip', () => {
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
      clip,
      poses,
      floorY,
      tAt,
      FPS,
    });

    expect(res.lines.length).toBe(2);
    expect(res.lines[0][1]).toContain('lantai: toe');
    expect(res.lines[1][1]).toContain('foot sliding');
  });

  it('checks planted windows when present', () => {
    const clip = {
      ...defaultClips.walk,
      windows: { planted_L: [0.0, 0.4] },
    };
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
      clip,
      poses,
      floorY,
      tAt,
      FPS,
    });

    expect(res.lines.length).toBe(2);
    expect(res.lines[1][1]).toContain('foot sliding (jendela tumpuan)');
  });

  it('handles floating clips without ground contact', () => {
    const clip = {
      name: 'hover',
      duration: 1.0,
      validate: { foot_slide: true },
    };
    const frames = 30;
    const tAt = (f) => f / 30;
    // Poses high above ground
    const poses = Array.from({ length: frames + 1 }, () => ({
      pos: {
        [I.LeftToeBase]: [0, 5.0, 0],
        [I.RightToeBase]: [0, 5.0, 0],
      },
    }));

    const res = check({
      ctx,
      limits,
      clip,
      poses,
      floorY,
      tAt,
      FPS: 30,
    });

    expect(res.lines.length).toBe(2);
    expect(res.lines[1][0]).toBe('PASS');
    expect(res.lines[1][1]).toContain('tidak ada frame kontak');
  });

  it('detects FOOT_FLOATING when a stance clip has feet floating above floor', () => {
    const clip = {
      name: 'boxing_stance',
      claims: { type: 'stance' },
      duration: 1.0,
    };
    const frames = 30;
    const tAt = (f) => f / 30;
    // Poses floating 5cm (0.05m) above floor
    const poses = Array.from({ length: frames + 1 }, () => ({
      pos: {
        [I.LeftToeBase]: [0.2, floorY + 0.05, 0],
        [I.RightToeBase]: [-0.2, floorY + 0.05, 0],
      },
    }));

    const res = check({
      ctx,
      limits,
      clip,
      poses,
      floorY,
      tAt,
      FPS: 30,
    });

    const floatIssue = res.issues.find((i) => i.rule === 'FOOT_FLOATING');
    expect(floatIssue).toBeDefined();
    expect(floatIssue.value).toBeCloseTo(0.05, 2);
    expect(res.lines.some((l) => l[0] === 'WARN' || l[0] === 'FAIL')).toBe(true);
  });

  it('detects FOOT_FLOATING during declared planted window', () => {
    const clip = {
      name: 'walk_floating_foot',
      duration: 1.0,
      validate: { check_floating: true },
      windows: { planted_L: [0.0, 0.5] },
    };
    const frames = 30;
    const tAt = (f) => f / 30;
    // Left foot floating 6cm during planted window
    const poses = Array.from({ length: frames + 1 }, () => ({
      pos: {
        [I.LeftToeBase]: [0.2, floorY + 0.06, 0],
        [I.RightToeBase]: [-0.2, floorY, 0],
      },
    }));

    const res = check({
      ctx,
      limits,
      clip,
      poses,
      floorY,
      tAt,
      FPS: 30,
    });

    const floatIssue = res.issues.find((i) => i.rule === 'FOOT_FLOATING');
    expect(floatIssue).toBeDefined();
    expect(floatIssue.joint).toBe('LeftToeBase');
  });
});

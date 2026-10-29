import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import limits from '../../src/data/limits.json';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx, restPositions } from '../../src/domain/rig/rig-context.js';
import {
  comBalanceRule,
  computeCenterOfMass,
  isPointInPolygon2D,
} from '../../src/domain/validation/rules/com-balance.js';
import { RULE_CODES } from '../../src/domain/validation/rules/rule-codes.js';

describe('Center of Mass (CoM) Balance Rule (Milestone 7)', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const I = ctx.idx;
  const restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  it('computes anatomical Center of Mass centered near lower torso/pelvis', () => {
    const idlePose = evalPose(motus, ctx, defaultClips.idle, 0);
    const com = computeCenterOfMass(idlePose, ctx);

    expect(com).toHaveLength(3);
    // CoM height in human anatomy is approximately 55% of stature (~0.85m to 1.1m)
    expect(com[1]).toBeGreaterThan(0.75);
    expect(com[1]).toBeLessThan(1.2);
    // At rest, horizontal CoM is close to center
    expect(Math.abs(com[0])).toBeLessThan(0.08);
  });

  it('evaluates 2D point-in-polygon and distance to boundaries', () => {
    // 1m x 1m box around origin: [-0.5, -0.5] to [0.5, 0.5]
    const square = [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
    ];

    // Inside
    const inside = isPointInPolygon2D([0, 0], square, 0.02);
    expect(inside.inside).toBe(true);
    expect(inside.distance).toBe(0);

    // Outside within margin
    const nearMargin = isPointInPolygon2D([0.51, 0], square, 0.02);
    expect(nearMargin.inside).toBe(true);

    // Far outside
    const farOutside = isPointInPolygon2D([0.8, 0], square, 0.02);
    expect(farOutside.inside).toBe(false);
    expect(farOutside.distance).toBeGreaterThan(0.2);
  });

  it('preserves empty output when com_balance is not explicitly enabled', () => {
    const clip = defaultClips.idle;
    const dur = clip.duration;
    const FPS = 30;
    const frames = Math.ceil(dur * FPS);
    const tAt = (f) => Math.min(f / FPS, dur);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, tAt(f)));
    }

    const res = comBalanceRule.check({
      ctx,
      limits,
      clip,
      poses,
      floorY,
      tAt,
      FPS,
    });

    expect(res.lines).toHaveLength(0);
    expect(res.issues).toHaveLength(0);
  });

  it('emits PASS for stable balanced idle stance with com_balance enabled', () => {
    const clip = {
      ...defaultClips.idle,
      validate: {
        com_balance: true,
      },
    };
    const dur = clip.duration;
    const FPS = 30;
    const frames = Math.ceil(dur * FPS);
    const tAt = (f) => Math.min(f / FPS, dur);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, tAt(f)));
    }

    const res = comBalanceRule.check({
      ctx,
      limits,
      clip,
      poses,
      floorY,
      tAt,
      FPS,
    });

    expect(res.lines.length).toBeGreaterThan(0);
    expect(res.lines[0][0]).toBe('PASS');
    expect(res.issues).toHaveLength(0);
  });

  it('emits WARN and COM_BALANCE_UNSTABLE issue on severe uncompensated torso lean', () => {
    // Unstable clip: torso leaning far forward over fixed planted feet
    const unstableClip = {
      ...defaultClips.idle,
      windows: {
        planted_L: [0, 2],
        planted_R: [0, 2],
      },
      channels: {
        ...defaultClips.idle.channels,
        lean: [
          [0, 60],
          [2, 60],
        ],
        hip_pitch: [
          [0, 30],
          [2, 30],
        ],
      },
      validate: {
        com_balance: true,
      },
    };

    const dur = unstableClip.duration;
    const FPS = 30;
    const frames = Math.ceil(dur * FPS);
    const tAt = (f) => Math.min(f / FPS, dur);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, unstableClip, tAt(f)));
    }

    const res = comBalanceRule.check({
      ctx,
      limits,
      clip: unstableClip,
      poses,
      floorY,
      tAt,
      FPS,
    });

    expect(res.lines.length).toBeGreaterThan(0);
    expect(res.lines[0][0]).toBe('WARN');
    expect(res.issues.some((i) => i.rule === RULE_CODES.COM_BALANCE_UNSTABLE)).toBe(true);
  });
});

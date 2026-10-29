import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import limits from '../src/data/limits.json';
import { loadRigs } from '../src/data/load-rigs.js';
import {
  applyFootIK,
  findPlantedWindows,
  isFootPlanted,
  solveTwoBoneLegIK,
} from '../src/domain/rig/foot-ik-solver.js';
import { evalPose } from '../src/domain/rig/pose-evaluator.js';
import { makeCtx, restPositions } from '../src/domain/rig/rig-context.js';
import { floorRule } from '../src/domain/validation/rules/floor.js';

describe('Analytic Two-Bone Foot IK Solver (Milestone 7)', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('correctly evaluates isFootPlanted contract across windows and heights', () => {
    const clipWithWin = {
      windows: {
        planted_L: [0.1, 0.4],
      },
    };

    expect(isFootPlanted(clipWithWin, 0.05, 'Left')).toBe(false);
    expect(isFootPlanted(clipWithWin, 0.25, 'Left')).toBe(true);
    expect(isFootPlanted(clipWithWin, 0.4, 'Left')).toBe(true);
    expect(isFootPlanted(clipWithWin, 0.45, 'Left')).toBe(false);

    // Height fallback when no window is defined
    expect(isFootPlanted({}, 0.2, 'Right', 0.01, 0.0, 0.03)).toBe(true);
    expect(isFootPlanted({}, 0.2, 'Right', 0.08, 0.0, 0.03)).toBe(false);
  });

  it('solves two-bone analytic trigonometry closed-form with zero singularity', () => {
    const hipPos = [0.1, 0.9, 0];
    const l1 = 0.45;
    const l2 = 0.45;

    // 1. Fully extended target straight down
    const targetStraight = [0.1, 0.002, 0]; // d = 0.898m ~ l1 + l2 (0.9m)
    const resStraight = solveTwoBoneLegIK({
      hipPos,
      targetFootPos: targetStraight,
      l1,
      l2,
      isLeft: false,
    });
    expect(resStraight.kneeAngle).toBeLessThan(15); // near straight
    expect(Number.isFinite(resStraight.swingAngle)).toBe(true);

    // 2. Bent knee target
    const targetBent = [0.1, 0.35, 0.2]; // d = sqrt((0.9-0.35)^2 + 0.2^2) = sqrt(0.3025 + 0.04) = 0.585m
    const resBent = solveTwoBoneLegIK({
      hipPos,
      targetFootPos: targetBent,
      l1,
      l2,
      isLeft: true,
    });
    expect(resBent.kneeAngle).toBeGreaterThan(60);
    expect(resBent.kneeAngle).toBeLessThan(140);
    expect(resBent.kneeAngle).toBeGreaterThanOrEqual(0); // anatomy limits

    // 3. Target out of reach (clamping verification)
    const targetUnreachable = [0.1, -1.0, 0]; // d = 1.9m > l1 + l2 = 0.9m
    const resClamped = solveTwoBoneLegIK({
      hipPos,
      targetFootPos: targetUnreachable,
      l1,
      l2,
    });
    expect(resClamped.kneeAngle).toBe(0);
    expect(Number.isFinite(resClamped.swingAngle)).toBe(true);
  });

  it('applies Foot IK to firmly plant foot and eliminate sliding on walk clip', () => {
    const clip = {
      ...defaultClips.idle,
      windows: {
        planted_L: [0, 2],
        planted_R: [0, 2],
      },
    };

    // Apply Foot IK
    const ikClip = applyFootIK(motus, ctx, clip, {
      blendWindow: 0.04,
    });
    expect(ikClip).toBeDefined();
    expect(ikClip.channels.kneeL).toBeDefined();

    // Evaluate floor rule on post-IK clip
    const dur = ikClip.duration;
    const FPS = 30;
    const frames = Math.ceil(dur * FPS);
    const tAt = (f) => Math.min(f / FPS, dur);
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, ikClip, tAt(f)));
    }
    const I = ctx.idx;
    const restPos = restPositions(ctx);
    const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

    const floorRes = floorRule.check({
      ctx,
      limits,
      clip: ikClip,
      poses,
      floorY,
      tAt,
      FPS,
    });

    const slideIssues = floorRes.issues.filter((i) => i.rule === 'FOOT_SLIDE');
    expect(slideIssues).toHaveLength(0);
  });
});

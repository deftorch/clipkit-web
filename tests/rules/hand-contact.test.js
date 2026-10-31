import { describe, expect, it } from 'vitest';
import { loadRigs } from '../../src/data/load-rigs.js';
import { evalPose } from '../../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/hand-contact.js';

describe('Rule: hand-contact', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const FPS = 30;

  it('silently passes when no hand contacts are defined', () => {
    const clip = { duration: 1.0, channels: {} };
    const poses = [evalPose(motus, ctx, clip, 0)];
    const res = check({ ctx, clip, poses, tAt: () => 0 });
    expect(res.lines.length).toBe(0);
    expect(res.issues.length).toBe(0);
  });

  it('validates hand contact at specified height within tolerance', () => {
    // Generate a clip where LeftHand is positioned at ~0.9m
    const clip = {
      name: 'vault_test',
      duration: 1.0,
      channels: {
        armL_elev: [
          [0, -30],
          [1, -30],
        ],
      },
      contacts: {
        hand_L: { height: 1.21, t: [0.3, 0.6], tolerance: 0.05 },
      },
    };
    const frames = 30;
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, f / FPS));
    }

    const res = check({
      ctx,
      clip,
      poses,
      tAt: (f) => f / FPS,
    });

    expect(res.lines.length).toBe(1);
    expect(res.lines[0][0]).toBe('PASS');
    expect(res.lines[0][1]).toContain('kontak tangan: LeftHand');
    expect(res.issues.length).toBe(0);
  });

  it('emits HAND_CONTACT_HEIGHT when hand height deviates from obstacle height', () => {
    const clip = {
      name: 'vault_mismatch',
      duration: 1.0,
      channels: {
        armL_elev: [[0, -75]], // Hanging down
      },
      contacts: {
        hand_L: { height: 1.5, t: [0.2, 0.5], tolerance: 0.05 },
      },
    };
    const frames = 30;
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, f / FPS));
    }

    const res = check({
      ctx,
      clip,
      poses,
      tAt: (f) => f / FPS,
    });

    expect(res.issues.length).toBe(1);
    expect(res.issues[0].rule).toBe('HAND_CONTACT_HEIGHT');
    expect(res.issues[0].joint).toBe('LeftHand');
    expect(res.lines[0][0]).toMatch(/WARN|FAIL/);
    expect(res.lines[0][1]).toContain('kontak tangan: LeftHand');
  });

  it('supports clip.windows.planted_hand_L declaration', () => {
    const clip = {
      name: 'climb_ledge',
      duration: 1.0,
      windows: {
        planted_hand_L: [0.2, 0.5],
      },
      validate: {
        obstacle_height: 1.0,
      },
    };
    const frames = 30;
    const poses = [];
    for (let f = 0; f <= frames; f++) {
      poses.push(evalPose(motus, ctx, clip, f / FPS));
    }

    const res = check({
      ctx,
      clip,
      poses,
      tAt: (f) => f / FPS,
    });

    expect(res.lines.length).toBe(1);
    expect(res.issues.length).toBe(1);
    expect(res.issues[0].rule).toBe('HAND_CONTACT_HEIGHT');
  });
});

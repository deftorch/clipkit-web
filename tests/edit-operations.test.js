import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import { loadRigs } from '../src/data/load-rigs.js';
import {
  closeLoop,
  mirrorClip,
  retimeClip,
  scaleAmplitude,
} from '../src/domain/animation/edit-operations.js';
import { evalPose } from '../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';

describe('Deterministic Edit Operations', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  describe('mirrorClip', () => {
    it('satisfies involution: mirror(mirror(clip)) == clip', () => {
      const clip = defaultClips.slash;
      const doubleMirrored = mirrorClip(mirrorClip(clip));

      // Channels should match original exactly
      for (const [ch, kfs] of Object.entries(clip.channels)) {
        expect(doubleMirrored.channels[ch]).toBeDefined();
        for (let i = 0; i < kfs.length; i++) {
          expect(doubleMirrored.channels[ch][i][0]).toBeCloseTo(kfs[i][0], 4);
          expect(doubleMirrored.channels[ch][i][1]).toBeCloseTo(kfs[i][1], 4);
        }
      }
      // Windows should match
      if (clip.windows?.planted_L) {
        expect(doubleMirrored.windows.planted_L).toEqual(clip.windows.planted_L);
      }
    });

    it('reproduces reflected 3D joint positions within 1e-4m tolerance', () => {
      const clip = defaultClips.dodge;
      const mirrored = mirrorClip(clip);

      // Evaluate pose at t=0.5s for both
      const pOrig = evalPose(motus, ctx, clip, 0.5);
      const pMirror = evalPose(motus, ctx, mirrored, 0.5);

      const I = ctx.idx;
      // Symmetric center joints should reflect X coordinate (x -> -x) while Y and Z remain identical
      const centerJoints = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'];
      for (const jName of centerJoints) {
        const jIdx = I[jName];
        const orig = pOrig.pos[jIdx];
        const mirr = pMirror.pos[jIdx];

        expect(mirr[0]).toBeCloseTo(-orig[0], 3);
        expect(mirr[1]).toBeCloseTo(orig[1], 3);
        expect(mirr[2]).toBeCloseTo(orig[2], 3);
      }

      // Left and Right pairs should exchange positions with X negated
      const lrPairs = [
        ['LeftUpLeg', 'RightUpLeg'],
        ['LeftLeg', 'RightLeg'],
        ['LeftFoot', 'RightFoot'],
        ['LeftShoulder', 'RightShoulder'],
        ['LeftArm', 'RightArm'],
        ['LeftForeArm', 'RightForeArm'],
        ['LeftHand', 'RightHand'],
      ];

      for (const [leftName, rightName] of lrPairs) {
        const lIdx = I[leftName];
        const rIdx = I[rightName];

        const origL = pOrig.pos[lIdx];
        const mirrR = pMirror.pos[rIdx];

        // Left joint in original should equal Right joint in mirror with X inverted
        expect(mirrR[0]).toBeCloseTo(-origL[0], 3);
        expect(mirrR[1]).toBeCloseTo(origL[1], 3);
        expect(mirrR[2]).toBeCloseTo(origL[2], 3);
      }
    });
  });

  describe('retimeClip', () => {
    it('scales duration, keyframes, windows, and events accurately', () => {
      const clip = {
        duration: 1.0,
        channels: {
          lean: [
            [0, 0],
            [0.5, 20],
            [1.0, 0],
          ],
        },
        windows: {
          hitbox: [0.2, 0.6],
        },
        events: [{ t: 0.4, id: 'swing' }],
      };

      const retimed = retimeClip(clip, 2.0);
      expect(retimed.duration).toBe(2.0);
      expect(retimed.channels.lean[1][0]).toBe(1.0);
      expect(retimed.windows.hitbox).toEqual([0.4, 1.2]);
      expect(retimed.events[0].t).toBe(0.8);
    });
  });

  describe('scaleAmplitude', () => {
    it('scales channel keyframe amplitudes by factor', () => {
      const clip = {
        duration: 1.0,
        channels: {
          lean: [
            [0, 10],
            [1.0, 20],
          ],
          twist: [
            [0, 5],
            [1.0, -10],
          ],
        },
      };

      const scaled = scaleAmplitude(clip, 1.5, ['lean']);
      expect(scaled.channels.lean[0][1]).toBe(15);
      expect(scaled.channels.lean[1][1]).toBe(30);
      // twist should remain untouched
      expect(scaled.channels.twist[0][1]).toBe(5);
    });
  });

  describe('closeLoop', () => {
    it('matches final keyframe value to start keyframe value', () => {
      const clip = {
        duration: 1.0,
        loop: false,
        channels: {
          lean: [
            [0, 12],
            [0.5, 30],
            [1.0, 25],
          ],
        },
      };

      const looped = closeLoop(clip);
      expect(looped.loop).toBe(true);
      expect(looped.channels.lean[2][1]).toBe(12);
    });
  });
});

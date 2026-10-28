import { describe, expect, it } from 'vitest';
import { composeClips, matchChannelPattern } from '../src/domain/animation/compose.js';

describe('Layer Composition (composeClips)', () => {
  describe('matchChannelPattern', () => {
    it('matches exact name and wildcards', () => {
      expect(matchChannelPattern('armR_elev', '*')).toBe(true);
      expect(matchChannelPattern('armR_elev', 'armR_*')).toBe(true);
      expect(matchChannelPattern('armL_elev', 'armR_*')).toBe(false);
      expect(matchChannelPattern('elbowR', 'elbowR')).toBe(true);
      expect(matchChannelPattern('elbowL', 'elbowR')).toBe(false);
    });
  });

  describe('Merge Semantics (Phase C2.2 & Open Decision 6)', () => {
    const baseClip = {
      name: 'base_jump',
      duration: 1.0,
      loop: false,
      channels: {
        hip_y: [
          [0, 0.9],
          [0.5, 1.2],
          [1.0, 0.9],
        ],
        lean: [
          [0, 0],
          [0.5, 10],
          [1.0, 0],
        ],
        armR_elev: [
          [0, 0],
          [0.5, 30],
          [1.0, 0],
        ],
      },
      windows: {
        parry: [0.2, 0.4],
      },
      events: [{ t: 0.5, id: 'apex' }],
      expressions: {
        neutral: [
          [0, 1],
          [1.0, 1],
        ],
      },
      move: [0, 0, 1.5],
    };

    it('1. override replaces base keys for specified channels/globs', () => {
      const punchLayer = {
        clip: {
          duration: 0.8,
          channels: {
            armR_elev: [
              [0, 0],
              [0.4, 90],
              [0.8, 0],
            ],
            elbowR: [
              [0, 0],
              [0.4, 80],
              [0.8, 0],
            ],
          },
        },
        mode: 'override',
        channels: ['armR_*', 'elbowR'],
      };

      const { clip } = composeClips(baseClip, [punchLayer]);
      expect(clip.channels.armR_elev).toEqual([
        [0, 0],
        [0.4, 90],
        [0.8, 0],
      ]);
      expect(clip.channels.elbowR).toBeDefined();
      expect(clip.channels.hip_y).toEqual(baseClip.channels.hip_y);
    });

    it('2. additive sums values across frame samples', () => {
      const additiveLean = {
        clip: {
          duration: 1.0,
          channels: {
            lean: [
              [0, 5],
              [1.0, 5],
            ], // constant +5 deg
          },
        },
        mode: 'additive',
      };

      const { clip } = composeClips(baseClip, [additiveLean]);
      // At t=0: 0 + 5 = 5. At t=0.5: 10 + 5 = 15.
      const kfs = clip.channels.lean;
      const at0 = kfs.find(([t]) => t === 0);
      const atHalf = kfs.find(([t]) => Math.abs(t - 0.5) < 0.02);
      expect(at0[1]).toBeCloseTo(5, 1);
      expect(atHalf[1]).toBeCloseTo(15, 1);
    });

    it('3. warns when additive mode is used on aim channels (AIM_ADDITIVE_APPROX)', () => {
      const aimAdditive = {
        clip: {
          duration: 1.0,
          channels: {
            armR_elev: [
              [0, 10],
              [1.0, 10],
            ],
          },
        },
        mode: 'additive',
      };

      const { warnings } = composeClips(baseClip, [aimAdditive]);
      expect(warnings.some((w) => w.code === 'AIM_ADDITIVE_APPROX')).toBe(true);
    });

    it('4. warns when shared torso channel uses override mode (TORSO_OVERRIDE_CONFLICT)', () => {
      const torsoOverride = {
        clip: {
          duration: 1.0,
          channels: {
            lean: [
              [0, 20],
              [1.0, 20],
            ],
          },
        },
        mode: 'override',
      };

      const { warnings } = composeClips(baseClip, [torsoOverride]);
      expect(warnings.some((w) => w.code === 'TORSO_OVERRIDE_CONFLICT')).toBe(true);
    });

    it('5. warns when two layers write to the same channel (CHANNEL_COLLISION)', () => {
      const layerA = {
        clip: { channels: { elbowR: [[0, 45]] } },
      };
      const layerB = {
        clip: { channels: { elbowR: [[0, 90]] } },
      };

      const { warnings } = composeClips(baseClip, [layerA, layerB]);
      expect(warnings.some((w) => w.code === 'CHANNEL_COLLISION')).toBe(true);
    });

    it('6. shifts windows by offset and warns on collision (WINDOW_COLLISION)', () => {
      const layer = {
        clip: {
          duration: 0.6,
          windows: {
            parry: [0.1, 0.3], // collision with base parry
            hitbox: [0.2, 0.4],
          },
        },
        offset: 0.1,
      };

      const { clip, warnings } = composeClips(baseClip, [layer]);
      expect(warnings.some((w) => w.code === 'WINDOW_COLLISION')).toBe(true);
      // Non-colliding window hitbox should be shifted by offset (+0.1) -> [0.3, 0.5]
      expect(clip.windows.hitbox).toEqual([0.3, 0.5]);
      // Base window retained
      expect(clip.windows.parry).toEqual([0.2, 0.4]);
    });

    it('7. shifts events by offset, concatenates and sorts chronologically', () => {
      const layer = {
        clip: {
          events: [
            { t: 0.1, id: 'swing_start' },
            { t: 0.7, id: 'swing_end' },
          ],
        },
        offset: 0.2,
      };

      const { clip } = composeClips(baseClip, [layer]);
      // Base apex was at 0.5. Layer swing_start shifted to 0.3, swing_end to 0.9.
      expect(clip.events).toEqual([
        { t: 0.3, id: 'swing_start' },
        { t: 0.5, id: 'apex' },
        { t: 0.9, id: 'swing_end' },
      ]);
    });

    it('8. enforces single move ownership and warns on conflict (MOVE_COLLISION)', () => {
      const layerWithMove = {
        clip: {
          move: [0, 0, 3.0],
        },
      };

      const { clip, warnings } = composeClips(baseClip, [layerWithMove]);
      expect(warnings.some((w) => w.code === 'MOVE_COLLISION')).toBe(true);
      expect(clip.move).toEqual([0, 0, 1.5]); // Base move retained
    });

    it('9. merges expressions with clamping between 0 and 1', () => {
      const faceLayer = {
        clip: {
          expressions: {
            happy: [
              [0, 0.5],
              [1.0, 1.2],
            ], // 1.2 should clamp to 1.0
          },
        },
        mode: 'override',
      };

      const { clip } = composeClips(baseClip, [faceLayer]);
      expect(clip.expressions.happy).toBeDefined();
      expect(clip.expressions.happy[1][1]).toBe(1.0);
    });

    it('10. clips layer exceeding base duration and emits LAYER_DURATION_CLIPPED', () => {
      const longLayer = {
        clip: {
          duration: 1.5,
          channels: {
            elbowR: [
              [0, 0],
              [1.5, 90],
            ],
          },
        },
      };

      const { warnings } = composeClips(baseClip, [longLayer]);
      expect(warnings.some((w) => w.code === 'LAYER_DURATION_CLIPPED')).toBe(true);
    });

    it('11. resolves external layer clip via resolveRef option', () => {
      const layerRef = {
        ref: 'punch_pose',
        channels: ['armR_*'],
      };

      const mockLibrary = {
        punch_pose: {
          duration: 0.5,
          channels: {
            armR_elev: [[0, 75]],
            elbowR: [[0, 90]],
          },
        },
      };

      const { clip } = composeClips(baseClip, [layerRef], {
        resolveRef: (ref) => mockLibrary[ref],
      });

      expect(clip.channels.armR_elev).toEqual([[0, 75]]);
      // elbowR was not in channels filter ['armR_*']
      expect(clip.channels.elbowR).toBeUndefined();
    });
  });
});

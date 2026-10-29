import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import { loadRigs } from '../src/data/load-rigs.js';
import { composeClips } from '../src/domain/animation/compose.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import { buildVrmaGlb } from '../src/infrastructure/vrma/vrma-exporter.js';
import { importVrmaToClip } from '../src/infrastructure/vrma/vrma-importer.js';

describe('Regression: input formats used by the CLI', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  const exportBuffer = async () => {
    const out = buildVrmaGlb(motus, ctx, defaultClips.slash);
    return out instanceof ArrayBuffer ? out : await out.arrayBuffer();
  };

  it('importVrmaToClip accepts ArrayBuffer, Node Buffer and Uint8Array alike', async () => {
    const ab = await exportBuffer();
    const fromAb = importVrmaToClip(ab);
    const fromBuf = importVrmaToClip(Buffer.from(ab));
    const fromU8 = importVrmaToClip(new Uint8Array(ab));

    expect(Object.keys(fromAb.clip.channels).length).toBeGreaterThan(0);
    expect(fromBuf.clip.channels).toEqual(fromAb.clip.channels);
    expect(fromU8.clip.channels).toEqual(fromAb.clip.channels);
  });

  it('importVrmaToClip handles a typed-array view with a non-zero byteOffset', async () => {
    const ab = await exportBuffer();
    const padded = new Uint8Array(ab.byteLength + 64);
    padded.set(new Uint8Array(ab), 64);
    const view = padded.subarray(64); // shares a larger ArrayBuffer, like pooled Node Buffers

    const fromView = importVrmaToClip(view);
    const fromAb = importVrmaToClip(ab);
    expect(fromView.clip.channels).toEqual(fromAb.clip.channels);
  });

  describe('composeClips with `move` given as a single object (as in dodge.json)', () => {
    const move = { dir: [0, 0, -1], distance: 2.5, t0: 0.18, t1: 0.5, ease: 'linear' };
    const base = {
      name: 'base',
      duration: 1,
      channels: {
        hip_y: [
          [0, 0.9],
          [1, 0.9],
        ],
      },
    };

    it('does not throw when a layer clip defines move as an object', () => {
      const layer = {
        clip: {
          name: 'dodge',
          duration: 1,
          channels: {
            lean: [
              [0, 0],
              [1, 0],
            ],
          },
          move,
        },
        channels: ['*'],
      };
      let result;
      expect(() => {
        result = composeClips(base, [layer]);
      }).not.toThrow();
      expect(Array.isArray(result.clip.move)).toBe(true);
      expect(result.clip.move).toHaveLength(1);
      expect(result.clip.move[0].distance).toBe(2.5);
    });

    it('normalizes an object `move` on the base clip into a list', () => {
      const { clip } = composeClips({ ...base, move }, []);
      expect(Array.isArray(clip.move)).toBe(true);
      expect(clip.move).toHaveLength(1);
    });

    it('keeps an array `move` as an array', () => {
      const { clip } = composeClips({ ...base, move: [move, { ...move, t0: 0.6, t1: 0.9 }] }, []);
      expect(clip.move).toHaveLength(2);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import { loadRigs } from '../../src/data/load-rigs.js';
import { check, checkChannelRanges } from '../../src/domain/validation/rules/channel-ranges.js';

describe('Rule: channel-ranges', () => {
  const { motus } = loadRigs();
  it('passes on valid channels within limits for default clips', () => {
    const clip = defaultClips.slash;
    const res = check({ rig: motus, clip });
    expect(res.lines.length).toBe(0);
  });

  it('fails immediately on unknown channels (hallucinations)', () => {
    const clip = {
      duration: 1.0,
      channels: {
        neck_pitch: [[0, 10]],
        legL_flex: [[0, 20]],
      },
    };
    const res = check({ rig: motus, clip });
    expect(res.lines.length).toBe(2);
    expect(res.lines[0][0]).toBe('FAIL');
    expect(res.lines[0][1]).toContain('channel tidak dikenal: neck_pitch');
    expect(res.lines[1][0]).toBe('FAIL');
    expect(res.lines[1][1]).toContain('channel tidak dikenal: legL_flex');
  });

  it('warns when channel value exceeds anatomical range', () => {
    const clip = {
      duration: 1.0,
      channels: {
        kneeL: [[0, 250]], // motus knee range is [-5, 150]
      },
    };
    const res = check({ rig: motus, clip });
    expect(res.lines.length).toBe(1);
    expect(res.lines[0][0]).toBe('WARN');
    expect(res.lines[0][1]).toContain('kneeL keluar range');
  });

  it('allows unbounded root rotation (e.g. 360° salto or rolls) without warnings', () => {
    const clip = {
      duration: 1.0,
      channels: {
        root_pitch: [
          [0, 0],
          [0.5, 180],
          [1.0, 360],
        ],
        root_yaw: [
          [0, 0],
          [1.0, 720],
        ],
        root_roll: [
          [0, 0],
          [1.0, -360],
        ],
      },
    };
    const res = check({ rig: motus, clip });
    expect(res.lines.length).toBe(0);
    expect(res.issues.length).toBe(0);
  });
});

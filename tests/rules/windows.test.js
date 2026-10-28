import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import { check } from '../../src/domain/validation/rules/windows.js';

describe('Rule: windows', () => {
  it('validates window bounds and cancel ordering on slash clip', () => {
    const clip = defaultClips.slash;
    const res = check({ clip });
    expect(res.lines.length).toBeGreaterThan(0);
    expect(res.lines.every((l) => l[0] === 'PASS')).toBe(true);
  });

  it('fails invalid window interval', () => {
    const clip = {
      duration: 1.0,
      windows: {
        bad: [0.8, 0.2], // inverted start/end
      },
    };
    const res = check({ clip });
    expect(res.lines[0][0]).toBe('FAIL');
    expect(res.lines[0][1]).toContain('tidak valid');
  });

  it('fails cancel window starting before active/hitbox finishes', () => {
    const clip = {
      duration: 1.0,
      windows: {
        hitbox: [0.2, 0.6],
        cancel: [0.4, 0.9], // starts at 0.4 while hitbox ends at 0.6
      },
    };
    const res = check({ clip });
    const cancelLine = res.lines.find((l) => l[1].includes('urutan: cancel'));
    expect(cancelLine).toBeDefined();
    expect(cancelLine[0]).toBe('FAIL');
  });

  it('fails event outside clip duration', () => {
    const clip = {
      duration: 1.0,
      events: [{ id: 'hit_spark', t: 1.5 }],
    };
    const res = check({ clip });
    const evLine = res.lines.find((l) => l[1].includes('event hit_spark'));
    expect(evLine).toBeDefined();
    expect(evLine[0]).toBe('FAIL');
  });
});

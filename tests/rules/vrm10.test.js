import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import { loadRigs } from '../../src/data/load-rigs.js';
import { makeCtx } from '../../src/domain/rig/rig-context.js';
import { check } from '../../src/domain/validation/rules/vrm10.js';

describe('Rule: vrm10', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('validates VRM 1.0 humanoid requirements for default clip', () => {
    const clip = defaultClips.slash;
    const res = check({ rig: motus, ctx, clip });
    expect(res.lines.length).toBeGreaterThanOrEqual(3);
    expect(res.lines[0][0]).toBe('PASS');
    expect(res.lines[0][1]).toContain('15 bone wajib terpenuhi');
    expect(res.lines[1][0]).toBe('PASS');
    expect(res.lines[1][1]).toContain('semua sesuai standar VRM 1.0');
    expect(res.lines[2][0]).toBe('PASS');
    expect(res.lines[2][1]).toContain('translasi hanya pada hips');
  });

  it('validates VRM 1.0 facial expressions', () => {
    const clip = defaultClips.hands_eyes_jaw;
    const res = check({ rig: motus, ctx, clip });
    const exprLine = res.lines.find((l) => l[1].includes('VRM 1.0 ekspresi'));
    expect(exprLine).toBeDefined();
    expect(exprLine[0]).toBe('PASS');
    expect(exprLine[1]).toContain('preset valid');
  });

  it('fails on non-standard expressions or out of range weights', () => {
    const clip = {
      duration: 1.0,
      expressions: {
        non_existent_preset: [[0, 0.5]],
        happy: [[0, 2.5]], // > 1.0
      },
    };
    const res = check({ rig: motus, ctx, clip });
    expect(
      res.lines.some((l) => l[0] === 'FAIL' && l[1].includes('nama preset tidak standar')),
    ).toBe(true);
    expect(
      res.lines.some((l) => l[0] === 'FAIL' && l[1].includes('bobot harus di rentang [0, 1]')),
    ).toBe(true);
  });
});

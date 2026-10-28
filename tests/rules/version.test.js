import { describe, expect, it } from 'vitest';
import { defaultClips } from '../../src/data/index.js';
import { check, versionIssues } from '../../src/domain/validation/rules/version.js';

describe('Rule: version', () => {
  it('validates version, format, and changelog for default slash clip', () => {
    const clip = defaultClips.slash;
    const res = check({ clip });
    expect(res.lines.length).toBe(1);
    expect(res.lines[0][0]).toBe('PASS');
    expect(res.lines[0][1]).toContain('changelog');
  });

  it('warns when changelog is missing', () => {
    const clip = { version: 1 };
    const res = check({ clip });
    expect(res.lines[0][0]).toBe('WARN');
    expect(res.lines[0][1]).toContain('tanpa changelog');
  });

  it('fails when format_version is unsupported', () => {
    const clip = { version: 1, changelog: [{ v: 1, catatan: 'init' }], format_version: 99 };
    const res = check({ clip });
    expect(res.lines.some((l) => l[0] === 'FAIL' && l[1].includes('format_version'))).toBe(true);
  });

  it('fails when changelog version does not match clip version', () => {
    const clip = {
      version: 3,
      changelog: [
        { v: 1, catatan: 'init' },
        { v: 2, catatan: 'update' },
      ],
    };
    const res = check({ clip });
    expect(
      res.lines.some(
        (l) => l[0] === 'FAIL' && l[1].includes('version 3 tetapi changelog berakhir di v2'),
      ),
    ).toBe(true);
  });

  it('passes when format_version is 2', () => {
    const clip = {
      version: 1,
      changelog: [{ v: 1, catatan: 'layers support' }],
      format_version: 2,
    };
    const res = check({ clip });
    expect(res.lines.some((l) => l[0] === 'FAIL' && l[1].includes('format_version'))).toBe(false);
  });
});

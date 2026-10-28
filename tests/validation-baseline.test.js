import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import limits from '../src/data/limits.json';
import { loadRigs } from '../src/data/load-rigs.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import { validate } from '../src/domain/validation/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASELINE_PATH = path.resolve(__dirname, 'fixtures/validation-baseline.json');

describe('Validation Baseline Exact Fixture Reproduction', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));

  for (const style of ['realistic', 'stylized', 'exaggerated']) {
    describe(`Style: ${style}`, () => {
      for (const [name, clip] of Object.entries(defaultClips)) {
        it(`reproduces exact validation results for ${name}`, () => {
          const expected = baseline[style][name];
          expect(expected).toBeDefined();

          const actual = validate(motus, ctx, limits, clip, style);

          expect(actual.fail).toBe(expected.fail);
          expect(actual.warn).toBe(expected.warn);
          expect(actual.lines).toEqual(expected.lines);
        });
      }
    });
  }
});

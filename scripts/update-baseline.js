import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import { validate } from '../src/domain/validation/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASELINE_PATH = path.resolve(ROOT, 'tests/fixtures/validation-baseline.json');

const motus = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'src/data/rigs/motus.json'), 'utf8'));
const limits = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'src/data/limits.json'), 'utf8'));
const clipsDir = path.resolve(ROOT, 'src/data/clips');

const clipFiles = fs.readdirSync(clipsDir).filter((f) => f.endsWith('.json')).sort();
const clips = {};
for (const file of clipFiles) {
  const name = path.basename(file, '.json');
  clips[name] = JSON.parse(fs.readFileSync(path.join(clipsDir, file), 'utf8'));
}

const ctx = makeCtx(motus);

const output = {
  realistic: {},
  stylized: {},
  exaggerated: {},
};

for (const style of ['realistic', 'stylized', 'exaggerated']) {
  for (const [name, clip] of Object.entries(clips)) {
    const res = validate(motus, ctx, limits, clip, style);
    output[style][name] = {
      fail: res.fail,
      warn: res.warn,
      lines: res.lines,
    };
  }
}

fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
try {
  execSync(`npx biome format --write "${BASELINE_PATH}"`, { stdio: 'inherit' });
} catch (e) {
  console.warn(`Biome formatting failed: ${e.message}`);
}
console.log(`Validation baseline fixture successfully updated for ${Object.keys(clips).length} clips at ${BASELINE_PATH}`);

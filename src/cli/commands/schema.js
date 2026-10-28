import { loadRigs } from '../../data/load-rigs.js';
import { validateSchema } from '../../domain/validation/schema-validator.js';
import { formatDeterministicJson, readInput } from '../io.js';

export function runSchema(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error('Usage: clipkit schema <clip-file> [--json]');
  }

  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    if (options.json) {
      console.log(
        formatDeterministicJson({
          valid: false,
          errors: [{ path: '$', message: `Invalid JSON: ${e.message}`, code: 'JSON_SYNTAX_ERROR' }],
        }),
      );
    } else {
      console.error(`Error: Invalid JSON syntax in ${inputPath}: ${e.message}`);
    }
    return 2;
  }

  const { motus } = loadRigs();
  const res = validateSchema(clip, motus);

  if (options.json) {
    console.log(formatDeterministicJson(res));
  } else {
    if (res.valid) {
      console.log(
        `PASS: Schema validation successful for ${inputPath} (duration: ${clip.duration}s)`,
      );
    } else {
      console.error(`FAIL: Schema validation failed with ${res.errors.length} issue(s):`);
      for (const err of res.errors) {
        console.error(`  - [${err.path}] ${err.message}`);
        if (err.hint) console.error(`    Hint: ${err.hint}`);
      }
    }
  }

  return res.valid ? 0 : 1;
}

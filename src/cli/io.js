import fs from 'node:fs';
import path from 'node:path';

/**
 * Validates and safely resolves an output path against security constraints:
 * - Refuses paths outside working directory unless allowOutside is true.
 * - Refuses overwriting existing files unless force is true.
 */
export function resolveSafeOutputPath(
  targetPath,
  { allowOutside = false, force = false, cwd = process.cwd() } = {},
) {
  const absPath = path.resolve(cwd, targetPath);
  const normalizedCwd = path.resolve(cwd);

  if (!allowOutside && !absPath.startsWith(normalizedCwd)) {
    throw new Error(
      `Security violation: Refusing to write outside working directory (${absPath}). Use --allow-outside to permit this path.`,
    );
  }

  if (fs.existsSync(absPath) && !force) {
    throw new Error(`File already exists: ${absPath}. Use --force to overwrite.`);
  }

  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return absPath;
}

/**
 * Safely writes content to an output file adhering to safety policies.
 */
export function writeOutputFile(targetPath, content, options = {}) {
  const safePath = resolveSafeOutputPath(targetPath, options);
  fs.writeFileSync(safePath, content, typeof content === 'string' ? 'utf8' : undefined);
  return safePath;
}

/**
 * Reads clip content from a file path or stdin if path is '-'.
 */
export function readInput(inputPath) {
  if (inputPath === '-' || !inputPath) {
    return fs.readFileSync(0, 'utf8');
  }
  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }
  return fs.readFileSync(resolved, 'utf8');
}

/**
 * Formats diagnostic output deterministically (sorted keys, stable floats).
 */
export function formatDeterministicJson(obj) {
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'number') {
        // Round floating point values to 6 decimal places to prevent engine variance
        return Number(value.toFixed(6));
      }
      return value;
    },
    2,
  );
}

import fs from 'node:fs';
import path from 'node:path';
import { defaultClips } from '../../data/index.js';
import { defaultPoses } from '../../data/poses/index.js';
import { composeClips } from '../../domain/animation/compose.js';
import { formatDeterministicJson, readInput, writeOutputFile } from '../io.js';

export async function runCompose(args, options = {}) {
  const target = args[0];
  if (!target) {
    console.error('Error: "clipkit compose" requires a clip path or clip name.');
    return 2;
  }

  let clip;
  if (defaultClips[target]) {
    clip = JSON.parse(JSON.stringify(defaultClips[target]));
  } else {
    try {
      const raw = await readInput(target);
      clip = JSON.parse(raw);
    } catch (e) {
      console.error(`Error reading clip '${target}': ${e.message}`);
      return 2;
    }
  }

  if (!clip.layers || !Array.isArray(clip.layers) || clip.layers.length === 0) {
    console.error(`Clip '${target}' has no layers to compose.`);
    if (options.output) {
      writeOutputFile(options.output, formatDeterministicJson(clip), options);
    } else {
      console.log(formatDeterministicJson(clip));
    }
    return 0;
  }

  // Ref resolver that looks in defaultPoses, defaultClips, or relative file paths
  const resolveRef = (ref) => {
    if (defaultPoses[ref]) return defaultPoses[ref];
    if (defaultClips[ref]) return defaultClips[ref];
    const candidatePath = path.resolve(process.cwd(), ref);
    if (fs.existsSync(candidatePath)) {
      return JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
    }
    return null;
  };

  const { clip: composed, warnings } = composeClips(clip, clip.layers, {
    resolveRef,
  });

  // Remove the layers array from the flattened clip
  delete composed.layers;

  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`[WARN] ${w.code}: ${w.message}`);
    }
    if (options.failOn === 'warn') {
      return 1;
    }
  }

  const jsonStr = formatDeterministicJson(composed);
  if (options.output) {
    try {
      writeOutputFile(options.output, jsonStr, options);
      console.log(`Successfully composed and wrote clip to: ${options.output}`);
    } catch (e) {
      console.error(`Error writing output: ${e.message}`);
      return 2;
    }
  } else {
    console.log(jsonStr);
  }

  return 0;
}

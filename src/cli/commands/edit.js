import { defaultClips } from '../../data/index.js';
import {
  applyOverlap,
  closeLoop,
  mirrorClip,
  retimeClip,
  scaleAmplitude,
} from '../../domain/animation/edit-operations.js';
import { formatDeterministicJson, readInput, writeOutputFile } from '../io.js';

export async function runEdit(args, options = {}) {
  const operation = args[0];
  const target = args[1];

  if (
    !operation ||
    !['mirror', 'retime', 'scale-amplitude', 'close-loop', 'overlap'].includes(operation)
  ) {
    console.error(
      'Error: "clipkit edit" requires an operation: "mirror", "retime", "scale-amplitude", "close-loop", or "overlap".',
    );
    console.error(
      'Example: clipkit edit overlap slash.json --delay 0.03 --damping 12 --output slash_overlap.json',
    );
    return 2;
  }

  if (!target) {
    console.error(`Error: "clipkit edit ${operation}" requires a clip path or clip name.`);
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

  let result;
  if (operation === 'mirror') {
    result = mirrorClip(clip);
  } else if (operation === 'retime') {
    const scale = options.scale != null ? Number(options.scale) : null;
    if (!scale || Number.isNaN(scale) || scale <= 0) {
      console.error('Error: "clipkit edit retime" requires "--scale <factor>" (e.g. --scale 1.5).');
      return 2;
    }
    result = retimeClip(clip, scale);
  } else if (operation === 'scale-amplitude') {
    const scale = options.scale != null ? Number(options.scale) : null;
    if (scale == null || Number.isNaN(scale)) {
      console.error(
        'Error: "clipkit edit scale-amplitude" requires "--scale <factor>" (e.g. --scale 0.8).',
      );
      return 2;
    }
    const filter = options.channels ? options.channels.split(',').map((s) => s.trim()) : null;
    result = scaleAmplitude(clip, scale, filter);
  } else if (operation === 'close-loop') {
    result = closeLoop(clip);
  } else if (operation === 'overlap') {
    const delayStep = options.delay != null ? Number(options.delay) : undefined;
    const damping = options.damping != null ? Number(options.damping) : undefined;
    const overshootScale = options.overshoot != null ? Number(options.overshoot) : undefined;
    const frequency = options.freq != null ? Number(options.freq) : undefined;
    result = applyOverlap(clip, {
      delayStep,
      damping,
      overshootScale,
      frequency,
    });
  }

  const jsonStr = formatDeterministicJson(result);
  if (options.output) {
    try {
      writeOutputFile(options.output, jsonStr, options);
      console.log(`Successfully edited clip and wrote to: ${options.output}`);
    } catch (e) {
      console.error(`Error writing output: ${e.message}`);
      return 2;
    }
  } else {
    console.log(jsonStr);
  }

  return 0;
}

import fs from 'node:fs';
import path from 'node:path';
import { importBvhToClip } from '../../infrastructure/mocap/bvh-parser.js';
import { importVrmaToClip } from '../../infrastructure/vrma/vrma-importer.js';
import { formatDeterministicJson } from '../io.js';

export async function runImport(args, options = {}) {
  const filePath = args[0];

  if (!filePath) {
    console.error('Error: "clipkit import" requires an input file (.vrma, .glb, or .bvh).');
    console.error('Example: clipkit import motion.vrma --output imported_clip.json');
    return 2;
  }

  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: File "${filePath}" does not exist.`);
    return 2;
  }

  const ext = path.extname(resolved).toLowerCase();
  let resultClip = null;
  let telemetry = null;

  try {
    const epsilon = options.epsilon != null ? Number(options.epsilon) : 0.8;
    const filterJitter = options.filterJitter === true;

    if (ext === '.vrma' || ext === '.glb') {
      const buffer = fs.readFileSync(resolved);
      const res = importVrmaToClip(buffer, {
        epsilon,
        filterJitter,
      });
      resultClip = res.clip;
      telemetry = res.telemetry;
    } else if (ext === '.bvh') {
      const text = fs.readFileSync(resolved, 'utf8');
      const res = importBvhToClip(text, {
        epsilon,
        filterJitter,
      });
      resultClip = res.clip;
      telemetry = res.telemetry;
    } else {
      console.error(`Error: Unsupported file format "${ext}". Supported: .vrma, .glb, .bvh`);
      return 2;
    }
  } catch (err) {
    console.error(`Error importing file "${filePath}": ${err.message}`);
    return 3;
  }

  // Print telemetry report if requested
  if (options.report || options.verbose) {
    console.error('--- Import & Keyframe Compression Telemetry ---');
    console.error(`Raw Samples: ${telemetry.totalRawKeys}`);
    console.error(`Compressed Keys: ${telemetry.totalCompressedKeys}`);
    console.error(`Sample Reduction: ${telemetry.reductionRatio}%`);
    console.error(`Avg Angular Error: ${telemetry.avgAngularError}°`);
    console.error(`Max Channel Error: ${telemetry.maxChannelError}°`);
    console.error('------------------------------------------------');
  }

  const outJson = formatDeterministicJson(resultClip);

  if (options.output || options.out) {
    const outPath = path.resolve(process.cwd(), options.output || options.out);
    fs.writeFileSync(outPath, outJson + '\n', 'utf8');
    if (!options.json) {
      console.log(`Saved imported clip to ${outPath} (${telemetry.reductionRatio}% reduction)`);
    }
  } else {
    process.stdout.write(outJson + '\n');
  }

  return 0;
}

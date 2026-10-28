import fs from 'node:fs';
import path from 'node:path';
import { loadRigs } from '../../data/load-rigs.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { buildVrmaGlb } from '../../infrastructure/vrma/vrma-exporter.js';
import { readInput, resolveSafeOutputPath } from '../io.js';

export async function runExport(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error('Usage: clipkit export <clip-file> [--out <vrma-file>] [--force]');
  }

  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: Unreadable JSON input: ${e.message}`);
    return 2;
  }

  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  const blob = buildVrmaGlb(motus, ctx, clip);
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let outPath = options.out;
  if (!outPath) {
    const baseName =
      inputPath === '-' ? clip.name || 'clip' : path.basename(inputPath, path.extname(inputPath));
    outPath = `${baseName}.vrma`;
  }

  if (outPath === '-') {
    process.stdout.write(buffer);
    return 0;
  }

  try {
    const safeOut = resolveSafeOutputPath(outPath, {
      force: options.force,
      allowOutside: options.allowOutside,
    });
    fs.writeFileSync(safeOut, buffer);
    console.log(`Exported .vrma (${buffer.length} bytes) to: ${safeOut}`);
    return 0;
  } catch (err) {
    console.error(`Export failed: ${err.message}`);
    return 2;
  }
}

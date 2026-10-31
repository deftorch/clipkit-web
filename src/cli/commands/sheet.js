import fs from 'node:fs';
import path from 'node:path';
import { loadRigs } from '../../data/load-rigs.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { renderContactSheet } from '../../presentation/export/contact-sheet-renderer.js';
import { formatDeterministicJson, readInput, resolveSafeOutputPath } from '../io.js';

export function runSheet(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error('Usage: clipkit sheet <clip-file> [--dir <dir>] [--frames <n>] [--silhouette]');
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

  const frameCount = options.frames ? parseInt(options.frames, 10) : 8;
  const sheetRes = renderContactSheet(motus, ctx, clip, {
    frameCount,
    silhouette: options.silhouette,
    view: options.view || 'perspective',
  });

  const baseName =
    inputPath === '-' ? clip.name || 'clip' : path.basename(inputPath, path.extname(inputPath));

  let targetDir = options.dir || '.';
  let svgFilename;
  let metaFilename;

  if (options.out) {
    if (options.out.endsWith('.svg')) {
      svgFilename = options.out;
      targetDir = path.dirname(options.out);
      const outBase = path.basename(options.out, '.svg');
      metaFilename = path.join(targetDir, `${outBase}_sheet.json`);
    } else {
      targetDir = options.out;
      svgFilename = path.join(targetDir, `${baseName}_sheet.svg`);
      metaFilename = path.join(targetDir, `${baseName}_sheet.json`);
    }
  } else {
    svgFilename = path.join(targetDir, `${baseName}_sheet.svg`);
    metaFilename = path.join(targetDir, `${baseName}_sheet.json`);
  }

  try {
    const safeSvgPath = resolveSafeOutputPath(svgFilename, {
      force: options.force,
      allowOutside: options.allowOutside,
    });
    fs.writeFileSync(safeSvgPath, sheetRes.svg, 'utf8');

    const safeMetaPath = resolveSafeOutputPath(metaFilename, {
      force: options.force,
      allowOutside: options.allowOutside,
    });
    fs.writeFileSync(safeMetaPath, formatDeterministicJson(sheetRes.metadata), 'utf8');

    if (options.json) {
      console.log(
        formatDeterministicJson({
          sheetPath: safeSvgPath,
          metadataPath: safeMetaPath,
          metadata: sheetRes.metadata,
        }),
      );
    } else {
      console.log(`Contact sheet generated successfully:`);
      console.log(`  SVG image : ${safeSvgPath}`);
      console.log(`  Metadata  : ${safeMetaPath}`);
    }
    return 0;
  } catch (err) {
    console.error(`Sheet generation failed: ${err.message}`);
    return 2;
  }
}

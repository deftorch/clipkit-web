import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadRigs } from '../../data/load-rigs.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import {
  renderContactSheet,
  renderSingleFrameSvg,
} from '../../presentation/export/contact-sheet-renderer.js';
import { formatDeterministicJson, readInput, resolveSafeOutputPath } from '../io.js';

export function runSheet(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error(
      'Usage: clipkit sheet <clip-file> [--dir <dir>] [--frames <n>] [--silhouette] [--png] [--gif]',
    );
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
    if (
      options.out.endsWith('.svg') ||
      options.out.endsWith('.png') ||
      options.out.endsWith('.gif')
    ) {
      const ext = path.extname(options.out);
      targetDir = path.dirname(options.out);
      const outBase = path.basename(options.out, ext);
      svgFilename = path.join(targetDir, `${outBase}_sheet.svg`);
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

    let pngPath = null;
    if (options.png || options.out?.endsWith('.png')) {
      const pngFilename = svgFilename.replace(/\.svg$/, '.png');
      try {
        const safePngPath = resolveSafeOutputPath(pngFilename, {
          force: options.force,
          allowOutside: options.allowOutside,
        });
        execSync(`ffmpeg -y -i "${safeSvgPath}" -frames:v 1 "${safePngPath}" 2>/dev/null`);
        pngPath = safePngPath;
      } catch (_e) {
        try {
          execSync(`cairosvg "${safeSvgPath}" -o "${pngFilename}" 2>/dev/null`);
          pngPath = pngFilename;
        } catch (_e2) {
          console.warn(
            'Warning: Could not generate PNG. Please ensure ffmpeg or cairosvg is installed.',
          );
        }
      }
    }

    let gifPath = null;
    if (options.gif || options.out?.endsWith('.gif')) {
      const gifFilename = svgFilename.replace(/\.svg$/, '.gif');
      try {
        const safeGifPath = resolveSafeOutputPath(gifFilename, {
          force: options.force,
          allowOutside: options.allowOutside,
        });
        const tmpDir = path.join(
          '/tmp',
          `clipkit_gif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        );
        fs.mkdirSync(tmpDir, { recursive: true });

        const gifFps = 15;
        const dur = clip.duration || 1.0;
        const numFrames = Math.max(6, Math.min(60, Math.round(dur * gifFps)));

        for (let i = 0; i < numFrames; i++) {
          const t = (i / numFrames) * dur;
          const frameSvg = renderSingleFrameSvg(motus, ctx, clip, t, {
            silhouette: options.silhouette,
          });
          const frameFile = path.join(tmpDir, `f_${String(i).padStart(3, '0')}.svg`);
          fs.writeFileSync(frameFile, frameSvg, 'utf8');
        }

        execSync(
          `ffmpeg -y -framerate ${gifFps} -i "${tmpDir}/f_%03d.svg" -vf "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${safeGifPath}" 2>/dev/null`,
        );
        fs.rmSync(tmpDir, { recursive: true, force: true });
        gifPath = safeGifPath;
      } catch (err) {
        console.warn(`Warning: Could not generate animated GIF: ${err.message}`);
      }
    }

    if (options.json) {
      console.log(
        formatDeterministicJson({
          sheetPath: safeSvgPath,
          pngPath,
          gifPath,
          metadataPath: safeMetaPath,
          metadata: sheetRes.metadata,
        }),
      );
    } else {
      console.log(`Contact sheet generated successfully:`);
      console.log(`  SVG image : ${safeSvgPath}`);
      if (pngPath) console.log(`  PNG image : ${pngPath}`);
      if (gifPath) console.log(`  GIF anim  : ${gifPath}`);
      console.log(`  Metadata  : ${safeMetaPath}`);
    }
    return 0;
  } catch (err) {
    console.error(`Sheet generation failed: ${err.message}`);
    return 2;
  }
}

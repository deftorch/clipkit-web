import fs from 'node:fs';
import path from 'node:path';
import limitsData from '../../data/limits.json';
import { loadRigs } from '../../data/load-rigs.js';
import partsData from '../../data/parts.json';
import { computeCombatFrameData } from '../../domain/animation/combat-analytics.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { validateSchema } from '../../domain/validation/schema-validator.js';
import { validate } from '../../domain/validation/validator.js';
import { renderContactSheet } from '../../presentation/export/contact-sheet-renderer.js';
import { formatDeterministicJson, readInput, resolveSafeOutputPath } from '../io.js';

export function runCheck(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error('Usage: clipkit check <clip-file> [--sheet <dir>] [--json]');
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
  const style = options.style || 'stylized';
  const failOn = options.failOn || 'fail';

  // Step 1: Schema validation first
  const schemaRes = validateSchema(clip, motus);
  if (!schemaRes.valid) {
    const fails = schemaRes.errors;
    if (options.json) {
      console.log(
        formatDeterministicJson({
          valid: false,
          stage: 'schema',
          failCount: fails.length,
          warnCount: 0,
          issues: fails.map((f) => f.issue),
        }),
      );
    } else {
      console.error(`FAIL: Schema error(s) in ${inputPath}:`);
      for (const err of fails) {
        console.error(`  - [${err.path}] ${err.message}`);
        if (err.hint) console.error(`    Hint: ${err.hint}`);
      }
    }
    return 1;
  }

  // Step 2: Kinematic & physics validation
  const valRes = validate(motus, ctx, limitsData, clip, style, undefined, {
    part: options.part,
    parts: partsData,
  });

  const fails = valRes.issues.filter((i) => i.level === 'FAIL');
  const warns = valRes.issues.filter((i) => i.level === 'WARN');
  const isPass = failOn === 'warn' ? fails.length === 0 && warns.length === 0 : fails.length === 0;

  // Step 3: Optional Contact Sheet rendering
  let sheetInfo = null;
  if (options.sheet) {
    const targetDir = options.sheet;
    const baseName =
      inputPath === '-' ? clip.name || 'clip' : path.basename(inputPath, path.extname(inputPath));

    const sheetRes = renderContactSheet(motus, ctx, clip, {
      frameCount: options.frames ? parseInt(options.frames, 10) : 8,
      silhouette: options.silhouette,
      view: options.view || 'perspective',
    });

    try {
      const safeSvgPath = resolveSafeOutputPath(path.join(targetDir, `${baseName}_sheet.svg`), {
        force: options.force,
        allowOutside: options.allowOutside,
      });
      const safeMetaPath = resolveSafeOutputPath(path.join(targetDir, `${baseName}_sheet.json`), {
        force: options.force,
        allowOutside: options.allowOutside,
      });

      fs.writeFileSync(safeSvgPath, sheetRes.svg, 'utf8');
      fs.writeFileSync(safeMetaPath, formatDeterministicJson(sheetRes.metadata), 'utf8');

      sheetInfo = {
        imagePath: safeSvgPath,
        metadataPath: safeMetaPath,
        rootTravel: sheetRes.metadata.rootTravel,
        bounds: sheetRes.metadata.bounds,
      };
    } catch (err) {
      console.error(`Warning: Failed to write contact sheet: ${err.message}`);
    }
  }

  // Step 4: Optional Combat Frame Data
  const combatData = computeCombatFrameData(motus, ctx, clip, {
    force: !!options.combat,
  });

  // Output formatting
  let displayIssues = valRes.issues;
  if (options.maxIssues && options.maxIssues > 0) {
    displayIssues = displayIssues.slice(0, Number(options.maxIssues));
  }

  if (options.json) {
    console.log(
      formatDeterministicJson({
        valid: isPass,
        stage: 'validation',
        style,
        failCount: fails.length,
        warnCount: warns.length,
        issueCount: valRes.issues.length,
        issues: displayIssues,
        sheet: sheetInfo,
        combat: combatData || undefined,
      }),
    );
  } else {
    const status = isPass ? 'PASS' : 'FAIL';
    console.log(
      `${status}: ${inputPath} [${style}] — ${fails.length} failure(s), ${warns.length} warning(s)`,
    );

    if (combatData) {
      console.log(
        `Combat Frame Data (60 FPS): [Startup: ${combatData.frameData.startup}f | Active: ${combatData.frameData.active}f | Recovery: ${combatData.frameData.recovery}f] (Total: ${combatData.totalFrames}f / ${combatData.durationSec}s)`,
      );
      console.log(
        `Hitbox Anchor: ${combatData.hitboxAnchor.joint} (Peak Speed: ${combatData.hitboxAnchor.peakSpeed_ms} m/s @t=${combatData.hitboxAnchor.peakSpeed_t}s)`,
      );
    }

    if (sheetInfo) {
      console.log(`Contact sheet: ${sheetInfo.imagePath}`);
    }

    if (displayIssues.length > 0) {
      console.log('\nIssues:');
      for (const iss of displayIssues) {
        const target = iss.channel || iss.joint || '';
        const tStr = iss.t != null ? `@${iss.t.toFixed(2)}s` : '';
        const loc = target || tStr ? ` (${[target, tStr].filter(Boolean).join(' ')})` : '';
        console.log(`  [${iss.level}] ${iss.rule}${loc}`);
        if (iss.hint) {
          console.log(`    Hint: ${iss.hint}`);
        }
      }
    }
  }

  return isPass ? 0 : 1;
}

import path from 'node:path';
import { defaultClips } from '../../data/index.js';
import limitsData from '../../data/limits.json';
import { loadRigs } from '../../data/load-rigs.js';
import { compareClips } from '../../domain/animation/compare.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { renderComparisonContactSheet } from '../../presentation/export/contact-sheet-renderer.js';
import { formatDeterministicJson, readInput, writeOutputFile } from '../io.js';

export async function runCompare(args, options = {}) {
  const targetA = args[0];
  const targetB = args[1];

  if (!targetA || !targetB) {
    console.error('Error: "clipkit compare" requires two clips to compare.');
    console.error('Example: clipkit compare jump jump_v2.json --sheet ./out');
    return 2;
  }

  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const style = options.style || 'stylized';

  async function loadClip(target) {
    if (defaultClips[target]) {
      return JSON.parse(JSON.stringify(defaultClips[target]));
    }
    const raw = await readInput(target);
    return JSON.parse(raw);
  }

  let clipA, clipB;
  try {
    clipA = await loadClip(targetA);
  } catch (e) {
    console.error(`Error reading clip A (${targetA}): ${e.message}`);
    return 2;
  }
  try {
    clipB = await loadClip(targetB);
  } catch (e) {
    console.error(`Error reading clip B (${targetB}): ${e.message}`);
    return 2;
  }

  const comparison = compareClips(motus, ctx, limitsData, clipA, clipB, style);

  let sheetPath = null;
  if (options.sheet) {
    const sheetResult = renderComparisonContactSheet(motus, ctx, clipA, clipB, options);
    const nameA = clipA.name || 'clipA';
    const nameB = clipB.name || 'clipB';
    const svgFileName = `compare_${nameA}_vs_${nameB}.svg`;
    sheetPath = path.resolve(options.sheet, svgFileName);

    try {
      writeOutputFile(sheetPath, sheetResult.svg, options);
    } catch (e) {
      console.error(`Error writing comparison sheet: ${e.message}`);
      return 2;
    }
  }

  const outputData = {
    ...comparison,
    sheet: sheetPath,
  };

  if (options.json) {
    console.log(formatDeterministicJson(outputData));
  } else {
    console.log(`\nComparison: [A] ${clipA.name || targetA} vs [B] ${clipB.name || targetB}`);
    console.log('='.repeat(60));
    console.log(
      `Duration:            ${comparison.metricsA.duration.toFixed(2)}s  ->  ${comparison.metricsB.duration.toFixed(2)}s  (${comparison.diff.duration >= 0 ? '+' : ''}${comparison.diff.duration}s)`,
    );
    console.log(
      `Root Travel:         ${comparison.metricsA.rootTravel.toFixed(2)}m  ->  ${comparison.metricsB.rootTravel.toFixed(2)}m  (${comparison.diff.rootTravel >= 0 ? '+' : ''}${comparison.diff.rootTravel}m)`,
    );
    console.log(
      `Airtime:             ${comparison.metricsA.airtime.toFixed(2)}s  ->  ${comparison.metricsB.airtime.toFixed(2)}s  (${comparison.diff.airtime >= 0 ? '+' : ''}${comparison.diff.airtime}s)`,
    );
    console.log(
      `Peak Angular Speed:  ${comparison.metricsA.peakAngularSpeed.toFixed(0)}°/s (${comparison.metricsA.peakJoint})  ->  ${comparison.metricsB.peakAngularSpeed.toFixed(0)}°/s (${comparison.metricsB.peakJoint})`,
    );
    console.log(
      `Issues (Fail/Warn):  ${comparison.metricsA.issues.fail}/${comparison.metricsA.issues.warn}  ->  ${comparison.metricsB.issues.fail}/${comparison.metricsB.issues.warn}`,
    );

    if (sheetPath) {
      console.log(`\nComparison contact sheet saved to:\n  ${sheetPath}`);
    }
    console.log('');
  }

  return 0;
}

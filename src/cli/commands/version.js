import fs from 'node:fs';
import path from 'node:path';
import { defaultClips } from '../../data/index.js';
import limitsData from '../../data/limits.json';
import { loadRigs } from '../../data/load-rigs.js';
import { computeClipMetrics } from '../../domain/animation/compare.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { formatDeterministicJson, readInput, writeOutputFile } from '../io.js';

export async function runVersion(args, options = {}) {
  const target = args[0];
  if (!target) {
    console.error('Error: "clipkit version" requires a clip file or clip name.');
    console.error('Example: clipkit version jump.json --parent 1 --note "Floatier apex"');
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

  const clipName = clip.name || 'unnamed_clip';
  const versionNum = clip.version || 1;
  const parentVer =
    options.parent != null ? Number(options.parent) : versionNum > 1 ? versionNum - 1 : null;
  const note =
    options.note ||
    (clip.changelog && clip.changelog.length
      ? clip.changelog[clip.changelog.length - 1].catatan
      : 'Version snapshot');

  const destDir = options.dir
    ? path.resolve(process.cwd(), options.dir)
    : path.resolve(process.cwd(), 'variants', clipName);

  const versionFileName = `v${versionNum}.json`;
  const versionFilePath = path.join(destDir, versionFileName);

  // Check overwrite protection
  if (fs.existsSync(versionFilePath) && !options.force) {
    console.error(
      `Error: Version file '${versionFileName}' already exists in ${destDir}. Refusing to overwrite without --force.`,
    );
    return 1;
  }

  // Compute metrics for manifest
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const metrics = computeClipMetrics(motus, ctx, limitsData, clip, options.style || 'stylized');

  // Read existing manifest if any
  const manifestPath = path.join(destDir, 'manifest.json');
  let manifest = {
    name: clipName,
    defaultVersion: versionNum,
    versions: {},
  };

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (_e) {
      // Use clean initialized manifest
    }
  }

  manifest.defaultVersion = versionNum;
  manifest.versions[String(versionNum)] = {
    version: versionNum,
    file: versionFileName,
    parent: parentVer,
    note,
    metrics: {
      duration: metrics.duration,
      rootTravel: metrics.rootTravel,
      airtime: metrics.airtime,
      peakAngularSpeed: metrics.peakAngularSpeed,
      issues: metrics.issues,
    },
  };

  try {
    writeOutputFile(versionFilePath, formatDeterministicJson(clip), options);
    writeOutputFile(manifestPath, formatDeterministicJson(manifest), { ...options, force: true });
  } catch (e) {
    console.error(`Error saving version or manifest: ${e.message}`);
    return 2;
  }

  const result = {
    clip: clipName,
    version: versionNum,
    parent: parentVer,
    note,
    path: versionFilePath,
    manifest: manifestPath,
    metrics: manifest.versions[String(versionNum)].metrics,
  };

  if (options.json) {
    console.log(formatDeterministicJson(result));
  } else {
    console.log(`\nCreated immutable version v${versionNum} for '${clipName}':`);
    console.log(`  File:     ${versionFilePath}`);
    console.log(`  Parent:   ${parentVer != null ? `v${parentVer}` : 'None (root)'}`);
    console.log(`  Note:     ${note}`);
    console.log(`  Manifest: ${manifestPath}`);
    console.log(
      `  Metrics:  dur=${metrics.duration}s, travel=${metrics.rootTravel}m, air=${metrics.airtime}s, peakSpeed=${metrics.peakAngularSpeed}°/s`,
    );
    console.log('');
  }

  return 0;
}

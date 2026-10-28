import { defaultPoses } from '../../data/poses/index.js';
import { formatDeterministicJson } from '../io.js';

export function runPoses(args, options = {}) {
  const sub = args[0];

  if (!sub || sub === 'list') {
    const partFilter = options.part;
    const poses = Object.values(defaultPoses)
      .filter((p) => !partFilter || p.part === partFilter)
      .map((p) => ({
        name: p.name,
        part: p.part,
        description: p.description,
        channelCount: Object.keys(p.channels || {}).length,
        hasExpressions: !!p.expressions,
      }));

    if (options.json) {
      console.log(formatDeterministicJson(poses));
    } else {
      console.log(`\nClipKit Pose Library (${poses.length} poses):\n`);
      for (const p of poses) {
        console.log(`  - ${p.name.padEnd(16)} [${p.part}] ${p.description || ''}`);
      }
      console.log('');
    }
    return 0;
  }

  if (sub === 'show') {
    const name = args[1];
    if (!name) {
      console.error('Error: "poses show" requires a pose name, e.g. "clipkit poses show fist_L"');
      return 2;
    }

    const pose = defaultPoses[name];
    if (!pose) {
      console.error(
        `Error: Unknown pose "${name}". Use "clipkit poses list" to view available poses.`,
      );
      return 1;
    }

    if (options.json) {
      console.log(formatDeterministicJson(pose));
    } else {
      console.log(`\nPose: ${pose.name} [part: ${pose.part}]`);
      if (pose.description) console.log(`Description: ${pose.description}`);
      console.log('\nChannels:');
      for (const [ch, kfs] of Object.entries(pose.channels || {})) {
        console.log(`  ${ch.padEnd(16)}: ${JSON.stringify(kfs)}`);
      }
      if (pose.expressions) {
        console.log('\nExpressions:');
        for (const [expr, kfs] of Object.entries(pose.expressions)) {
          console.log(`  ${expr.padEnd(16)}: ${JSON.stringify(kfs)}`);
        }
      }
      console.log('');
    }
    return 0;
  }

  console.error(`Error: Unknown poses subcommand "${sub}". Expected "list" or "show <name>".`);
  return 2;
}

import { defaultClips } from '../../data/index.js';
import { loadRigs } from '../../data/load-rigs.js';
import { evalPose } from '../../domain/rig/pose-evaluator.js';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { formatDeterministicJson, readInput } from '../io.js';

export async function runPose(args, options = {}) {
  const target = args[0];
  if (!target) {
    console.error('Error: "clipkit pose" requires a clip path or clip name.');
    console.error('Example: clipkit pose src/data/clips/slash.json --t 0.5 --json');
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

  const { motus, vrm_sample } = loadRigs();
  const rig = options.rig === 'vrm_sample' ? vrm_sample.rig : motus;
  const ctx = makeCtx(rig);

  const t = options.t != null ? Number(options.t) : 0;
  if (Number.isNaN(t)) {
    console.error(`Error: Invalid timestamp '--t ${options.t}'. Must be a number.`);
    return 2;
  }

  const pose = evalPose(rig, ctx, clip, t);
  const I = ctx.idx;

  // Build dictionary of joint positions by name
  const jointPositions = {};
  for (const [name, idx] of Object.entries(I)) {
    if (pose.pos[idx]) {
      jointPositions[name] = [
        Number(pose.pos[idx][0].toFixed(4)),
        Number(pose.pos[idx][1].toFixed(4)),
        Number(pose.pos[idx][2].toFixed(4)),
      ];
    }
  }

  const filterJoint = options.joint;
  if (filterJoint) {
    if (!jointPositions[filterJoint]) {
      console.error(
        `Error: Unknown joint '${filterJoint}'. Available joints: ${Object.keys(jointPositions).join(', ')}`,
      );
      return 2;
    }
  }

  const result = {
    clip: clip.name || target,
    t: Number(t.toFixed(3)),
    duration: clip.duration || 1.0,
    root: [
      Number(pose.root[0].toFixed(4)),
      Number(pose.root[1].toFixed(4)),
      Number(pose.root[2].toFixed(4)),
    ],
    hips: [
      Number(pose.hips[0].toFixed(4)),
      Number(pose.hips[1].toFixed(4)),
      Number(pose.hips[2].toFixed(4)),
    ],
    joints: filterJoint ? { [filterJoint]: jointPositions[filterJoint] } : jointPositions,
    channels: pose.cv,
  };

  if (options.json) {
    console.log(formatDeterministicJson(result));
    return 0;
  }

  console.log(`\nPose for '${result.clip}' at t=${result.t}s (duration: ${result.duration}s):`);
  console.log(`  Root: [${result.root.join(', ')}] m`);
  console.log(`  Hips: [${result.hips.join(', ')}] m`);

  if (filterJoint) {
    console.log(`  Joint ${filterJoint}: [${jointPositions[filterJoint].join(', ')}] m\n`);
  } else {
    console.log('\nKey World Joint Positions [X (left), Y (up), Z (front)] (m):');
    const keyJoints = [
      'Head',
      'LeftHand',
      'RightHand',
      'LeftFoot',
      'RightFoot',
      'LeftToeBase',
      'RightToeBase',
    ];
    for (const kj of keyJoints) {
      if (jointPositions[kj]) {
        console.log(
          `  - ${kj.padEnd(14)}: [${jointPositions[kj].map((v) => v.toFixed(3).padStart(6)).join(', ')}]`,
        );
      }
    }
    console.log(
      `\nUse '--joint <name>' to inspect a specific joint or '--json' for all 55 joints.\n`,
    );
  }

  return 0;
}

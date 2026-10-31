import { defaultClips } from '../../data/index.js';
import { loadRigs } from '../../data/load-rigs.js';
import { evalPose } from '../../domain/rig/pose-evaluator.js';
import { makeCtx, restPositions } from '../../domain/rig/rig-context.js';
import {
  computeCenterOfMass,
  isPointInPolygon2D,
} from '../../domain/validation/rules/com-balance.js';
import { formatDeterministicJson, readInput } from '../io.js';

function dist3D(a, b) {
  if (!a || !b) return 0;
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export async function runMeasure(args, options = {}) {
  const target = args[0];
  if (!target) {
    console.error('Error: "clipkit measure" requires a clip path or clip name.');
    console.error('Example: clipkit measure src/data/clips/slash.json --t 0.5 --json');
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

  const I = ctx.idx;
  const restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  const pose = evalPose(rig, ctx, clip, t);

  const leftFoot = pose.pos[I.LeftFoot];
  const rightFoot = pose.pos[I.RightFoot];
  const leftToe = pose.pos[I.LeftToeBase];
  const rightToe = pose.pos[I.RightToeBase];
  const head = pose.pos[I.Head];
  const leftHand = pose.pos[I.LeftHand];
  const rightHand = pose.pos[I.RightHand];

  const heelHeight = {
    left_m: Number((leftFoot[1] - floorY).toFixed(4)),
    right_m: Number((rightFoot[1] - floorY).toFixed(4)),
  };

  const toeHeight = {
    left_m: Number((leftToe[1] - floorY).toFixed(4)),
    right_m: Number((rightToe[1] - floorY).toFixed(4)),
  };

  const handHeadDist = {
    left_m: Number(dist3D(leftHand, head).toFixed(4)),
    right_m: Number(dist3D(rightHand, head).toFixed(4)),
  };

  const handHeightRelHead = {
    left_m: Number((leftHand[1] - head[1]).toFixed(4)),
    right_m: Number((rightHand[1] - head[1]).toFixed(4)),
  };

  const stanceWidth = Number(Math.abs(leftFoot[0] - rightFoot[0]).toFixed(4));
  const stanceStagger = Number(Math.abs(leftFoot[2] - rightFoot[2]).toFixed(4));

  // Compute Center of Mass and balance
  const com = computeCenterOfMass(pose, ctx);
  const supportPoly = [
    [leftFoot[0], leftFoot[2]],
    [leftToe[0], leftToe[2]],
    [rightToe[0], rightToe[2]],
    [rightFoot[0], rightFoot[2]],
  ];
  const com2D = [com[0], com[2]];
  const balance = isPointInPolygon2D(com2D, supportPoly, 0.04);

  const result = {
    clip: clip.name || target,
    t: Number(t.toFixed(3)),
    floorY: Number(floorY.toFixed(4)),
    heel_height_m: heelHeight,
    toe_height_m: toeHeight,
    hand_head_dist_m: handHeadDist,
    hand_height_rel_head_m: handHeightRelHead,
    stance: {
      width_m: stanceWidth,
      stagger_m: stanceStagger,
    },
    com: {
      position_m: [Number(com[0].toFixed(4)), Number(com[1].toFixed(4)), Number(com[2].toFixed(4))],
      inside_base_of_support: balance.inside,
      deviation_m: Number(balance.distance.toFixed(4)),
    },
    torso_rotations_deg: {
      lean: pose.cv.lean || 0,
      side_lean: pose.cv.side_lean || 0,
      twist: pose.cv.twist || 0,
      hip_pitch: pose.cv.hip_pitch || 0,
      hip_twist: pose.cv.hip_twist || 0,
      hip_roll: pose.cv.hip_roll || 0,
    },
  };

  if (options.json) {
    console.log(formatDeterministicJson(result));
    return 0;
  }

  console.log(`\nKinematic & Anatomical Measurements for '${result.clip}' at t=${result.t}s:`);
  console.log('------------------------------------------------------------');
  console.log(`Feet & Floor Clearance (floorY = ${result.floorY}m):`);
  console.log(
    `  Heel Height (m)       : Left: ${(heelHeight.left_m * 100).toFixed(1)} cm | Right: ${(heelHeight.right_m * 100).toFixed(1)} cm`,
  );
  console.log(
    `  Toe Height (m)        : Left: ${(toeHeight.left_m * 100).toFixed(1)} cm | Right: ${(toeHeight.right_m * 100).toFixed(1)} cm`,
  );
  console.log(`Stance Geometry:`);
  console.log(`  Stance Width (lateral): ${(stanceWidth * 100).toFixed(1)} cm`);
  console.log(`  Stance Stagger (depth): ${(stanceStagger * 100).toFixed(1)} cm`);
  console.log(`Hands Relative to Head:`);
  console.log(
    `  Distance to Head      : Left: ${(handHeadDist.left_m * 100).toFixed(1)} cm | Right: ${(handHeadDist.right_m * 100).toFixed(1)} cm`,
  );
  console.log(
    `  Height rel to Head    : Left: ${handHeightRelHead.left_m >= 0 ? '+' : ''}${(handHeightRelHead.left_m * 100).toFixed(1)} cm | Right: ${handHeightRelHead.right_m >= 0 ? '+' : ''}${(handHeightRelHead.right_m * 100).toFixed(1)} cm`,
  );
  console.log(`Center of Mass (CoM):`);
  console.log(
    `  Position              : [${result.com.position_m.map((v) => v.toFixed(3)).join(', ')}] m`,
  );
  console.log(
    `  Support Polygon Check : ${balance.inside ? 'STABLE (inside base of support)' : `UNSTABLE (${(balance.distance * 100).toFixed(1)} cm outside)`}`,
  );
  console.log(`Torso Rotations:`);
  console.log(
    `  Torso Twist / Lean    : twist: ${result.torso_rotations_deg.twist}°, lean: ${result.torso_rotations_deg.lean}°, side_lean: ${result.torso_rotations_deg.side_lean}°`,
  );
  console.log(
    `  Pelvis Twist / Pitch  : hip_twist: ${result.torso_rotations_deg.hip_twist}°, hip_pitch: ${result.torso_rotations_deg.hip_pitch}°`,
  );
  console.log('');

  return 0;
}

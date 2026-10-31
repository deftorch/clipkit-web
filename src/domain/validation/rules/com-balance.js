import { isFootPlanted } from '../../rig/foot-ik-solver.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

/**
 * Anatomical mass distribution weights (Dempster / Winter anthropometric standards).
 */
const SEGMENT_WEIGHTS = {
  Head: 0.08,
  Spine: 0.15,
  Spine1: 0.15,
  Spine2: 0.15,
  Hips: 0.15,
  LeftArm: 0.025,
  LeftForeArm: 0.025,
  RightArm: 0.025,
  RightForeArm: 0.025,
  LeftUpLeg: 0.055,
  LeftLeg: 0.055,
  RightUpLeg: 0.055,
  RightLeg: 0.055,
};

/**
 * Computes 3D Center of Mass (CoM) from pose joint positions.
 *
 * @param {object} pose
 * @param {object} ctx
 * @returns {number[]} [x, y, z] CoM coordinates in meters
 */
export function computeCenterOfMass(pose, ctx) {
  const I = ctx.idx;
  let totalWeight = 0;
  let cx = 0,
    cy = 0,
    cz = 0;

  for (const [bone, weight] of Object.entries(SEGMENT_WEIGHTS)) {
    const idx = I[bone];
    if (idx != null && pose.pos[idx]) {
      const p = pose.pos[idx];
      cx += p[0] * weight;
      cy += p[1] * weight;
      cz += p[2] * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight < 1e-4) {
    const hips = pose.pos[I.Hips] || [0, 0.9, 0];
    return hips.slice();
  }

  return [cx / totalWeight, cy / totalWeight, cz / totalWeight];
}

/**
 * Checks whether a 2D point (x, z) lies within a 2D polygon with a safety margin.
 *
 * @param {number[]} pt - [x, z]
 * @param {Array<number[]>} poly - Array of [x, z] vertices
 * @param {number} margin - Safety margin in meters
 * @returns {{ inside: boolean, distance: number }}
 */
export function isPointInPolygon2D(pt, poly, margin = 0.03) {
  if (!poly || poly.length < 2) {
    if (poly && poly.length === 1) {
      const d = Math.hypot(pt[0] - poly[0][0], pt[1] - poly[0][1]);
      return { inside: d <= margin, distance: Math.max(0, d - margin) };
    }
    return { inside: false, distance: 0 };
  }

  // Ray-casting algorithm for point in polygon
  const x = pt[0];
  const z = pt[1];
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      zi = poly[i][1];
    const xj = poly[j][0],
      zj = poly[j][1];

    const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }

  // Compute minimum distance to polygon boundary segments
  let minDist = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const x1 = poly[i][0],
      z1 = poly[i][1];
    const x2 = poly[j][0],
      z2 = poly[j][1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const lenSq = dx * dx + dz * dz;

    let dist = 0;
    if (lenSq < 1e-8) {
      dist = Math.hypot(x - x1, z - z1);
    } else {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (z - z1) * dz) / lenSq));
      dist = Math.hypot(x - (x1 + t * dx), z - (z1 + t * dz));
    }
    if (dist < minDist) minDist = dist;
  }

  if (inside) {
    return { inside: true, distance: 0 };
  }

  const effectiveDist = Math.max(0, minDist - margin);
  return { inside: effectiveDist <= 1e-5, distance: effectiveDist };
}

/**
 * Validates dynamic Center of Mass balance over the Base of Support polygon.
 *
 * @param {object} params
 * @returns {{ lines: Array<[string, string]>, issues: Array<object> }}
 */
export function check({ ctx, limits, clip, poses, floorY, tAt, FPS = 30 }) {
  const vm = clip.validate || {};
  const isStance =
    clip.name?.includes('stance') ||
    clip.tags?.includes('stance') ||
    clip.claims?.type === 'stance' ||
    vm.stance === true;
  const isExplicit = vm.com_balance === true || vm.balance === true || isStance;

  // Preserve exact baseline reproduction if com_balance is not requested
  if (!isExplicit) {
    return { lines: [], issues: [] };
  }

  const I = ctx.idx;
  const lines = [];
  const issues = [];
  const contactThresh = limits.floor?.contact_height_m || 0.03;
  const maxInstabilityLimit = 0.08; // 8 cm beyond base of support

  let maxInstability = 0;
  let maxInstabilityT = 0;
  let totalFramesChecked = 0;

  for (let f = 0; f < poses.length; f++) {
    const t = tAt(f);
    const pose = poses[f];

    const leftToeY = pose.pos[I.LeftToeBase] ? pose.pos[I.LeftToeBase][1] : floorY;
    const rightToeY = pose.pos[I.RightToeBase] ? pose.pos[I.RightToeBase][1] : floorY;

    const plantedL = isFootPlanted(clip, t, 'Left', leftToeY, floorY, contactThresh);
    const plantedR = isFootPlanted(clip, t, 'Right', rightToeY, floorY, contactThresh);

    // If both feet are in the air (jumping/airborne), static balance is not applicable
    if (!plantedL && !plantedR) continue;

    // Suppress static tipping if horizontal momentum is fast locomotion
    const rootPos = pose.root || [0, 0, 0];
    const prevPose = f > 0 ? poses[f - 1] : pose;
    const prevRoot = prevPose.root || [0, 0, 0];
    const horizSpeed = Math.hypot(rootPos[0] - prevRoot[0], rootPos[2] - prevRoot[2]) * FPS;
    if (horizSpeed > 0.8) continue;

    // Build Base of Support 2D polygon
    const poly = [];
    if (plantedL) {
      const ank = pose.pos[I.LeftFoot];
      const toe = pose.pos[I.LeftToeBase];
      if (ank) poly.push([ank[0], ank[2]]);
      if (toe) poly.push([toe[0], toe[2]]);
    }
    if (plantedR) {
      const toe = pose.pos[I.RightToeBase];
      const ank = pose.pos[I.RightFoot];
      if (toe) poly.push([toe[0], toe[2]]);
      if (ank) poly.push([ank[0], ank[2]]);
    }

    if (poly.length < 2) continue;
    totalFramesChecked++;

    const com = computeCenterOfMass(pose, ctx);
    const com2D = [com[0], com[2]];
    const evalPoly = isPointInPolygon2D(com2D, poly, 0.04);

    if (!evalPoly.inside && evalPoly.distance > maxInstability) {
      maxInstability = evalPoly.distance;
      maxInstabilityT = t;
    }
  }

  const isStable = maxInstability <= maxInstabilityLimit;
  if (totalFramesChecked === 0) {
    if (isStance) {
      lines.push([
        'WARN',
        'keseimbangan CoM: tidak ada frame tumpuan statis pada klip bertipe stance (kaki melayang atau di udara)',
      ]);
      issues.push(
        createIssue({
          level: 'WARN',
          rule: RULE_CODES.COM_BALANCE_UNSTABLE,
          joint: 'Hips',
          t: 0,
          value: null,
          limit: maxInstabilityLimit,
          unit: 'm',
          hint: 'Ensure feet contact the ground to establish a Base of Support polygon for the stance.',
        }),
      );
    } else {
      lines.push([
        'PASS',
        'keseimbangan CoM: tidak ada frame tumpuan statis (fase melayang/dinamis)',
      ]);
    }
  } else if (isStable) {
    lines.push([
      'PASS',
      `keseimbangan CoM: proyeksi pusat massa stabil di dalam batas tumpuan (${(
        maxInstability * 100
      ).toFixed(1)} cm deviasi maks, batas ${(maxInstabilityLimit * 100).toFixed(0)} cm)`,
    ]);
  } else {
    lines.push([
      'WARN',
      `keseimbangan CoM: proyeksi pusat massa di luar batas tumpuan ${(
        maxInstability * 100
      ).toFixed(
        1,
      )} cm @t=${maxInstabilityT.toFixed(2)}s (batas ${(maxInstabilityLimit * 100).toFixed(0)} cm)`,
    ]);
    issues.push(
      createIssue({
        level: 'WARN',
        rule: RULE_CODES.COM_BALANCE_UNSTABLE,
        joint: 'Hips',
        t: maxInstabilityT,
        value: Number(maxInstability.toFixed(3)),
        limit: maxInstabilityLimit,
        unit: 'm',
        hint: 'Adjust lean, hip_roll, or foot placement to bring Center of Mass over the Base of Support polygon.',
      }),
    );
  }

  return { lines, issues };
}

export const comBalanceRule = {
  name: 'com-balance',
  check,
};

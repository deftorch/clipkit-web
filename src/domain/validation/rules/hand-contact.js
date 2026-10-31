import { createIssue, RULE_CODES } from './rule-codes.js';

/**
 * Validates hand environmental contact points and heights (for parkour vaults, climbs, ledges).
 *
 * Declarations supported:
 * - clip.contacts.hand_L / hand_R: { height: 0.9, t: [0.3, 0.5], tolerance: 0.05 }
 * - clip.contacts.hands: { height: 0.9, t: [0.3, 0.5], tolerance: 0.05 }
 * - clip.windows.planted_hand_L / planted_hand_R: [t0, t1]
 */
export function check({ ctx, clip, poses, tAt }) {
  const lines = [];
  const issues = [];
  const I = ctx.idx;

  const handSpecs = [];

  // 1. Check clip.contacts
  const contacts = clip.contacts || {};
  for (const side of ['Left', 'Right']) {
    const key = side === 'Left' ? 'hand_L' : 'hand_R';
    const altKey = side === 'Left' ? 'left_hand' : 'right_hand';
    const spec =
      contacts[key] || contacts[altKey] || (contacts.hands ? { ...contacts.hands } : null);
    const win = clip.windows?.[`planted_hand_${side === 'Left' ? 'L' : 'R'}`];

    if (spec || win) {
      const targetHeight = spec?.height ?? clip.validate?.obstacle_height ?? 0.9;
      const tolerance = spec?.tolerance ?? 0.05;
      let t0 = 0;
      let t1 = clip.duration || 1.0;

      if (Array.isArray(win) && win.length >= 2) {
        t0 = win[0];
        t1 = win[1];
      } else if (spec?.t != null) {
        if (Array.isArray(spec.t)) {
          t0 = spec.t[0];
          t1 = spec.t[1];
        } else {
          t0 = spec.t;
          t1 = spec.t;
        }
      }

      handSpecs.push({
        joint: `${side}Hand`,
        side,
        targetHeight,
        tolerance,
        t0,
        t1,
      });
    }
  }

  if (handSpecs.length === 0) {
    return { lines, issues };
  }

  for (const spec of handSpecs) {
    const jointIdx = I[spec.joint];
    if (jointIdx == null) continue;

    let worstDiff = 0;
    let worstT = spec.t0;
    let worstHandY = 0;
    let sampleCount = 0;
    let bestHandY = null;
    let bestDiff = Infinity;

    for (let f = 0; f < poses.length; f++) {
      const t = tAt(f);
      if (t >= spec.t0 - 1e-4 && t <= spec.t1 + 1e-4) {
        sampleCount++;
        const handPos = poses[f].pos[jointIdx];
        const handY = handPos[1];
        const diff = Math.abs(handY - spec.targetHeight);

        if (diff < bestDiff) {
          bestDiff = diff;
          bestHandY = handY;
        }

        if (diff > worstDiff) {
          worstDiff = diff;
          worstT = t;
          worstHandY = handY;
        }
      }
    }

    if (sampleCount === 0) continue;

    if (worstDiff > spec.tolerance) {
      const isFail = worstDiff > spec.tolerance * 2.5;
      const level = isFail ? 'FAIL' : 'WARN';
      lines.push([
        level,
        `kontak tangan: ${spec.joint} di t=${worstT.toFixed(2)}s berada di Y=${worstHandY.toFixed(3)} m (target ${spec.targetHeight.toFixed(2)} m ± ${spec.tolerance} m, selisih ${worstDiff.toFixed(3)} m)`,
      ]);
      issues.push(
        createIssue({
          level,
          rule: RULE_CODES.HAND_CONTACT_HEIGHT,
          joint: spec.joint,
          t: worstT,
          value: worstHandY,
          limit: spec.targetHeight,
          unit: 'm',
          hint: `Adjust arm angles or shoulder elevation so ${spec.joint} reaches target obstacle height ${spec.targetHeight.toFixed(2)}m (currently ${worstHandY.toFixed(3)}m, error ${worstDiff.toFixed(3)}m).`,
        }),
      );
    } else {
      lines.push([
        'PASS',
        `kontak tangan: ${spec.joint} menumpu di ketinggian ${spec.targetHeight.toFixed(2)} m (terukur ${(bestHandY ?? spec.targetHeight).toFixed(3)} m) pada t=${spec.t0.toFixed(2)}s..${spec.t1.toFixed(2)}s`,
      ]);
    }
  }

  return { lines, issues };
}

export const handContactRule = {
  name: 'hand-contact',
  check,
};

import { qangle, R2D } from '../../math/quat.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

export function check({ ctx, clip, limits, style = 'stylized', poses, frames }) {
  const lines = [];
  const issues = [];
  if (!clip.loop) return { lines, issues };

  const lim = limits.styles[style];
  let worst = 0,
    wb = '';
  for (let i = 0; i < ctx.n; i++) {
    const d = qangle(poses[0].local[i], poses[frames].local[i]) * R2D;
    if (d > worst + 1e-4) {
      worst = d;
      wb = ctx.names[i];
    }
  }
  const isFail = worst > lim.loop_pose_diff_deg;
  lines.push([
    isFail ? 'FAIL' : 'PASS',
    `loop: selisih pose awal-akhir maks ${worst.toFixed(1)}° (${wb})`,
  ]);
  if (isFail) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.LOOP_MISMATCH,
        joint: wb,
        value: worst,
        limit: lim.loop_pose_diff_deg,
        unit: 'deg',
        hint: `Align start and end keyframes for joint ${wb} (current difference: ${worst.toFixed(1)}°, limit: ${lim.loop_pose_diff_deg}°).`,
      }),
    );
  }

  return { lines, issues };
}

export const loopRule = {
  name: 'loop',
  check,
};

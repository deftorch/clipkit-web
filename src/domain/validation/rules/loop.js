import { qangle, R2D } from '../../math/quat.js';

export function check({ ctx, clip, limits, style = 'stylized', poses, frames }) {
  const lines = [];
  if (!clip.loop) return { lines };

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
  lines.push([
    worst > lim.loop_pose_diff_deg ? 'FAIL' : 'PASS',
    `loop: selisih pose awal-akhir maks ${worst.toFixed(1)}° (${wb})`,
  ]);

  return { lines };
}

export const loopRule = {
  name: 'loop',
  check,
};

import { createIssue, RULE_CODES } from './rule-codes.js';

export function check({ limits, clip, style = 'stylized', poses, frames, FPS = 30 }) {
  const lim = limits.styles[style];
  const dur = clip.duration;
  const lines = [];
  const issues = [];

  const r0 = poses[0].root,
    r1 = poses[frames].root,
    dist = Math.hypot(r1[0] - r0[0], r1[2] - r0[2]);
  lines.push(['PASS', `root motion: ${dist.toFixed(2)} m horizontal dalam ${dur.toFixed(2)} s`]);
  let rMax = 0,
    rMaxT = 0;
  const rootSpeed = new Array(frames + 1).fill(0);
  for (let f = 1; f <= frames; f++) {
    const a = poses[f - 1].root,
      b = poses[f].root,
      s = Math.hypot(b[0] - a[0], b[2] - a[2]) * FPS;
    rootSpeed[f] = s;
    if (s > rMax) {
      rMax = s;
      rMaxT = f / FPS;
    }
  }
  if (rMax > 0.01) {
    const t = `kecepatan root maks ${rMax.toFixed(1)} m/s @${rMaxT.toFixed(2)}s`;
    if (rMax > lim.root_speed_fail) {
      lines.push(['FAIL', `${t} > ${lim.root_speed_fail} (terasa seperti teleport)`]);
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.ROOT_MOTION_SPEED,
          joint: 'root',
          t: rMaxT,
          value: rMax,
          limit: lim.root_speed_fail,
          unit: 'm/s',
          hint: `Smooth root motion translation or reduce displacement near t=${rMaxT.toFixed(2)}s.`,
        }),
      );
    } else if (rMax > lim.root_speed_warn) {
      lines.push(['WARN', `${t} > ${lim.root_speed_warn}`]);
      issues.push(
        createIssue({
          level: 'WARN',
          rule: RULE_CODES.ROOT_MOTION_SPEED,
          joint: 'root',
          t: rMaxT,
          value: rMax,
          limit: lim.root_speed_warn,
          unit: 'm/s',
          hint: `Smooth root motion translation or reduce displacement near t=${rMaxT.toFixed(2)}s.`,
        }),
      );
    } else {
      lines.push(['PASS', t]);
    }
  }
  const cl = clip.claims || {};
  if (cl.distance != null) {
    const tol = cl.tolerance ?? 0.1;
    const isDistPass = Math.abs(dist - cl.distance) <= cl.distance * tol;
    lines.push([
      isDistPass ? 'PASS' : 'FAIL',
      `klaim jarak ${cl.distance.toFixed(2)} m (±${Math.round(tol * 100)}%): terukur ${dist.toFixed(
        2,
      )} m`,
    ]);
    if (!isDistPass) {
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.ROOT_MOTION_CLAIM_DIST,
          joint: 'root',
          value: dist,
          limit: cl.distance,
          unit: 'm',
          hint: `Actual root travel ${dist.toFixed(2)}m does not match claimed distance ${cl.distance.toFixed(2)}m (±${Math.round(tol * 100)}%).`,
        }),
      );
    }
  }
  if (cl.duration != null) {
    const tol = cl.tolerance ?? 0.1;
    const isDurPass = Math.abs(dur - cl.duration) <= cl.duration * tol;
    lines.push([
      isDurPass ? 'PASS' : 'FAIL',
      `klaim durasi ${cl.duration.toFixed(2)} s: terukur ${dur.toFixed(2)} s`,
    ]);
    if (!isDurPass) {
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.ROOT_MOTION_CLAIM_DUR,
          value: dur,
          limit: cl.duration,
          unit: 's',
          hint: `Actual duration ${dur.toFixed(2)}s does not match claimed duration ${cl.duration.toFixed(2)}s.`,
        }),
      );
    }
  }

  return { lines, issues, rootSpeed };
}

export const rootMotionRule = {
  name: 'root-motion',
  check,
};

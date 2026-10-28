import { qangle, R2D } from '../../math/quat.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

export function check({ ctx, limits, style = 'stylized', poses, frames, FPS = 30 }) {
  const lim = limits.styles[style];
  const lines = [];
  const issues = [];
  const fx = (v, d = 0) => v.toFixed(d);

  let mS = 0,
    mSb = '',
    mSt = 0,
    mA = 0,
    mAb = '',
    mAt = 0;
  const speedSeries = new Array(frames + 1).fill(0);
  for (let i = 0; i < ctx.n; i++) {
    let prevS = 0;
    for (let f = 1; f <= frames; f++) {
      const s = qangle(poses[f - 1].local[i], poses[f].local[i]) * R2D * FPS;
      speedSeries[f] = Math.max(speedSeries[f], s);
      if (s > mS + 1e-4) {
        mS = s;
        mSb = ctx.names[i];
        mSt = f / FPS;
      }
      const acc = Math.abs(s - prevS) * FPS;
      if (f > 1 && acc > mA + 1e-4) {
        mA = acc;
        mAb = ctx.names[i];
        mAt = f / FPS;
      }
      prevS = s;
    }
  }
  const spTxt = `kecepatan sudut maks ${fx(mS)} °/s (${mSb} @${mSt.toFixed(2)}s)`;
  if (mS > lim.ang_speed_fail) {
    lines.push(['FAIL', `${spTxt} > ${lim.ang_speed_fail}`]);
    const minSpacing = mS / (lim.ang_speed_warn * FPS);
    const pctReduction = Math.round((1 - lim.ang_speed_warn / mS) * 100);
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.SPEED_LIMIT,
        joint: mSb,
        t: mSt,
        value: mS,
        limit: lim.ang_speed_fail,
        unit: 'deg/s',
        hint: `Increase keyframe spacing near t=${mSt.toFixed(2)}s to at least ${minSpacing.toFixed(3)}s or reduce angular rotation by at least ${pctReduction}%.`,
      }),
    );
  } else if (mS > lim.ang_speed_warn) {
    lines.push(['WARN', `${spTxt} > ${lim.ang_speed_warn} (menyentak?)`]);
    const minSpacing = mS / (lim.ang_speed_warn * FPS);
    const pctReduction = Math.round((1 - lim.ang_speed_warn / mS) * 100);
    issues.push(
      createIssue({
        level: 'WARN',
        rule: RULE_CODES.SPEED_LIMIT,
        joint: mSb,
        t: mSt,
        value: mS,
        limit: lim.ang_speed_warn,
        unit: 'deg/s',
        hint: `Increase keyframe spacing near t=${mSt.toFixed(2)}s to at least ${minSpacing.toFixed(3)}s or reduce angular rotation by at least ${pctReduction}%.`,
      }),
    );
  } else {
    lines.push(['PASS', spTxt]);
  }

  lines.push([
    mA > lim.ang_accel_warn ? 'WARN' : 'PASS',
    `percepatan sudut maks ${fx(mA)} °/s² (${mAb} @${mAt.toFixed(2)}s)`,
  ]);
  if (mA > lim.ang_accel_warn) {
    issues.push(
      createIssue({
        level: 'WARN',
        rule: RULE_CODES.ACCEL_LIMIT,
        joint: mAb,
        t: mAt,
        value: mA,
        limit: lim.ang_accel_warn,
        unit: 'deg/s²',
        hint: `Smooth out rapid acceleration changes on joint ${mAb} around t=${mAt.toFixed(2)}s.`,
      }),
    );
  }

  return { lines, issues, speedSeries };
}

export const angularSpeedRule = {
  name: 'angular-speed',
  check,
};

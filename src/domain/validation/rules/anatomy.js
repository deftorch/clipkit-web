import { R2D } from '../../math/quat.js';
import { vcross, vdot, vnorm, vsub } from '../../math/vec3.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

export function check({ ctx, limits, poses, tAt }) {
  const an = limits.anatomy;
  const I = ctx.idx;
  const lines = [];
  const issues = [];
  const fx = (v, d = 0) => v.toFixed(d);

  let kMin = Infinity,
    kMinSide = 'kiri',
    kMinT = 0,
    kMax = -Infinity,
    kMaxSide = 'kiri',
    kMaxT = 0,
    eMax = 0,
    eMaxSide = 'kiri',
    eMaxT = 0,
    nMax = 0,
    nMaxT = 0;
  const ang = (a, b) => R2D * Math.acos(Math.min(1, Math.max(-1, vdot(a, b))));
  for (let f = 0; f < poses.length; f++) {
    const P = poses[f];
    const t = tAt(f);
    const p = P.pos;
    const lax = vnorm(vsub(p[I.LeftUpLeg], p[I.RightUpLeg]));
    for (const s of ['Left', 'Right']) {
      const th = vnorm(vsub(p[I[s + 'Leg']], p[I[s + 'UpLeg']]));
      const sh = vnorm(vsub(p[I[s + 'Foot']], p[I[s + 'Leg']]));
      const flex = R2D * Math.atan2(vdot(vcross(th, sh), lax), vdot(th, sh));
      if (flex < kMin - 1e-4) {
        kMin = flex;
        kMinSide = s === 'Left' ? 'kiri' : 'kanan';
        kMinT = t;
      }
      if (flex > kMax + 1e-4) {
        kMax = flex;
        kMaxSide = s === 'Left' ? 'kiri' : 'kanan';
        kMaxT = t;
      }
      const ua = vnorm(vsub(p[I[s + 'ForeArm']], p[I[s + 'Arm']]));
      const fa = vnorm(vsub(p[I[s + 'Hand']], p[I[s + 'ForeArm']]));
      const elbowAng = ang(ua, fa);
      if (elbowAng > eMax + 1e-4) {
        eMax = elbowAng;
        eMaxSide = s === 'Left' ? 'kiri' : 'kanan';
        eMaxT = t;
      }
    }
    const neckAng = ang(vnorm(vsub(p[I.Neck], p[I.Spine2])), vnorm(vsub(p[I.Head], p[I.Neck])));
    if (neckAng > nMax + 1e-4) {
      nMax = neckAng;
      nMaxT = t;
    }
  }
  const kIsFail = kMin < an.knee_flex_min || kMax > an.knee_flex_max;
  const kTxt = `lutut: fleksi ${fx(kMin, 1)}° (${kMinSide} @${kMinT.toFixed(2)}s) sampai ${fx(kMax, 1)}° (${kMaxSide} @${kMaxT.toFixed(2)}s)`;
  lines.push(
    kIsFail
      ? [
          'FAIL',
          `${kTxt} (batas ${an.knee_flex_min}..${an.knee_flex_max}°, negatif = menekuk terbalik)`,
        ]
      : ['PASS', `${kTxt} (dalam batas ${an.knee_flex_min}..${an.knee_flex_max}°)`],
  );
  if (kMin < an.knee_flex_min) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.ANATOMY_KNEE,
        joint: kMinSide === 'kiri' ? 'LeftLeg' : 'RightLeg',
        t: kMinT,
        value: kMin,
        limit: an.knee_flex_min,
        unit: 'deg',
        hint: `Increase knee angle by at least ${(an.knee_flex_min - kMin).toFixed(1)}° to avoid negative hyperextension.`,
      }),
    );
  }
  if (kMax > an.knee_flex_max) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.ANATOMY_KNEE,
        joint: kMaxSide === 'kiri' ? 'LeftLeg' : 'RightLeg',
        t: kMaxT,
        value: kMax,
        limit: an.knee_flex_max,
        unit: 'deg',
        hint: `Reduce knee flexion by at least ${(kMax - an.knee_flex_max).toFixed(1)}° to stay within anatomical limit ${an.knee_flex_max}°.`,
      }),
    );
  }

  lines.push([
    eMax > an.elbow_flex_max ? 'FAIL' : 'PASS',
    `siku: tekuk maks ${fx(eMax, 1)}° (${eMaxSide} @${eMaxT.toFixed(2)}s, batas maks ${an.elbow_flex_max}°)`,
  ]);
  if (eMax > an.elbow_flex_max) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.ANATOMY_ELBOW,
        joint: eMaxSide === 'kiri' ? 'LeftForeArm' : 'RightForeArm',
        t: eMaxT,
        value: eMax,
        limit: an.elbow_flex_max,
        unit: 'deg',
        hint: `Reduce elbow flexion by at least ${(eMax - an.elbow_flex_max).toFixed(1)}° to stay within ${an.elbow_flex_max}°.`,
      }),
    );
  }

  lines.push([
    nMax > an.neck_bend_max ? 'FAIL' : 'PASS',
    `leher-kepala: tekuk maks ${fx(nMax, 1)}° (@${nMaxT.toFixed(2)}s, batas maks ${an.neck_bend_max}°)`,
  ]);
  if (nMax > an.neck_bend_max) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.ANATOMY_NECK,
        joint: 'Neck',
        t: nMaxT,
        value: nMax,
        limit: an.neck_bend_max,
        unit: 'deg',
        hint: `Reduce neck/head tilt by at least ${(nMax - an.neck_bend_max).toFixed(1)}° to stay within ${an.neck_bend_max}°.`,
      }),
    );
  }

  return { lines, issues };
}

export const anatomyRule = {
  name: 'anatomy',
  check,
};

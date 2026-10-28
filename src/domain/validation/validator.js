import { qangle, R2D } from '../math/quat.js';
import { vcross, vdot, vnorm, vsub } from '../math/vec3.js';
import { evalPose } from '../rig/pose-evaluator.js';
import { restPositions } from '../rig/rig-context.js';
import { checkChannelRanges } from './rules/channel-ranges.js';
import { versionIssues } from './rules/version.js';
import { FPS } from './vrm10/constants.js';

export function validate(rig, ctx, limits, clip, style = 'stylized') {
  const lim = limits.styles[style],
    an = limits.anatomy,
    fl = limits.floor,
    vm = clip.validate || {};
  const lines = [],
    dur = clip.duration,
    frames = Math.ceil(dur * FPS - 1e-9);
  const tAt = (f) => Math.min(f / FPS, dur);
  const poses = [];
  for (let f = 0; f <= frames; f++) poses.push(evalPose(rig, ctx, clip, tAt(f)));
  const I = ctx.idx,
    restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);
  const fx = (v, d = 0) => v.toFixed(d);

  // 1. Kecepatan dan percepatan sudut
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
      if (s > mS) {
        mS = s;
        mSb = ctx.names[i];
        mSt = f / FPS;
      }
      const acc = Math.abs(s - prevS) * FPS;
      if (f > 1 && acc > mA) {
        mA = acc;
        mAb = ctx.names[i];
        mAt = f / FPS;
      }
      prevS = s;
    }
  }
  const spTxt = `kecepatan sudut maks ${fx(mS)} °/s (${mSb} @${mSt.toFixed(2)}s)`;
  if (mS > lim.ang_speed_fail) lines.push(['FAIL', `${spTxt} > ${lim.ang_speed_fail}`]);
  else if (mS > lim.ang_speed_warn)
    lines.push(['WARN', `${spTxt} > ${lim.ang_speed_warn} (menyentak?)`]);
  else lines.push(['PASS', spTxt]);
  lines.push([
    mA > lim.ang_accel_warn ? 'WARN' : 'PASS',
    `percepatan sudut maks ${fx(mA)} °/s² (${mAb} @${mAt.toFixed(2)}s)`,
  ]);

  // 2. Loop
  if (clip.loop) {
    let worst = 0,
      wb = '';
    for (let i = 0; i < ctx.n; i++) {
      const d = qangle(poses[0].local[i], poses[frames].local[i]) * R2D;
      if (d > worst) {
        worst = d;
        wb = ctx.names[i];
      }
    }
    lines.push([
      worst > lim.loop_pose_diff_deg ? 'FAIL' : 'PASS',
      `loop: selisih pose awal-akhir maks ${worst.toFixed(1)}° (${wb})`,
    ]);
  }

  // 3. Anatomi
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
      if (flex < kMin) {
        kMin = flex;
        kMinSide = s === 'Left' ? 'kiri' : 'kanan';
        kMinT = t;
      }
      if (flex > kMax) {
        kMax = flex;
        kMaxSide = s === 'Left' ? 'kiri' : 'kanan';
        kMaxT = t;
      }
      const ua = vnorm(vsub(p[I[s + 'ForeArm']], p[I[s + 'Arm']]));
      const fa = vnorm(vsub(p[I[s + 'Hand']], p[I[s + 'ForeArm']]));
      const elbowAng = ang(ua, fa);
      if (elbowAng > eMax) {
        eMax = elbowAng;
        eMaxSide = s === 'Left' ? 'kiri' : 'kanan';
        eMaxT = t;
      }
    }
    const neckAng = ang(vnorm(vsub(p[I.Neck], p[I.Spine2])), vnorm(vsub(p[I.Head], p[I.Neck])));
    if (neckAng > nMax) {
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
  lines.push([
    eMax > an.elbow_flex_max ? 'FAIL' : 'PASS',
    `siku: tekuk maks ${fx(eMax, 1)}° (${eMaxSide} @${eMaxT.toFixed(2)}s, batas maks ${an.elbow_flex_max}°)`,
  ]);
  lines.push([
    nMax > an.neck_bend_max ? 'FAIL' : 'PASS',
    `leher-kepala: tekuk maks ${fx(nMax, 1)}° (@${nMaxT.toFixed(2)}s, batas maks ${an.neck_bend_max}°)`,
  ]);

  // 4. Lantai dan foot sliding
  let minToe = Infinity,
    minToeSide = 'kiri',
    minToeT = 0,
    contact = 0;
  const slide = [];
  let maxSlide = 0,
    maxSlideSide = '',
    maxSlideT = 0;

  for (let f = 0; f < poses.length; f++) {
    const t = tAt(f);
    for (const s of ['Left', 'Right']) {
      const ti = I[s + 'ToeBase'];
      const tp = poses[f].pos[ti];
      if (tp[1] < minToe) {
        minToe = tp[1];
        minToeSide = s === 'Left' ? 'kiri' : 'kanan';
        minToeT = t;
      }
      const plantedWin = s === 'Left' ? clip.windows?.planted_L : clip.windows?.planted_R;
      const inC = plantedWin
        ? t >= plantedWin[0] && t <= plantedWin[1]
        : tp[1] - floorY < fl.contact_height_m;
      if (inC) contact++;
      if (f + 1 < poses.length && inC) {
        const nextT = tAt(f + 1);
        const nextInC = plantedWin
          ? nextT >= plantedWin[0] && nextT <= plantedWin[1]
          : poses[f + 1].pos[ti][1] - floorY < fl.contact_height_m;
        if (nextInC) {
          const tn = poses[f + 1].pos[ti];
          const spd = Math.hypot(tn[0] - tp[0], tn[2] - tp[2]) * FPS;
          slide.push(spd);
          if (spd > maxSlide) {
            maxSlide = spd;
            maxSlideSide = s === 'Left' ? 'kiri' : 'kanan';
            maxSlideT = t;
          }
        }
      }
    }
  }
  const pen = floorY - minToe;
  if (vm.check_floor !== false) {
    lines.push([
      pen > fl.penetration_fail_m ? 'FAIL' : 'PASS',
      `lantai: toe ${minToeSide} terendah ${(minToe - floorY).toFixed(3)} m dari lantai di t=${minToeT.toFixed(2)}s (penetrasi ${Math.max(
        pen,
        0,
      ).toFixed(3)} m, batas maks ${fl.penetration_fail_m} m)`,
    ]);
  }
  if (vm.foot_slide !== false || clip.windows?.planted_L || clip.windows?.planted_R) {
    if (!slide.length) {
      lines.push(['PASS', 'foot sliding: tidak ada frame kontak (klip melayang/tanpa tumpuan)']);
    } else {
      slide.sort((a, b) => a - b);
      const mean = slide.reduce((a, b) => a + b, 0) / slide.length;
      const p95 = slide[Math.floor(slide.length * 0.95)];
      const hasPlanted = clip.windows?.planted_L || clip.windows?.planted_R;
      const label = hasPlanted ? 'foot sliding (jendela tumpuan)' : 'foot sliding';
      lines.push([
        p95 > fl.slide_warn_ms ? 'WARN' : 'PASS',
        `${label}: ${contact} frame kontak, rata-rata ${mean.toFixed(2)} m/s, p95 ${p95.toFixed(
          2,
        )} m/s (maks ${maxSlide.toFixed(2)} m/s @${maxSlideT.toFixed(2)}s kaki ${maxSlideSide}, batas ${fl.slide_warn_ms} m/s)`,
      ]);
    }
  }

  // 5. Root motion dan klaim
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
    if (rMax > lim.root_speed_fail)
      lines.push(['FAIL', `${t} > ${lim.root_speed_fail} (terasa seperti teleport)`]);
    else if (rMax > lim.root_speed_warn) lines.push(['WARN', `${t} > ${lim.root_speed_warn}`]);
    else lines.push(['PASS', t]);
  }
  const cl = clip.claims || {};
  if (cl.distance != null) {
    const tol = cl.tolerance ?? 0.1;
    lines.push([
      Math.abs(dist - cl.distance) <= cl.distance * tol ? 'PASS' : 'FAIL',
      `klaim jarak ${cl.distance.toFixed(2)} m (±${Math.round(tol * 100)}%): terukur ${dist.toFixed(
        2,
      )} m`,
    ]);
  }
  if (cl.duration != null) {
    const tol = cl.tolerance ?? 0.1;
    lines.push([
      Math.abs(dur - cl.duration) <= cl.duration * tol ? 'PASS' : 'FAIL',
      `klaim durasi ${cl.duration.toFixed(2)} s: terukur ${dur.toFixed(2)} s`,
    ]);
  }

  // 6. Jendela dan event
  const wins = clip.windows || {};
  for (const wn of Object.keys(wins)) {
    const w = wins[wn],
      ok = w.length === 2 && w[0] >= 0 && w[0] < w[1] && w[1] <= dur + 1e-4;
    lines.push([
      ok ? 'PASS' : 'FAIL',
      `jendela ${wn} [${w.join(', ')}] ${ok ? 'valid' : 'tidak valid (harus 0 <= mulai < akhir <= durasi)'}`,
    ]);
  }
  const hn = wins.hitbox ? 'hitbox' : wins.active ? 'active' : '';
  if (hn && wins.cancel) {
    const ok = wins.cancel[0] >= wins[hn][1] - 1e-4;
    lines.push([
      ok ? 'PASS' : 'FAIL',
      `urutan: cancel (${wins.cancel[0].toFixed(2)}) dimulai setelah ${hn} selesai (${wins[
        hn
      ][1].toFixed(2)})`,
    ]);
  }
  for (const ev of clip.events || []) {
    if (!(ev.t >= 0 && ev.t <= dur + 1e-4))
      lines.push(['FAIL', `event ${ev.id ?? '?'} di t=${ev.t} di luar durasi`]);
  }

  // 7. Versi, format, range channel
  for (const v of versionIssues(clip.version ?? 1, clip.changelog, clip.format_version ?? 1)) {
    lines.push(v);
  }
  for (const item of checkChannelRanges(rig, clip)) {
    if (Array.isArray(item)) {
      lines.push(item);
    } else {
      lines.push(['WARN', item]);
    }
  }

  const fail = lines.filter((l) => l[0] === 'FAIL').length,
    warn = lines.filter((l) => l[0] === 'WARN').length;
  return { lines, fail, warn, poses, floorY, speedSeries, rootSpeed, frames };
}

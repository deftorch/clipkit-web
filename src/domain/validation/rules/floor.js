export function check({ ctx, limits, clip, poses, floorY, tAt, FPS = 30 }) {
  const fl = limits.floor;
  const vm = clip.validate || {};
  const I = ctx.idx;
  const lines = [];

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
      if (tp[1] < minToe - 1e-5) {
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
          if (spd > maxSlide + 1e-4) {
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

  return { lines };
}

export const floorRule = {
  name: 'floor',
  check,
};

import { FPS } from '../../domain/math/vec3.js';

const TRAIL_POINTS = [
  ['RightHand', '--t-handR', true],
  ['LeftHand', '--t-handL', true],
  ['RightToeBase', '--t-foot', false],
  ['LeftToeBase', '--t-foot', false],
  ['Head', '--t-head', false],
];

export function drawTrails(g, it, t, ctx, prjFn, C, winColorFn) {
  if (!it || !it.res || !it.clip) return;
  const res = it.res;
  const cl = it.clip;
  const wins = cl.windows || {};
  const I = ctx.idx;

  const hot = (tt) => {
    for (const w of ['hitbox', 'active', 'parry']) {
      if (wins[w] && tt >= wins[w][0] && tt <= wins[w][1]) return w;
    }
    return null;
  };

  const cur = Math.round(t * FPS);

  for (const [bn, col, hand] of TRAIL_POINTS) {
    const ix = I[bn];
    if (ix == null) continue;
    let prev = null;

    for (let f = 0; f < res.poses.length; f++) {
      const p = prjFn(res.poses[f].pos[ix]);
      if (!p) {
        prev = null;
        continue;
      }
      if (prev) {
        const w = hand ? hot((f - 0.5) / FPS) : null;
        g.globalAlpha = f <= cur ? 0.95 : 0.35;
        g.strokeStyle = w ? winColorFn(w) : C[col];
        g.lineWidth = w ? 4 : 1.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(prev[0], prev[1]);
        g.lineTo(p[0], p[1]);
        g.stroke();
      }
      if (hand && f % 3 === 0) {
        g.globalAlpha = 0.9;
        g.fillStyle = C[col];
        g.beginPath();
        g.arc(p[0], p[1], 2.2, 0, 7);
        g.fill();
      }
      prev = p;
    }
  }

  g.globalAlpha = 1;
}

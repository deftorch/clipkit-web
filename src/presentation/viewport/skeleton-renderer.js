import ClipKit from "../../domain/clipkit.js";

export const WIDTH = {
  Spine: 0.12, Spine1: 0.13, Spine2: 0.13, Neck: 0.05, Head: 0.04,
  LeftShoulder: 0.06, RightShoulder: 0.06, LeftArm: 0.05, RightArm: 0.05,
  LeftForeArm: 0.042, RightForeArm: 0.042, LeftHand: 0.03, RightHand: 0.03,
  LeftUpLeg: 0.09, RightUpLeg: 0.09, LeftLeg: 0.075, RightLeg: 0.075,
  LeftFoot: 0.05, RightFoot: 0.05, LeftToeBase: 0.04, RightToeBase: 0.04
};

export const sideColor = (n, C) =>
  n.startsWith('Left') ? C['--figL'] : n.startsWith('Right') ? C['--figR'] : C['--fig'];

export function floorY(it) {
  return it && it.res ? it.res.floorY : 0.03;
}

export function drawFigure(g, P, ctx, rig, alpha, thin, prjFn, C, KF) {
  const pos = P.pos;
  const segs = [];
  const I = ctx.idx;
  const rs = rig.scale || 1;

  for (let i = 1; i < ctx.n; i++) {
    const a = prjFn(pos[ctx.parents[i]]);
    const b = prjFn(pos[i]);
    if (a && b) segs.push({ i, a, b, z: (a[2] + b[2]) / 2 });
  }

  segs.sort((s, t) => t.z - s.z);
  g.globalAlpha = alpha;
  g.lineCap = 'round';

  for (const s of segs) {
    const n = ctx.names[s.i];
    g.strokeStyle = sideColor(n, C);
    g.lineWidth = thin ? 1.3 : Math.max(2, ((WIDTH[n] || 0.012) * rs * KF) / s.z);
    g.beginPath();
    g.moveTo(s.a[0], s.a[1]);
    g.lineTo(s.b[0], s.b[1]);
    g.stroke();
  }

  // Kepala: bola di atas sendi Head, dengan titik hidung agar arah menghadap terbaca
  const hd = P.delta[I.Head];
  const c = ClipKit.vadd(pos[I.Head], ClipKit.qrot(hd, [0, 0.1 * rs, 0.012 * rs]));
  const nose = ClipKit.vadd(c, ClipKit.qrot(hd, [0, -0.005 * rs, 0.105 * rs]));
  const pc = prjFn(c);
  const pn = prjFn(nose);

  if (pc) {
    const rr = Math.max(3, (0.1 * rs * KF) / pc[2]);
    g.strokeStyle = C['--fig'];
    g.fillStyle = C['--view'];
    g.lineWidth = thin ? 1.3 : 2.2;
    g.beginPath();
    g.arc(pc[0], pc[1], rr, 0, 7);
    if (!thin) g.fill();
    g.stroke();

    if (pn && !thin) {
      g.fillStyle = C['--fig'];
      g.beginPath();
      g.arc(pn[0], pn[1], Math.max(2, (0.014 * rs * KF) / pn[2]), 0, 7);
      g.fill();
    }
  }

  if (!thin) {
    for (let i = 0; i < ctx.n; i++) {
      const p = prjFn(pos[i]);
      if (!p) continue;
      g.fillStyle = C['--view'];
      g.strokeStyle = sideColor(ctx.names[i], C);
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(p[0], p[1], Math.max(1.8, (0.016 * rs * KF) / p[2]), 0, 7);
      g.fill();
      g.stroke();
    }
  }

  g.globalAlpha = 1;
}

export function drawFloor(g, it, y, prjFn, C) {
  let x0 = -3, x1 = 3, z0 = -3, z1 = 3;
  if (it && it.res) {
    for (const P of it.res.poses) {
      const r = P.root;
      x0 = Math.min(x0, r[0] - 2);
      x1 = Math.max(x1, r[0] + 2);
      z0 = Math.min(z0, r[2] - 2);
      z1 = Math.max(z1, r[2] + 2);
    }
  }
  x0 = Math.floor(x0 * 2) / 2;
  x1 = Math.ceil(x1 * 2) / 2;
  z0 = Math.floor(z0 * 2) / 2;
  z1 = Math.ceil(z1 * 2) / 2;

  g.lineWidth = 1;
  const line = (a, b, col) => {
    const p = prjFn(a);
    const q = prjFn(b);
    if (!p || !q) return;
    g.strokeStyle = col;
    g.beginPath();
    g.moveTo(p[0], p[1]);
    g.lineTo(q[0], q[1]);
    g.stroke();
  };

  for (let x = x0; x <= x1 + 1e-6; x += 0.5) {
    line([x, y, z0], [x, y, z1], Math.abs(x) < 1e-6 ? C['--grid2'] : C['--grid']);
  }
  for (let z = z0; z <= z1 + 1e-6; z += 0.5) {
    line([x0, y, z], [x1, y, z], Math.abs(z) < 1e-6 ? C['--grid2'] : C['--grid']);
  }

  // Jalur root motion
  if (it && it.res && it.res.poses.some(P => Math.hypot(P.root[0], P.root[2]) > 1e-3)) {
    g.strokeStyle = C['--muted'];
    g.setLineDash([5, 4]);
    g.lineWidth = 1.5;
    g.beginPath();
    let st = false;
    for (const P of it.res.poses) {
      const p = prjFn([P.root[0], y, P.root[2]]);
      if (!p) continue;
      if (st) g.lineTo(p[0], p[1]);
      else g.moveTo(p[0], p[1]);
      st = true;
    }
    g.stroke();
    g.setLineDash([]);
  }
}

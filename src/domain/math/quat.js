import { vadd, vcross, vdot, vlen, vnorm, vscale } from './vec3.js';

export const D2R = Math.PI / 180;
export const R2D = 180 / Math.PI;

export const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];

export const qinv = (q) => [-q[0], -q[1], -q[2], q[3]];

export const qnorm = (q) => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};

export const qaxis = (ax, ang) => {
  const l = Math.hypot(ax[0], ax[1], ax[2]) || 1;
  const s = Math.sin(ang / 2) / l;
  return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(ang / 2)];
};

export const qrot = (q, v) => {
  const t = vscale(vcross([q[0], q[1], q[2]], v), 2);
  return vadd(vadd(v, vscale(t, q[3])), vcross([q[0], q[1], q[2]], t));
};

export const qarc = (v0, v1) => {
  const d = vdot(v0, v1);
  if (d < -0.999999) {
    let ax = vcross([1, 0, 0], v0);
    if (vlen(ax) < 1e-6) ax = vcross([0, 1, 0], v0);
    return qaxis(vnorm(ax), Math.PI);
  }
  const c = vcross(v0, v1);
  return qnorm([c[0], c[1], c[2], 1 + d]);
};

export const qangle = (a, b) =>
  2 * Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])));

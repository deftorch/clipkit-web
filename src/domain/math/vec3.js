export const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const vcross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

export const vlen = (a) => Math.hypot(a[0], a[1], a[2]);

export const vnorm = (a) => {
  const l = vlen(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export const vscale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

export const vlerp = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t
];

export const FPS = 30;

export const r5 = (v) => v.map((x) => Math.round(x * 1e5) / 1e5);

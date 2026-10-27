import { ease } from './easing.js';

export function sampleKeys(keys, t) {
  if (!keys || !keys.length) return 0;
  if (t <= keys[0][0]) return +keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return +last[1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1],
        b = keys[i];
      const span = Math.max(b[0] - a[0], 1e-6),
        u = (t - a[0]) / span;
      const e = b.length > 2 ? String(b[2]) : 'linear';
      return a[1] + (b[1] - a[1]) * ease(e, u);
    }
  }
  return +last[1];
}

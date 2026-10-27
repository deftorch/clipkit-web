import { vadd, vnorm, vscale } from '../math/vec3.js';
import { ease } from './easing.js';

export function rootMotion(clip, t) {
  if (!clip.move) return [0, 0, 0];
  const segs = Array.isArray(clip.move) ? clip.move : [clip.move];
  let tot = [0, 0, 0];
  for (const s of segs) {
    const d = vnorm(s.dir),
      t0 = s.t0 ?? 0,
      t1 = s.t1 ?? clip.duration;
    const u = Math.min(1, Math.max(0, (t - t0) / Math.max(t1 - t0, 1e-6)));
    tot = vadd(tot, vscale(d, s.distance * ease(s.ease || 'linear', u)));
  }
  return tot;
}

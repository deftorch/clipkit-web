import { sampleKeys } from '../../animation/keyframes.js';

export function evalExpressions(clip, t) {
  const o = {};
  const ex = clip.expressions || {};
  for (const k of Object.keys(ex)) {
    o[k] = sampleKeys(ex[k], t);
  }
  return o;
}

import { sampleKeys } from '../animation/keyframes.js';
import { vadd, vnorm, vscale } from '../math/vec3.js';

export function allChannelNames(rig) {
  const n = Object.keys(rig.channels);
  for (const a of Object.keys(rig.aims || {})) {
    for (const k of ['elev', 'azim', 'roll']) {
      n.push(a + '_' + k);
    }
  }
  return n;
}

export function channelDefault(rig, c) {
  if (rig.channels[c]) return rig.channels[c].default ?? 0;
  const i = c.lastIndexOf('_');
  if (i > 0 && rig.aims && rig.aims[c.slice(0, i)]) {
    return rig.aims[c.slice(0, i)].default[c.slice(i + 1)] ?? 0;
  }
  return 0;
}

export function channelRange(rig, c) {
  if (rig.channels[c]) return rig.channels[c].range;
  const i = c.lastIndexOf('_');
  if (i > 0 && rig.aims && rig.aims[c.slice(0, i)]) {
    return rig.aims[c.slice(0, i)].range[c.slice(i + 1)];
  }
  return null;
}

export function makeCtx(rig) {
  const names = rig.animated_bones;
  const idx = {};
  names.forEach((n, i) => {
    idx[n] = i;
  });
  const ops = names.map(() => []);
  const posOps = [];

  for (const cname of Object.keys(rig.channels)) {
    const c = rig.channels[cname];
    if (c.type === 'axis') {
      const axis = vscale(vnorm(c.axis), c.sign);
      for (const b of Object.keys(c.bones)) {
        ops[idx[b]].push({ kind: 'axis', ch: cname, axis, w: c.bones[b] });
      }
    } else if (c.type === 'pos') {
      posOps.push({ ch: cname, axis: c.axis });
    }
  }

  for (const an of Object.keys(rig.aims || {})) {
    const a = rig.aims[an];
    const rd =
      rig.rest && idx[a.child] != null ? vnorm(rig.rest.offsets[idx[a.child]]) : vnorm(a.lateral);
    ops[idx[a.bone]].push({ kind: 'aim', name: an, rest_dir: rd, lateral: a.lateral });
  }

  return {
    posScale: rig.pos_scale || 1,
    names,
    idx,
    ops,
    posOps,
    parents: rig.rest.parents,
    offsets: rig.rest.offsets,
    n: names.length,
    chNames: allChannelNames(rig),
  };
}

export function evalChannels(rig, ctx, clip, t) {
  const out = {};
  const chs = clip.channels || {};
  for (const c of ctx.chNames) {
    out[c] = chs[c] ? sampleKeys(chs[c], t) : channelDefault(rig, c);
  }
  return out;
}

export function restPositions(ctx) {
  const pos = [];
  for (let i = 0; i < ctx.n; i++) {
    const p = ctx.parents[i];
    pos[i] = p < 0 ? ctx.offsets[0].slice() : vadd(pos[p], ctx.offsets[i]);
  }
  return pos;
}

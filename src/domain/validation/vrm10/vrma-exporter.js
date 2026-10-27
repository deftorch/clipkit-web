import { evalPose } from '../../rig/pose-evaluator.js';
import { FPS, VRM10_EXPRESSIONS, vn } from './constants.js';

export function buildVrmaGlb(rig, ctx, clip) {
  const dur = clip.duration,
    frames = Math.ceil(dur * FPS - 1e-9),
    count = frames + 1;
  const times = new Float32Array(count);
  const poses = [];
  for (let f = 0; f < count; f++) {
    const t = Math.min(f / FPS, dur);
    times[f] = t;
    poses.push(evalPose(rig, ctx, clip, t));
  }

  // 22 node humanoid + node ekspresi opsional
  const exNames = Object.keys(clip.expressions || {}).filter((n) => VRM10_EXPRESSIONS.includes(n));
  const nodes = [];
  const humanBones = {};
  const childrenMap = rig.animated_bones.map(() => []);
  rig.rest.parents.forEach((p, i) => {
    if (p >= 0) childrenMap[p].push(i);
  });

  for (let i = 0; i < ctx.n; i++) {
    const bname = vn(rig, rig.animated_bones[i]);
    const nd = {
      name: bname,
      translation: rig.rest.offsets[i].slice(),
      rotation: [0, 0, 0, 1],
    };
    if (childrenMap[i].length) nd.children = childrenMap[i];
    nodes.push(nd);
    humanBones[bname] = { node: i };
  }

  const exprPresetMap = {};
  for (const en of exNames) {
    const nodeIdx = nodes.length;
    nodes.push({ name: 'expr_' + en, translation: [0, 0, 0] });
    exprPresetMap[en] = { node: nodeIdx };
  }

  // Susun buffer biner:
  // 0: times (count * 4 byte)
  // 1: hips translations (count * 3 * 4 byte)
  // 2..2+n-1: bone rotations (count * 4 * 4 byte)
  // 2+n..: expression translations (count * 3 * 4 byte, X = nilai ekspresi [0..1])
  const chunks = [];
  const bufferViews = [];
  const accessors = [];
  const samplers = [];
  const animChannels = [];
  let byteOffset = 0;

  function pushFloat32(arr, type, minArr, maxArr) {
    const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    chunks.push(u8);
    const bvIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: u8.byteLength });
    byteOffset += u8.byteLength;
    const acc = { bufferView: bvIdx, componentType: 5126, count, type };
    if (minArr) acc.min = minArr;
    if (maxArr) acc.max = maxArr;
    const accIdx = accessors.length;
    accessors.push(acc);
    return accIdx;
  }

  const timeAcc = pushFloat32(times, 'SCALAR', [0], [times[count - 1]]);

  // Hips translation (root + hips)
  const hipsTr = new Float32Array(count * 3);
  for (let f = 0; f < count; f++) {
    const p0 = poses[f].pos[0];
    hipsTr[f * 3] = p0[0];
    hipsTr[f * 3 + 1] = p0[1];
    hipsTr[f * 3 + 2] = p0[2];
  }
  const hipsTrAcc = pushFloat32(hipsTr, 'VEC3');
  samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: hipsTrAcc });
  animChannels.push({
    sampler: samplers.length - 1,
    target: { node: 0, path: 'translation' },
  });

  // 22 Humanoid rotations
  for (let i = 0; i < ctx.n; i++) {
    const rot = new Float32Array(count * 4);
    for (let f = 0; f < count; f++) {
      const q = poses[f].local[i];
      rot[f * 4] = q[0];
      rot[f * 4 + 1] = q[1];
      rot[f * 4 + 2] = q[2];
      rot[f * 4 + 3] = q[3];
    }
    const rAcc = pushFloat32(rot, 'VEC4');
    samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: rAcc });
    animChannels.push({
      sampler: samplers.length - 1,
      target: { node: i, path: 'rotation' },
    });
  }

  // Expressions (VRMC_vrm_animation menyimpan ekspresi di koordinat X translation node ekspresi)
  for (const en of exNames) {
    const exTr = new Float32Array(count * 3);
    for (let f = 0; f < count; f++) {
      exTr[f * 3] = Math.min(1, Math.max(0, poses[f].expr[en] ?? 0));
    }
    const exAcc = pushFloat32(exTr, 'VEC3');
    samplers.push({ input: timeAcc, interpolation: 'LINEAR', output: exAcc });
    animChannels.push({
      sampler: samplers.length - 1,
      target: { node: exprPresetMap[en].node, path: 'translation' },
    });
  }

  const vrmaExt = { specVersion: '1.0', humanoid: { humanBones } };
  if (exNames.length) vrmaExt.expressions = { preset: exprPresetMap };

  const rootNodes = [0, ...exNames.map((en) => exprPresetMap[en].node)];
  const gltf = {
    asset: { version: '2.0', generator: 'ClipKit Web VRM 1.0 Edition' },
    extensionsUsed: ['VRMC_vrm_animation'],
    extensions: { VRMC_vrm_animation: vrmaExt },
    scene: 0,
    scenes: [{ nodes: rootNodes }],
    nodes,
    animations: [{ name: clip.name || 'clip', samplers, channels: animChannels }],
    bufferViews,
    accessors,
    buffers: [{ byteLength: byteOffset }],
  };

  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltf));
  const jsonPad = (4 - (jsonBytes.byteLength % 4)) % 4;
  const binPad = (4 - (byteOffset % 4)) % 4;
  const totalLength = 12 + 8 + jsonBytes.byteLength + jsonPad + 8 + byteOffset + binPad;

  const glb = new ArrayBuffer(totalLength);
  const dv = new DataView(glb);
  const outU8 = new Uint8Array(glb);

  // Header GLB
  dv.setUint32(0, 0x46546c67, true); // 'glTF'
  dv.setUint32(4, 2, true); // version 2
  dv.setUint32(8, totalLength, true);

  // JSON chunk
  let ptr = 12;
  dv.setUint32(ptr, jsonBytes.byteLength + jsonPad, true);
  dv.setUint32(ptr + 4, 0x4e4f534a, true); // 'JSON'
  ptr += 8;
  outU8.set(jsonBytes, ptr);
  ptr += jsonBytes.byteLength;
  for (let i = 0; i < jsonPad; i++) outU8[ptr++] = 0x20;

  // BIN chunk
  dv.setUint32(ptr, byteOffset + binPad, true);
  dv.setUint32(ptr + 4, 0x004e4942, true); // 'BIN\0'
  ptr += 8;
  for (const ch of chunks) {
    outU8.set(ch, ptr);
    ptr += ch.byteLength;
  }
  for (let i = 0; i < binPad; i++) outU8[ptr++] = 0;

  return new Blob([glb], { type: 'model/gltf-binary' });
}

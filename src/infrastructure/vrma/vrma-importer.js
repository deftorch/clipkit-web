import { decompileAnimation } from '../../domain/animation/inverse-solver.js';
import { parseGlbChunks } from '../vrm/glb-parser.js';

/**
 * VRM Humanoid bone name mapping to ClipKit / Motus standard bones.
 */
export const VRM_TO_MOTUS_BONES = {
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Spine1',
  upperChest: 'Spine2',
  neck: 'Neck',
  head: 'Head',
  leftUpperArm: 'LeftArm',
  leftLowerArm: 'LeftForeArm',
  leftHand: 'LeftHand',
  rightUpperArm: 'RightArm',
  rightLowerArm: 'RightForeArm',
  rightHand: 'RightHand',
  leftUpperLeg: 'LeftUpLeg',
  leftLowerLeg: 'LeftLeg',
  leftFoot: 'LeftFoot',
  leftToes: 'LeftToeBase',
  rightUpperLeg: 'RightUpLeg',
  rightLowerLeg: 'RightLeg',
  rightFoot: 'RightFoot',
  rightToes: 'RightToeBase',
  leftEye: 'LeftEye',
  rightEye: 'RightEye',
  jaw: 'Jaw',
};

/**
 * Reads a typed array from glTF binary buffer using accessor and bufferView.
 */
function readAccessorData(gltf, binary, accessorIndex) {
  const acc = gltf.accessors[accessorIndex];
  if (!acc) throw new Error(`Accessor ${accessorIndex} not found in glTF.`);

  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);

  const numComponents =
    acc.type === 'SCALAR'
      ? 1
      : acc.type === 'VEC2'
        ? 2
        : acc.type === 'VEC3'
          ? 3
          : acc.type === 'VEC4'
            ? 4
            : 1;

  const totalFloats = acc.count * numComponents;
  // Ensure buffer alignment
  const u8 = new Uint8Array(binary.buffer, binary.byteOffset + byteOffset, totalFloats * 4);
  const copy = new ArrayBuffer(u8.byteLength);
  new Uint8Array(copy).set(u8);
  return new Float32Array(copy);
}

/**
 * Parses a binary .vrma or animated .glb file into sampled animation tracks.
 *
 * @param {ArrayBuffer|Uint8Array} buffer - Binary file buffer
 * @returns {object} Raw sampled tracks: { duration, times, boneRotations, hipsTranslation, expressions }
 */
export function parseVrmaTracks(buffer) {
  const { json: gltf, binary } = parseGlbChunks(buffer);

  if (!gltf.animations || !gltf.animations.length) {
    throw new Error('Tidak ditemukan track animasi di file glTF/VRMA.');
  }

  const anim = gltf.animations[0];
  const vrmaExt = gltf.extensions?.VRMC_vrm_animation;

  // Build node to humanoid bone mapping
  const nodeToBone = new Map();
  if (vrmaExt?.humanoid?.humanBones) {
    for (const [vrmBone, def] of Object.entries(vrmaExt.humanoid.humanBones)) {
      const motusBone = VRM_TO_MOTUS_BONES[vrmBone] || vrmBone;
      nodeToBone.set(def.node, motusBone);
    }
  } else {
    // Fallback: match by node names
    (gltf.nodes || []).forEach((nd, idx) => {
      if (!nd.name) return;
      const lower = nd.name.toLowerCase();
      for (const [vrmBone, motusBone] of Object.entries(VRM_TO_MOTUS_BONES)) {
        if (lower === vrmBone.toLowerCase() || lower.includes(vrmBone.toLowerCase())) {
          nodeToBone.set(idx, motusBone);
          break;
        }
      }
    });
  }

  // Build node to expression mapping
  const nodeToExpr = new Map();
  if (vrmaExt?.expressions?.preset) {
    for (const [exprName, def] of Object.entries(vrmaExt.expressions.preset)) {
      nodeToExpr.set(def.node, exprName);
    }
  }

  // Find shared or primary timeline
  let primaryTimes = null;
  const boneRotations = {};
  let hipsTranslation = null;
  const expressions = {};

  for (const channel of anim.channels) {
    const targetNode = channel.target.node;
    const targetPath = channel.target.path;
    const sampler = anim.samplers[channel.sampler];

    const times = readAccessorData(gltf, binary, sampler.input);
    if (!primaryTimes || times.length > primaryTimes.length) {
      primaryTimes = times;
    }

    const outputData = readAccessorData(gltf, binary, sampler.output);

    // Check expression channel
    if (nodeToExpr.has(targetNode) && targetPath === 'translation') {
      const exprName = nodeToExpr.get(targetNode);
      const vals = [];
      for (let i = 0; i < times.length; i++) {
        vals.push(outputData[i * 3]); // X translation stores expression weight [0..1]
      }
      expressions[exprName] = vals;
      continue;
    }

    // Check bone channel
    const boneName = nodeToBone.get(targetNode);
    if (!boneName) continue;

    if (boneName === 'Hips' && targetPath === 'translation') {
      const trs = [];
      for (let i = 0; i < times.length; i++) {
        trs.push([outputData[i * 3], outputData[i * 3 + 1], outputData[i * 3 + 2]]);
      }
      hipsTranslation = trs;
    } else if (targetPath === 'rotation') {
      const rots = [];
      for (let i = 0; i < times.length; i++) {
        rots.push([
          outputData[i * 4],
          outputData[i * 4 + 1],
          outputData[i * 4 + 2],
          outputData[i * 4 + 3],
        ]);
      }
      boneRotations[boneName] = rots;
    }
  }

  const timesArr = Array.from(primaryTimes || []);
  const duration = timesArr.length > 0 ? timesArr[timesArr.length - 1] : 1.0;

  return {
    name: anim.name || 'imported_vrma',
    duration,
    times: timesArr,
    boneRotations,
    hipsTranslation: hipsTranslation || [],
    expressions,
  };
}

/**
 * Imports a binary VRMA or GLB file directly into a high-level ClipKit animation clip.
 *
 * @param {ArrayBuffer|Uint8Array} buffer - File binary data
 * @param {object} options - Inverse solver options
 * @returns {{ clip: object, telemetry: object }}
 */
export function importVrmaToClip(buffer, options = {}) {
  const sampleData = parseVrmaTracks(buffer);
  return decompileAnimation(sampleData, options);
}

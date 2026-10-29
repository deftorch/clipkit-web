import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { decompileAnimation } from '../../domain/animation/inverse-solver.js';
import { resolveBoneAlias } from './bvh-parser.js';

/**
 * Parses binary or ASCII FBX data into standardized ClipKit animation tracks.
 *
 * @param {ArrayBuffer|Uint8Array} input - FBX data
 * @returns {object} Standardized sample data for inverse solver
 */
export function parseFbxTracks(input) {
  // Normalize input to ArrayBuffer (respecting byteOffset and byteLength)
  const ab = ArrayBuffer.isView(input)
    ? input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)
    : input;

  const loader = new FBXLoader();
  const group = loader.parse(ab, '');

  if (!group.animations || group.animations.length === 0) {
    throw new Error('Tidak ada klip animasi ditemukan di dalam file FBX.');
  }

  const anim = group.animations[0];
  const boneRotations = {};
  let hipsTranslation = [];
  let primaryTimes = null;

  for (const track of anim.tracks) {
    const parts = track.name.split('.');
    const rawBoneName = parts[0];
    const property = parts[parts.length - 1];

    const canonicalBone = resolveBoneAlias(rawBoneName);
    if (!canonicalBone) continue;

    if (property === 'quaternion' && track.times.length > 1) {
      if (!primaryTimes || track.times.length > primaryTimes.length) {
        primaryTimes = Array.from(track.times);
      }
      const rots = [];
      for (let i = 0; i < track.times.length; i++) {
        rots.push([
          track.values[i * 4],
          track.values[i * 4 + 1],
          track.values[i * 4 + 2],
          track.values[i * 4 + 3],
        ]);
      }
      boneRotations[canonicalBone] = rots;
    } else if (canonicalBone === 'Hips' && property === 'position' && track.times.length > 1) {
      const trs = [];
      // Auto-detect unit scaling: Maya/3dsMax FBX files often use centimeters (~95cm hip height)
      // while glTF/VRM/ClipKit standard uses meters (~0.95m hip height).
      const sampleY = Math.abs(track.values[1] || 0);
      const scale = sampleY > 10 ? 0.01 : 1.0;
      const initialY = (track.values[1] || 0) * scale;
      const yOffset = initialY > 0.5 ? initialY : 0.0;

      for (let i = 0; i < track.times.length; i++) {
        trs.push([
          track.values[i * 3] * scale,
          track.values[i * 3 + 1] * scale - yOffset,
          track.values[i * 3 + 2] * scale,
        ]);
      }
      hipsTranslation = trs;
    }
  }

  const timesArr = Array.from(primaryTimes || []);
  const duration = timesArr.length > 0 ? timesArr[timesArr.length - 1] : anim.duration || 1.0;

  return {
    name: anim.name || 'imported_fbx',
    duration,
    times: timesArr,
    boneRotations,
    hipsTranslation,
    expressions: {},
  };
}

/**
 * Imports an FBX animation file into a high-level ClipKit animation clip.
 *
 * @param {ArrayBuffer|Uint8Array} buffer - File binary data
 * @param {object} options - Inverse solver options (epsilon, filterJitter)
 * @returns {{ clip: object, telemetry: object }}
 */
export function importFbxToClip(buffer, options = {}) {
  const sampleData = parseFbxTracks(buffer);
  return decompileAnimation(sampleData, options);
}

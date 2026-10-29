import { decompileAnimation } from '../../domain/animation/inverse-solver.js';
import { D2R, qaxis, qmul, qnorm } from '../../domain/math/quat.js';

/**
 * Standard bone alias dictionary to map arbitrary naming conventions
 * (Mixamo, 3ds Max Biped, CMU, Humanoid) to canonical Motus / VRM bones.
 */
export const BONE_ALIAS_MAP = {
  Hips: ['hips', 'pelvis', 'root', 'mixamorig:hips', 'bip01_pelvis', 'bip01_hips'],
  Spine: ['spine', 'lowerback', 'mixamorig:spine', 'bip01_spine'],
  Spine1: ['spine1', 'chest', 'torso', 'mixamorig:spine1', 'bip01_spine1'],
  Spine2: ['spine2', 'upperchest', 'mixamorig:spine2', 'bip01_spine2'],
  Neck: ['neck', 'mixamorig:neck', 'bip01_neck'],
  Head: ['head', 'mixamorig:head', 'bip01_head'],
  LeftShoulder: ['leftshoulder', 'l_clavicle', 'mixamorig:leftshoulder', 'bip01_l_clavicle'],
  LeftArm: ['leftarm', 'leftupperarm', 'l_upperarm', 'mixamorig:leftarm', 'bip01_l_upperarm'],
  LeftForeArm: [
    'leftforearm',
    'leftlowerarm',
    'l_forearm',
    'mixamorig:leftforearm',
    'bip01_l_forearm',
  ],
  LeftHand: ['lefthand', 'l_hand', 'l_wrist', 'mixamorig:lefthand', 'bip01_l_hand'],
  RightShoulder: ['rightshoulder', 'r_clavicle', 'mixamorig:rightshoulder', 'bip01_r_clavicle'],
  RightArm: ['rightarm', 'rightupperarm', 'r_upperarm', 'mixamorig:rightarm', 'bip01_r_upperarm'],
  RightForeArm: [
    'rightforearm',
    'rightlowerarm',
    'r_forearm',
    'mixamorig:rightforearm',
    'bip01_r_forearm',
  ],
  RightHand: ['righthand', 'r_hand', 'r_wrist', 'mixamorig:righthand', 'bip01_r_hand'],
  LeftUpLeg: ['leftupleg', 'leftthigh', 'l_thigh', 'mixamorig:leftupleg', 'bip01_l_thigh'],
  LeftLeg: ['leftleg', 'leftshin', 'leftcalf', 'l_calf', 'mixamorig:leftleg', 'bip01_l_calf'],
  LeftFoot: ['leftfoot', 'leftankle', 'l_foot', 'mixamorig:leftfoot', 'bip01_l_foot'],
  LeftToeBase: ['lefttoebase', 'lefttoe', 'l_toe', 'mixamorig:lefttoebase', 'bip01_l_toe0'],
  RightUpLeg: ['rightupleg', 'rightthigh', 'r_thigh', 'mixamorig:rightupleg', 'bip01_r_thigh'],
  RightLeg: ['rightleg', 'rightshin', 'rightcalf', 'r_calf', 'mixamorig:rightleg', 'bip01_r_calf'],
  RightFoot: ['rightfoot', 'rightankle', 'r_foot', 'mixamorig:rightfoot', 'bip01_r_foot'],
  RightToeBase: ['righttoebase', 'righttoe', 'r_toe', 'mixamorig:righttoebase', 'bip01_r_toe0'],
};

/**
 * Resolves an arbitrary joint name to standard Motus / VRM bone name.
 */
export function resolveBoneAlias(rawName) {
  if (!rawName) return null;
  const clean = rawName.toLowerCase().replace(/[\s_-]+/g, '_');

  for (const [canonical, aliases] of Object.entries(BONE_ALIAS_MAP)) {
    if (canonical.toLowerCase() === clean) return canonical;
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[\s_-]+/g, '_');
      if (clean === cleanAlias || clean.endsWith(cleanAlias)) {
        return canonical;
      }
    }
  }

  return rawName;
}

/**
 * Parses an ASCII BVH format string into a structured bone hierarchy and frame matrix.
 *
 * @param {string} bvhText - Full text content of a BVH file
 * @returns {object} { bones, frameCount, frameTime, motionData }
 */
export function parseBvhRaw(bvhText) {
  const lines = bvhText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let lineIdx = 0;
  if (!lines[lineIdx] || !lines[lineIdx].startsWith('HIERARCHY')) {
    throw new Error('Format BVH tidak valid (header HIERARCHY tidak ditemukan).');
  }
  lineIdx++;

  const bones = [];
  const boneStack = [];

  while (lineIdx < lines.length && !lines[lineIdx].startsWith('MOTION')) {
    const line = lines[lineIdx];

    if (line.startsWith('ROOT') || line.startsWith('JOINT')) {
      const parts = line.split(/\s+/);
      const name = parts[1];
      const parent = boneStack.length > 0 ? boneStack[boneStack.length - 1] : -1;
      const bone = {
        id: bones.length,
        name,
        canonicalName: resolveBoneAlias(name),
        parent,
        offset: [0, 0, 0],
        channels: [],
        channelIndex: 0,
      };
      bones.push(bone);
      boneStack.push(bone.id);
    } else if (line.startsWith('End Site')) {
      // Dummy end site
      boneStack.push(-2);
    } else if (line === '{') {
      // Block start
    } else if (line === '}') {
      boneStack.pop();
    } else if (line.startsWith('OFFSET')) {
      const curId = boneStack[boneStack.length - 1];
      if (curId >= 0) {
        const parts = line.split(/\s+/);
        bones[curId].offset = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
      }
    } else if (line.startsWith('CHANNELS')) {
      const curId = boneStack[boneStack.length - 1];
      if (curId >= 0) {
        const parts = line.split(/\s+/);
        const count = Number(parts[1]);
        bones[curId].channels = parts.slice(2, 2 + count);
      }
    }

    lineIdx++;
  }

  // Parse MOTION section
  if (lineIdx >= lines.length || !lines[lineIdx].startsWith('MOTION')) {
    throw new Error('Bagian MOTION tidak ditemukan di file BVH.');
  }
  lineIdx++;

  let frameCount = 0;
  let frameTime = 1 / 30;

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    if (line.startsWith('Frames:')) {
      frameCount = Number(line.split(/\s+/)[1]);
      lineIdx++;
    } else if (line.startsWith('Frame Time:')) {
      frameTime = Number(line.split(/\s+/)[2]);
      lineIdx++;
      break;
    } else {
      lineIdx++;
    }
  }

  // Assign channel offsets across all bones
  let globalChIdx = 0;
  for (const b of bones) {
    b.channelIndex = globalChIdx;
    globalChIdx += b.channels.length;
  }

  const motionData = [];
  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const vals = line.split(/\s+/).map(Number);
    if (vals.length >= globalChIdx) {
      motionData.push(vals);
    }
    lineIdx++;
  }

  return {
    bones,
    frameCount: motionData.length,
    frameTime,
    motionData,
    totalChannels: globalChIdx,
  };
}

/**
 * Converts a set of Euler rotation channels to a local quaternion.
 */
function eulerChannelsToQuat(channels, vals) {
  let q = [0, 0, 0, 1];

  for (let i = 0; i < channels.length; i++) {
    const ch = channels[i];
    const ang = vals[i] * D2R;

    let qAxis;
    if (ch === 'Xrotation') {
      qAxis = qaxis([1, 0, 0], ang);
    } else if (ch === 'Yrotation') {
      qAxis = qaxis([0, 1, 0], ang);
    } else if (ch === 'Zrotation') {
      qAxis = qaxis([0, 0, 1], ang);
    }

    if (qAxis) {
      q = qmul(q, qAxis);
    }
  }

  return qnorm(q);
}

/**
 * Extracts raw animation samples (rotations, root motion, and times) from BVH data.
 *
 * @param {object} parsedBvh - Output of parseBvhRaw()
 * @returns {object} { duration, times, boneRotations, hipsTranslation }
 */
export function extractBvhSamples(parsedBvh) {
  const { bones, frameCount, frameTime, motionData } = parsedBvh;
  const times = [];
  for (let f = 0; f < frameCount; f++) {
    times.push(Number((f * frameTime).toFixed(4)));
  }

  const boneRotations = {};
  const hipsTranslation = [];

  // Identify Hips bone
  const hipsBone = bones.find((b) => b.canonicalName === 'Hips') || bones[0];

  for (let f = 0; f < frameCount; f++) {
    const frame = motionData[f];

    // Extract Hips position
    if (hipsBone) {
      let x = 0;
      let y = 0;
      let z = 0;
      const baseIdx = hipsBone.channelIndex;
      hipsBone.channels.forEach((ch, idx) => {
        if (ch === 'Xposition') x = frame[baseIdx + idx] * 0.01; // cm to meters scale
        if (ch === 'Yposition') y = frame[baseIdx + idx] * 0.01;
        if (ch === 'Zposition') z = frame[baseIdx + idx] * 0.01;
      });
      hipsTranslation.push([x, y, z]);
    }

    // Extract rotations for each bone
    for (const b of bones) {
      if (!b.canonicalName) continue;
      const rotChannels = [];
      const rotVals = [];

      b.channels.forEach((ch, idx) => {
        if (ch.endsWith('rotation')) {
          rotChannels.push(ch);
          rotVals.push(frame[b.channelIndex + idx]);
        }
      });

      if (rotChannels.length > 0) {
        if (!boneRotations[b.canonicalName]) {
          boneRotations[b.canonicalName] = [];
        }
        const q = eulerChannelsToQuat(rotChannels, rotVals);
        boneRotations[b.canonicalName].push(q);
      }
    }
  }

  return {
    duration: times.length > 0 ? times[times.length - 1] : 1.0,
    times,
    boneRotations,
    hipsTranslation,
  };
}

/**
 * Detects foot contact intervals (planted windows) based on ankle/toe height and speed.
 */
export function detectFootPlantedWindows(times, footHeights, threshold = 0.05) {
  const windows = [];
  let inPlant = false;
  let startT = 0;

  for (let i = 0; i < times.length; i++) {
    const h = footHeights[i] ?? 0;
    const isPlanted = h <= threshold;

    if (isPlanted && !inPlant) {
      inPlant = true;
      startT = times[i];
    } else if (!isPlanted && inPlant) {
      inPlant = false;
      const endT = times[i - 1];
      if (endT - startT >= 0.08) {
        windows.push([Number(startT.toFixed(3)), Number(endT.toFixed(3))]);
      }
    }
  }

  if (inPlant) {
    const endT = times[times.length - 1];
    if (endT - startT >= 0.08) {
      windows.push([Number(startT.toFixed(3)), Number(endT.toFixed(3))]);
    }
  }

  return windows.length > 0 ? windows[0] : null;
}

/**
 * Ingests and decompiles an ASCII BVH mocap file into a high-level ClipKit animation clip.
 *
 * @param {string} bvhText - Full text of BVH file
 * @param {object} options - Solver and compression options
 * @returns {{ clip: object, telemetry: object }}
 */
export function importBvhToClip(bvhText, options = {}) {
  const parsed = parseBvhRaw(bvhText);
  const sampleData = extractBvhSamples(parsed);
  const decompiled = decompileAnimation(sampleData, options);

  // Auto-detect planted foot windows if foot channels exist
  const clip = decompiled.clip;
  if (clip.channels.footL_pitch || clip.channels.footR_pitch) {
    clip.windows = clip.windows || {};
    // Planted heuristic: when foot is flat (pitch near 0)
    if (clip.channels.footL_pitch) {
      const times = sampleData.times;
      const vals = sampleData.times.map((t) =>
        Math.abs(sampleData.boneRotations.LeftFoot?.[sampleData.times.indexOf(t)]?.[0] || 0),
      );
      const plantedL = detectFootPlantedWindows(times, vals, 0.1);
      if (plantedL) clip.windows.planted_L = plantedL;
    }
    if (clip.channels.footR_pitch) {
      const times = sampleData.times;
      const vals = sampleData.times.map((t) =>
        Math.abs(sampleData.boneRotations.RightFoot?.[sampleData.times.indexOf(t)]?.[0] || 0),
      );
      const plantedR = detectFootPlantedWindows(times, vals, 0.1);
      if (plantedR) clip.windows.planted_R = plantedR;
    }
  }

  return decompiled;
}

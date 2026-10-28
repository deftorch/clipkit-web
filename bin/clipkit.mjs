#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const name$1 = "MotusMan_v55";
const skeleton_scene = "res://characters/motus_man/MotusMan_v55.fbx";
const path_prefix = "Skeleton3D";
const frame = "model: +X kiri karakter, +Y atas, +Z depan (diverifikasi oleh tests/test_clip_rig.gd)";
const animated_bones = ["Hips", "Spine", "Spine1", "Spine2", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand", "RightShoulder", "RightArm", "RightForeArm", "RightHand", "Neck", "Head", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase", "LeftHandThumb1", "LeftHandThumb2", "LeftHandThumb3", "LeftHandIndex1", "LeftHandIndex2", "LeftHandIndex3", "LeftHandMiddle1", "LeftHandMiddle2", "LeftHandMiddle3", "LeftHandRing1", "LeftHandRing2", "LeftHandRing3", "LeftHandPinky1", "LeftHandPinky2", "LeftHandPinky3", "RightHandThumb1", "RightHandThumb2", "RightHandThumb3", "RightHandIndex1", "RightHandIndex2", "RightHandIndex3", "RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3", "RightHandRing1", "RightHandRing2", "RightHandRing3", "RightHandPinky1", "RightHandPinky2", "RightHandPinky3", "LeftEye", "RightEye", "Jaw"];
const channels = { "lean": { "type": "axis", "bones": { "Spine": 0.4, "Spine1": 0.3, "Spine2": 0.3 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-30, 60], "unit": "deg", "desc": "+ = membungkuk ke depan" }, "side_lean": { "type": "axis", "bones": { "Spine": 0.4, "Spine1": 0.3, "Spine2": 0.3 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-35, 35], "unit": "deg", "desc": "+ = miring ke kanan karakter" }, "twist": { "type": "axis", "bones": { "Spine": 0.4, "Spine1": 0.3, "Spine2": 0.3 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-60, 60], "unit": "deg", "desc": "+ = dada berputar ke kiri karakter" }, "hip_pitch": { "type": "axis", "bones": { "Hips": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-30, 45], "unit": "deg", "desc": "+ = panggul condong ke depan" }, "hip_twist": { "type": "axis", "bones": { "Hips": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-60, 60], "unit": "deg", "desc": "+ = panggul berputar ke kiri" }, "hip_roll": { "type": "axis", "bones": { "Hips": 1 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-25, 25], "unit": "deg", "desc": "+ = panggul miring ke kanan" }, "head_pitch": { "type": "axis", "bones": { "Neck": 0.4, "Head": 0.6 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-40, 45], "unit": "deg", "desc": "+ = kepala menunduk" }, "head_yaw": { "type": "axis", "bones": { "Neck": 0.4, "Head": 0.6 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-70, 70], "unit": "deg", "desc": "+ = menoleh ke kiri" }, "legL_swing": { "type": "axis", "bones": { "LeftUpLeg": 1 }, "axis": [1, 0, 0], "sign": -1, "default": 0, "range": [-45, 120], "unit": "deg", "desc": "+ = paha terangkat ke depan" }, "legL_abd": { "type": "axis", "bones": { "LeftUpLeg": 1 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-30, 60], "unit": "deg", "desc": "+ = paha membuka ke luar" }, "kneeL": { "type": "axis", "bones": { "LeftLeg": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-5, 150], "unit": "deg", "desc": "+ = lutut menekuk" }, "footL_pitch": { "type": "axis", "bones": { "LeftFoot": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-45, 60], "unit": "deg", "desc": "+ = ujung kaki turun" }, "elbowL": { "type": "axis", "bones": { "LeftForeArm": 1 }, "axis": [0, 1, 0], "sign": -1, "default": 10, "range": [-5, 150], "unit": "deg", "desc": "+ = siku menekuk" }, "legR_swing": { "type": "axis", "bones": { "RightUpLeg": 1 }, "axis": [1, 0, 0], "sign": -1, "default": 0, "range": [-45, 120], "unit": "deg", "desc": "+ = paha terangkat ke depan" }, "legR_abd": { "type": "axis", "bones": { "RightUpLeg": 1 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-30, 60], "unit": "deg", "desc": "+ = paha membuka ke luar" }, "kneeR": { "type": "axis", "bones": { "RightLeg": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-5, 150], "unit": "deg", "desc": "+ = lutut menekuk" }, "footR_pitch": { "type": "axis", "bones": { "RightFoot": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-45, 60], "unit": "deg", "desc": "+ = ujung kaki turun" }, "elbowR": { "type": "axis", "bones": { "RightForeArm": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 10, "range": [-5, 150], "unit": "deg", "desc": "+ = siku menekuk" }, "hip_x": { "type": "pos", "bone": "Hips", "axis": [1, 0, 0], "default": 0, "range": [-1.5, 1.5], "unit": "m", "desc": "offset posisi panggul (frame model: X kiri, Y atas, Z depan)" }, "hip_y": { "type": "pos", "bone": "Hips", "axis": [0, 1, 0], "default": 0, "range": [-0.6, 0.5], "unit": "m", "desc": "offset posisi panggul (frame model: X kiri, Y atas, Z depan)" }, "hip_z": { "type": "pos", "bone": "Hips", "axis": [0, 0, 1], "default": 0, "range": [-1.5, 1.5], "unit": "m", "desc": "offset posisi panggul (frame model: X kiri, Y atas, Z depan)" }, "thumbL": { "type": "axis", "bones": { "LeftHandThumb1": 0.3, "LeftHandThumb2": 0.9, "LeftHandThumb3": 0.9 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = thumb left menekuk (kepal)" }, "indexL": { "type": "axis", "bones": { "LeftHandIndex1": 1, "LeftHandIndex2": 1.1, "LeftHandIndex3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = index left menekuk (kepal)" }, "middleL": { "type": "axis", "bones": { "LeftHandMiddle1": 1, "LeftHandMiddle2": 1.1, "LeftHandMiddle3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = middle left menekuk (kepal)" }, "ringL": { "type": "axis", "bones": { "LeftHandRing1": 1, "LeftHandRing2": 1.1, "LeftHandRing3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = ring left menekuk (kepal)" }, "littleL": { "type": "axis", "bones": { "LeftHandPinky1": 1, "LeftHandPinky2": 1.1, "LeftHandPinky3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = little left menekuk (kepal)" }, "spreadL": { "type": "axis", "bones": { "LeftHandIndex1": -0.5, "LeftHandRing1": 0.5, "LeftHandPinky1": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-10, 30], "unit": "deg", "desc": "+ = jari tangan left merenggang" }, "thumbR": { "type": "axis", "bones": { "RightHandThumb1": 0.3, "RightHandThumb2": 0.9, "RightHandThumb3": 0.9 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = thumb right menekuk (kepal)" }, "indexR": { "type": "axis", "bones": { "RightHandIndex1": 1, "RightHandIndex2": 1.1, "RightHandIndex3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = index right menekuk (kepal)" }, "middleR": { "type": "axis", "bones": { "RightHandMiddle1": 1, "RightHandMiddle2": 1.1, "RightHandMiddle3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = middle right menekuk (kepal)" }, "ringR": { "type": "axis", "bones": { "RightHandRing1": 1, "RightHandRing2": 1.1, "RightHandRing3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = ring right menekuk (kepal)" }, "littleR": { "type": "axis", "bones": { "RightHandPinky1": 1, "RightHandPinky2": 1.1, "RightHandPinky3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = little right menekuk (kepal)" }, "spreadR": { "type": "axis", "bones": { "RightHandIndex1": -0.5, "RightHandRing1": 0.5, "RightHandPinky1": 1 }, "axis": [0, 1, 0], "sign": -1, "default": 0, "range": [-10, 30], "unit": "deg", "desc": "+ = jari tangan right merenggang" }, "eye_yaw": { "type": "axis", "bones": { "LeftEye": 1, "RightEye": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-35, 35], "unit": "deg", "desc": "+ = melirik ke kiri karakter" }, "eye_pitch": { "type": "axis", "bones": { "LeftEye": 1, "RightEye": 1 }, "axis": [1, 0, 0], "sign": -1, "default": 0, "range": [-30, 30], "unit": "deg", "desc": "+ = melirik ke atas" }, "jaw_open": { "type": "axis", "bones": { "Jaw": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [0, 35], "unit": "deg", "desc": "+ = rahang terbuka" } };
const aims = { "armL": { "bone": "LeftArm", "child": "LeftForeArm", "lateral": [1, 0, 0], "default": { "elev": -75, "azim": 0, "roll": 0 }, "range": { "elev": [-95, 175], "azim": [-100, 140], "roll": [-120, 120] }, "desc": "elev: sudut di atas horizontal (-90 = tergantung); azim: 0 = ke samping, 90 = ke depan; roll: putar sekitar lengan" }, "armR": { "bone": "RightArm", "child": "RightForeArm", "lateral": [-1, 0, 0], "default": { "elev": -75, "azim": 0, "roll": 0 }, "range": { "elev": [-95, 175], "azim": [-100, 140], "roll": [-120, 120] }, "desc": "elev: sudut di atas horizontal (-90 = tergantung); azim: 0 = ke samping, 90 = ke depan; roll: putar sekitar lengan" } };
const rest$1 = { "parents": [-1, 0, 1, 2, 3, 4, 5, 6, 3, 8, 9, 10, 3, 12, 0, 14, 15, 16, 0, 18, 19, 20, 7, 22, 23, 7, 25, 26, 7, 28, 29, 7, 31, 32, 7, 34, 35, 11, 37, 38, 11, 40, 41, 11, 43, 44, 11, 46, 47, 11, 49, 50, 13, 13, 13], "offsets": [[0, 0.9675, -0.01057], [0, 0.10807, 891e-5], [0, 0.19205, -0.01352], [0, 0.13268, -0.01981], [0.03781, 0.1217, 738e-5], [0.13919, -0.02671, -0.06951], [0.30339, -1e-5, 0], [0.26976, 0, -1e-5], [-0.03781, 0.1217, 738e-5], [-0.13919, -0.02671, -0.06951], [-0.3034, -1e-5, 0], [-0.26975, 1e-5, -1e-5], [0, 0.1639, -0.02378], [0, 0.09096, 0.01897], [0.09009, -0.01451, 526e-5], [0.05211, -0.42231, -0.01271], [0.0286, -0.39602, -0.06271], [-8e-4, -0.10454, 0.16578], [-0.09009, -0.01451, 527e-5], [-0.05211, -0.42232, -0.01271], [-0.02859, -0.39602, -0.06271], [8e-4, -0.10454, 0.16578], [0.02, -4e-3, 0.026], [0.021, -15e-4, 0.021], [0.0224, -16e-4, 0.0224], [0.075, 0, 0.022], [0.04, 0, 0], [0.025, 0, 0], [0.078, 0, 7e-3], [0.045, 0, 0], [0.028, 0, 0], [0.074, 0, -8e-3], [0.042, 0, 0], [0.026, 0, 0], [0.068, 0, -0.022], [0.032, 0, 0], [0.02, 0, 0], [-0.02, -4e-3, 0.026], [-0.021, -15e-4, 0.021], [-0.0224, -16e-4, 0.0224], [-0.075, 0, 0.022], [-0.04, 0, 0], [-0.025, 0, 0], [-0.078, 0, 7e-3], [-0.045, 0, 0], [-0.028, 0, 0], [-0.074, 0, -8e-3], [-0.042, 0, 0], [-0.026, 0, 0], [-0.068, 0, -0.022], [-0.032, 0, 0], [-0.02, 0, 0], [0.032, 0.07, 0.08], [-0.032, 0.07, 0.08], [0, 0.02, 0.015]] };
const motus = {
  name: name$1,
  skeleton_scene,
  path_prefix,
  frame,
  animated_bones,
  channels,
  aims,
  rest: rest$1
};
const name = "VRM1_Constraint_Twist_Sample";
const kind = "vrm1";
const humanoid = { "Hips": "hips", "Spine": "spine", "Spine1": "chest", "Spine2": "upperChest", "Neck": "neck", "Head": "head", "LeftShoulder": "leftShoulder", "LeftArm": "leftUpperArm", "LeftForeArm": "leftLowerArm", "LeftHand": "leftHand", "RightShoulder": "rightShoulder", "RightArm": "rightUpperArm", "RightForeArm": "rightLowerArm", "RightHand": "rightHand", "LeftUpLeg": "leftUpperLeg", "LeftLeg": "leftLowerLeg", "LeftFoot": "leftFoot", "LeftToeBase": "leftToes", "RightUpLeg": "rightUpperLeg", "RightLeg": "rightLowerLeg", "RightFoot": "rightFoot", "RightToeBase": "rightToes", "LeftHandThumb1": "leftThumbMetacarpal", "LeftHandThumb2": "leftThumbProximal", "LeftHandThumb3": "leftThumbDistal", "LeftHandIndex1": "leftIndexProximal", "LeftHandIndex2": "leftIndexIntermediate", "LeftHandIndex3": "leftIndexDistal", "LeftHandMiddle1": "leftMiddleProximal", "LeftHandMiddle2": "leftMiddleIntermediate", "LeftHandMiddle3": "leftMiddleDistal", "LeftHandRing1": "leftRingProximal", "LeftHandRing2": "leftRingIntermediate", "LeftHandRing3": "leftRingDistal", "LeftHandPinky1": "leftLittleProximal", "LeftHandPinky2": "leftLittleIntermediate", "LeftHandPinky3": "leftLittleDistal", "RightHandThumb1": "rightThumbMetacarpal", "RightHandThumb2": "rightThumbProximal", "RightHandThumb3": "rightThumbDistal", "RightHandIndex1": "rightIndexProximal", "RightHandIndex2": "rightIndexIntermediate", "RightHandIndex3": "rightIndexDistal", "RightHandMiddle1": "rightMiddleProximal", "RightHandMiddle2": "rightMiddleIntermediate", "RightHandMiddle3": "rightMiddleDistal", "RightHandRing1": "rightRingProximal", "RightHandRing2": "rightRingIntermediate", "RightHandRing3": "rightRingDistal", "RightHandPinky1": "rightLittleProximal", "RightHandPinky2": "rightLittleIntermediate", "RightHandPinky3": "rightLittleDistal", "LeftEye": "leftEye", "RightEye": "rightEye", "Jaw": "jaw" };
const rest = { "offsets": [[0, 0.90808, 358e-5], [0, 0.05207, 0.01252], [0, 0.11301, 305e-5], [0, 0.10764, -0.01465], [0.0224, 0.10569, -0.02997], [0.08616, -0.01226, 0], [0.21985, 0, 0], [0.21469, 0, -37e-5], [-0.0224, 0.10569, -0.02997], [-0.08616, -0.01226, 0], [-0.21985, 0, 0], [-0.21469, 0, 37e-5], [0, 0.13229, -0.03836], [0, 0.07317, 915e-5], [0.07716, -0.03977, -366e-5], [0, -0.35291, -739e-5], [0, -0.41474, -0.02494], [0, -0.06305, 0.11069], [-0.07716, -0.03977, -366e-5], [0, -0.35291, -739e-5], [0, -0.41474, -0.02494], [0, -0.06305, 0.11069], [0.01877, -375e-5, 0.0244], [0.01971, -141e-5, 0.01971], [0.02102, -15e-4, 0.02102], [0.07039, 0, 0.02065], [0.03754, 0, 0], [0.02346, 0, 0], [0.07321, 0, 657e-5], [0.04224, 0, 0], [0.02628, 0, 0], [0.06946, 0, -751e-5], [0.03942, 0, 0], [0.0244, 0, 0], [0.06382, 0, -0.02065], [0.03004, 0, 0], [0.01877, 0, 0], [-0.01877, -375e-5, 0.0244], [-0.01971, -141e-5, 0.01971], [-0.02102, -15e-4, 0.02102], [-0.07039, 0, 0.02065], [-0.03754, 0, 0], [-0.02346, 0, 0], [-0.07321, 0, 657e-5], [-0.04224, 0, 0], [-0.02628, 0, 0], [-0.06946, 0, -751e-5], [-0.03942, 0, 0], [-0.0244, 0, 0], [-0.06382, 0, -0.02065], [-0.03004, 0, 0], [-0.01877, 0, 0], [0.03004, 0.0657, 0.07509], [-0.03004, 0.0657, 0.07509], [0, 0.01877, 0.01408]] };
const scale = 0.9386;
const pos_scale = 0.9391;
const info = { "name": "VRM1_Constraint_Twist_Sample", "spec": "1.0", "nodes": 171, "hipsY": 0.9080763, "legLen": 0.7684779899116934, "scale": 0.9386, "posScale": 0.9391, "synth": [], "warns": [], "height": 1.386266881653605, "present": 22, "total": 22, "extraBones": 32, "license": "https://vrm.dev/licenses/1.0/", "droop": 4120740451177791e-19, "extraPresent": 0 };
const vrmSamplePatch = {
  name,
  kind,
  humanoid,
  rest,
  scale,
  pos_scale,
  info
};
function loadRigs() {
  const vrmSample = {
    ...motus,
    ...vrmSamplePatch,
    rest: {
      parents: motus.rest.parents,
      offsets: vrmSamplePatch.rest.offsets
    }
  };
  return {
    motus,
    vrm_sample: {
      rig: vrmSample,
      info: vrmSamplePatch.info
    }
  };
}
const face = { "channels": ["eye_yaw", "eye_pitch", "jaw_open"], "expressions": true, "joints": ["Head", "LeftEye", "RightEye", "Jaw"] };
const hands = { "channels": ["thumbL", "indexL", "middleL", "ringL", "littleL", "spreadL", "thumbR", "indexR", "middleR", "ringR", "littleR", "spreadR"], "joints": ["LeftHand", "LeftHandThumb1", "LeftHandThumb2", "LeftHandThumb3", "LeftHandIndex1", "LeftHandIndex2", "LeftHandIndex3", "LeftHandMiddle1", "LeftHandMiddle2", "LeftHandMiddle3", "LeftHandRing1", "LeftHandRing2", "LeftHandRing3", "LeftHandPinky1", "LeftHandPinky2", "LeftHandPinky3", "RightHand", "RightHandThumb1", "RightHandThumb2", "RightHandThumb3", "RightHandIndex1", "RightHandIndex2", "RightHandIndex3", "RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3", "RightHandRing1", "RightHandRing2", "RightHandRing3", "RightHandPinky1", "RightHandPinky2", "RightHandPinky3"] };
const arms = { "channels": ["elbowL", "elbowR"], "aims": ["armL", "armR"], "joints": ["LeftShoulder", "LeftArm", "LeftForeArm", "RightShoulder", "RightArm", "RightForeArm"] };
const torso = { "channels": ["lean", "side_lean", "twist", "hip_pitch", "hip_twist", "hip_roll", "head_pitch", "head_yaw"], "joints": ["Hips", "Spine", "Spine1", "Spine2", "Neck"] };
const legs = { "channels": ["legL_swing", "legL_abd", "kneeL", "footL_pitch", "legR_swing", "legR_abd", "kneeR", "footR_pitch"], "joints": ["LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase"] };
const root = { "channels": ["hip_x", "hip_y", "hip_z"], "move": true, "joints": ["Hips"] };
const partsData = {
  face,
  hands,
  arms,
  torso,
  legs,
  root
};
function resolveSafeOutputPath(targetPath, { allowOutside = false, force = false, cwd = process.cwd() } = {}) {
  const absPath = path.resolve(cwd, targetPath);
  const normalizedCwd = path.resolve(cwd);
  if (!allowOutside && !absPath.startsWith(normalizedCwd)) {
    throw new Error(
      `Security violation: Refusing to write outside working directory (${absPath}). Use --allow-outside to permit this path.`
    );
  }
  if (fs.existsSync(absPath) && !force) {
    throw new Error(`File already exists: ${absPath}. Use --force to overwrite.`);
  }
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return absPath;
}
function readInput(inputPath) {
  if (inputPath === "-" || !inputPath) {
    return fs.readFileSync(0, "utf8");
  }
  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }
  return fs.readFileSync(resolved, "utf8");
}
function formatDeterministicJson(obj) {
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === "number") {
        return Number(value.toFixed(6));
      }
      return value;
    },
    2
  );
}
function runChannels(_args, options = {}) {
  const { motus: motus2 } = loadRigs();
  const partFilter = options.part;
  if (partFilter && !partsData[partFilter]) {
    console.error(
      `Error: Unknown part '${partFilter}'. Supported parts: ${Object.keys(partsData).join(", ")}`
    );
    return 2;
  }
  const results = [];
  for (const [name2, def] of Object.entries(motus2.channels)) {
    let part = "torso";
    for (const [pName, pDef] of Object.entries(partsData)) {
      if (pDef.channels && pDef.channels.includes(name2)) {
        part = pName;
        break;
      }
    }
    if (partFilter && part !== partFilter) {
      continue;
    }
    results.push({
      name: name2,
      part,
      bone: def.bone || null,
      type: def.type || "rot",
      min: def.min ?? -180,
      max: def.max ?? 180,
      default: def.default ?? 0
    });
  }
  if (!partFilter || partFilter === "arms") {
    for (const a of Object.keys(motus2.aims || {})) {
      for (const k of ["elev", "azim", "roll"]) {
        results.push({
          name: `${a}_${k}`,
          part: "arms",
          bone: a,
          type: "aim",
          min: -180,
          max: 180,
          default: 0
        });
      }
    }
  }
  if (options.json) {
    console.log(formatDeterministicJson(results));
  } else {
    console.log(`Channels (${results.length}${partFilter ? ` for part '${partFilter}'` : ""}):`);
    for (const ch of results) {
      const typeStr = ch.type === "pos" ? "pos (m)" : "rot (deg)";
      console.log(
        `  ${ch.name.padEnd(16)} [${ch.part.padEnd(5)}] ${ch.bone?.padEnd(14) || ""} range: [${ch.min}, ${ch.max}] ${typeStr}`
      );
    }
  }
  return 0;
}
const styles = { "realistic": { "ang_speed_warn": 720, "ang_speed_fail": 1200, "ang_accel_warn": 6e4, "loop_pose_diff_deg": 8, "root_speed_warn": 8, "root_speed_fail": 12 }, "stylized": { "ang_speed_warn": 1200, "ang_speed_fail": 2e3, "ang_accel_warn": 12e4, "loop_pose_diff_deg": 10, "root_speed_warn": 10, "root_speed_fail": 15 }, "exaggerated": { "ang_speed_warn": 1800, "ang_speed_fail": 3e3, "ang_accel_warn": 24e4, "loop_pose_diff_deg": 15, "root_speed_warn": 14, "root_speed_fail": 22 } };
const anatomy = { "knee_flex_min": -5, "knee_flex_max": 160, "elbow_flex_max": 165, "neck_bend_max": 70 };
const floor = { "penetration_fail_m": 0.04, "contact_height_m": 0.03, "slide_warn_ms": 0.25 };
const limitsData = {
  styles,
  anatomy,
  floor
};
const EASING_REGISTRY = /* @__PURE__ */ new Map([
  ["linear", (u) => u],
  ["hold", (u) => u < 1 ? 0 : 1],
  ["inQuad", (u) => u * u],
  ["outQuad", (u) => 1 - (1 - u) * (1 - u)],
  ["inOutQuad", (u) => u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2],
  ["inCubic", (u) => u * u * u],
  ["outCubic", (u) => 1 - (1 - u) ** 3],
  ["inOutCubic", (u) => u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2],
  ["inSine", (u) => 1 - Math.cos(u * Math.PI / 2)],
  ["outSine", (u) => Math.sin(u * Math.PI / 2)],
  ["inOutSine", (u) => -(Math.cos(Math.PI * u) - 1) / 2],
  [
    "outBack",
    (u) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2;
    }
  ]
]);
function ease(name2, u) {
  const clamped = Math.min(1, Math.max(0, u));
  const fn = EASING_REGISTRY.get(name2);
  return fn ? fn(clamped) : clamped;
}
const EASINGS = [
  "linear",
  "hold",
  "inQuad",
  "outQuad",
  "inOutQuad",
  "inCubic",
  "outCubic",
  "inOutCubic",
  "inSine",
  "outSine",
  "inOutSine",
  "outBack"
];
function sampleKeys(keys, t) {
  if (!keys || !keys.length) return 0;
  if (t <= keys[0][0]) return +keys[0][1];
  const last = keys[keys.length - 1];
  if (t >= last[0]) return +last[1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      const span = Math.max(b[0] - a[0], 1e-6), u = (t - a[0]) / span;
      const e = b.length > 2 ? String(b[2]) : "linear";
      return a[1] + (b[1] - a[1]) * ease(e, u);
    }
  }
  return +last[1];
}
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vcross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const vlen = (a) => Math.hypot(a[0], a[1], a[2]);
const vnorm = (a) => {
  const l = vlen(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const vscale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
function allChannelNames(rig) {
  const n = Object.keys(rig.channels);
  for (const a of Object.keys(rig.aims || {})) {
    for (const k of ["elev", "azim", "roll"]) {
      n.push(a + "_" + k);
    }
  }
  return n;
}
function channelDefault(rig, c) {
  if (rig.channels[c]) return rig.channels[c].default ?? 0;
  const i = c.lastIndexOf("_");
  if (i > 0 && rig.aims && rig.aims[c.slice(0, i)]) {
    return rig.aims[c.slice(0, i)].default[c.slice(i + 1)] ?? 0;
  }
  return 0;
}
function channelRange(rig, c) {
  if (rig.channels[c]) return rig.channels[c].range;
  const i = c.lastIndexOf("_");
  if (i > 0 && rig.aims && rig.aims[c.slice(0, i)]) {
    return rig.aims[c.slice(0, i)].range[c.slice(i + 1)];
  }
  return null;
}
const CHANNEL_BUILDERS = {
  axis: (cname, c, idx, ops, _posOps) => {
    const axis = vscale(vnorm(c.axis), c.sign);
    for (const b of Object.keys(c.bones)) {
      if (idx[b] != null) {
        ops[idx[b]].push({ kind: "axis", ch: cname, axis, w: c.bones[b] });
      }
    }
  },
  pos: (cname, c, _idx, _ops, posOps) => {
    posOps.push({ ch: cname, axis: c.axis });
  }
};
function makeCtx(rig) {
  const names = rig.animated_bones;
  const idx = {};
  names.forEach((n, i) => {
    idx[n] = i;
  });
  const ops = names.map(() => []);
  const posOps = [];
  for (const cname of Object.keys(rig.channels)) {
    const c = rig.channels[cname];
    const builder = CHANNEL_BUILDERS[c.type];
    if (builder) {
      builder(cname, c, idx, ops, posOps);
    }
  }
  for (const an of Object.keys(rig.aims || {})) {
    const a = rig.aims[an];
    const rd = rig.rest && idx[a.child] != null ? vnorm(rig.rest.offsets[idx[a.child]]) : vnorm(a.lateral);
    ops[idx[a.bone]].push({ kind: "aim", name: an, rest_dir: rd, lateral: a.lateral });
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
    chNames: allChannelNames(rig)
  };
}
function evalChannels(rig, ctx, clip, t) {
  const out = {};
  const chs = clip.channels || {};
  for (const c of ctx.chNames) {
    out[c] = chs[c] ? sampleKeys(chs[c], t) : channelDefault(rig, c);
  }
  return out;
}
function restPositions(ctx) {
  const pos = [];
  for (let i = 0; i < ctx.n; i++) {
    const p = ctx.parents[i];
    pos[i] = p < 0 ? ctx.offsets[0].slice() : vadd(pos[p], ctx.offsets[i]);
  }
  return pos;
}
const RULE_CODES = {
  SPEED_LIMIT: "SPEED_LIMIT",
  ACCEL_LIMIT: "ACCEL_LIMIT",
  ANATOMY_KNEE: "ANATOMY_KNEE",
  ANATOMY_ELBOW: "ANATOMY_ELBOW",
  ANATOMY_NECK: "ANATOMY_NECK",
  FLOOR_PENETRATION: "FLOOR_PENETRATION",
  FOOT_SLIDE: "FOOT_SLIDE",
  ROOT_MOTION_SPEED: "ROOT_MOTION_SPEED",
  ROOT_MOTION_CLAIM_DIST: "ROOT_MOTION_CLAIM_DIST",
  ROOT_MOTION_CLAIM_DUR: "ROOT_MOTION_CLAIM_DUR",
  LOOP_MISMATCH: "LOOP_MISMATCH",
  WINDOW_INVALID: "WINDOW_INVALID",
  WINDOW_SEQUENCE: "WINDOW_SEQUENCE",
  EVENT_OUT_OF_BOUNDS: "EVENT_OUT_OF_BOUNDS",
  CHANNEL_UNKNOWN: "CHANNEL_UNKNOWN",
  CHANNEL_RANGE_EXCEEDED: "CHANNEL_RANGE_EXCEEDED",
  VRM10_REQUIRED_BONES: "VRM10_REQUIRED_BONES",
  VRM10_INVALID_BONE: "VRM10_INVALID_BONE",
  VRM10_NON_HIPS_POS: "VRM10_NON_HIPS_POS",
  VRM10_EXPRESSIONS: "VRM10_EXPRESSIONS",
  VERSION_FORMAT: "VERSION_FORMAT",
  CHANGELOG_INVALID: "CHANGELOG_INVALID",
  CHANGELOG_VERSION_MISMATCH: "CHANGELOG_VERSION_MISMATCH",
  SCHEMA_ERROR: "SCHEMA_ERROR"
};
function createIssue({
  level = "FAIL",
  // 'FAIL' | 'WARN' | 'INFO'
  rule,
  channel = null,
  joint = null,
  t = null,
  value = null,
  limit = null,
  unit = null,
  keys = null,
  hint = null
}) {
  return {
    level,
    rule,
    channel,
    joint,
    t: t != null ? Number(Number(t).toFixed(4)) : null,
    value: value != null ? Number(Number(value).toFixed(4)) : null,
    limit: limit != null ? Number(Number(limit).toFixed(4)) : null,
    unit,
    keys,
    hint
  };
}
const FPS = 30;
const FORMAT_VERSION = 1;
const VRM10_BONES = [
  "hips",
  "spine",
  "chest",
  "upperChest",
  "neck",
  "head",
  "leftShoulder",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "rightShoulder",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "leftUpperLeg",
  "leftLowerLeg",
  "leftFoot",
  "leftToes",
  "rightUpperLeg",
  "rightLowerLeg",
  "rightFoot",
  "rightToes",
  "leftThumbMetacarpal",
  "leftThumbProximal",
  "leftThumbDistal",
  "leftIndexProximal",
  "leftIndexIntermediate",
  "leftIndexDistal",
  "leftMiddleProximal",
  "leftMiddleIntermediate",
  "leftMiddleDistal",
  "leftRingProximal",
  "leftRingIntermediate",
  "leftRingDistal",
  "leftLittleProximal",
  "leftLittleIntermediate",
  "leftLittleDistal",
  "rightThumbMetacarpal",
  "rightThumbProximal",
  "rightThumbDistal",
  "rightIndexProximal",
  "rightIndexIntermediate",
  "rightIndexDistal",
  "rightMiddleProximal",
  "rightMiddleIntermediate",
  "rightMiddleDistal",
  "rightRingProximal",
  "rightRingIntermediate",
  "rightRingDistal",
  "rightLittleProximal",
  "rightLittleIntermediate",
  "rightLittleDistal",
  "leftEye",
  "rightEye",
  "jaw"
];
const VRM10_EXPRESSIONS = [
  "happy",
  "angry",
  "sad",
  "relaxed",
  "surprised",
  "aa",
  "ih",
  "ou",
  "ee",
  "oh",
  "blink",
  "blinkLeft",
  "blinkRight",
  "lookUp",
  "lookDown",
  "lookLeft",
  "lookRight",
  "neutral"
];
const MAP_M2V = {
  Hips: "hips",
  Spine: "spine",
  Spine1: "chest",
  Spine2: "upperChest",
  Neck: "neck",
  Head: "head",
  LeftShoulder: "leftShoulder",
  LeftArm: "leftUpperArm",
  LeftForeArm: "leftLowerArm",
  LeftHand: "leftHand",
  RightShoulder: "rightShoulder",
  RightArm: "rightUpperArm",
  RightForeArm: "rightLowerArm",
  RightHand: "rightHand",
  LeftUpLeg: "leftUpperLeg",
  LeftLeg: "leftLowerLeg",
  LeftFoot: "leftFoot",
  LeftToeBase: "leftToes",
  RightUpLeg: "rightUpperLeg",
  RightLeg: "rightLowerLeg",
  RightFoot: "rightFoot",
  RightToeBase: "rightToes",
  LeftHandThumb1: "leftThumbMetacarpal",
  LeftHandThumb2: "leftThumbProximal",
  LeftHandThumb3: "leftThumbDistal",
  LeftHandIndex1: "leftIndexProximal",
  LeftHandIndex2: "leftIndexIntermediate",
  LeftHandIndex3: "leftIndexDistal",
  LeftHandMiddle1: "leftMiddleProximal",
  LeftHandMiddle2: "leftMiddleIntermediate",
  LeftHandMiddle3: "leftMiddleDistal",
  LeftHandRing1: "leftRingProximal",
  LeftHandRing2: "leftRingIntermediate",
  LeftHandRing3: "leftRingDistal",
  LeftHandPinky1: "leftLittleProximal",
  LeftHandPinky2: "leftLittleIntermediate",
  LeftHandPinky3: "leftLittleDistal",
  RightHandThumb1: "rightThumbMetacarpal",
  RightHandThumb2: "rightThumbProximal",
  RightHandThumb3: "rightThumbDistal",
  RightHandIndex1: "rightIndexProximal",
  RightHandIndex2: "rightIndexIntermediate",
  RightHandIndex3: "rightIndexDistal",
  RightHandMiddle1: "rightMiddleProximal",
  RightHandMiddle2: "rightMiddleIntermediate",
  RightHandMiddle3: "rightMiddleDistal",
  RightHandRing1: "rightRingProximal",
  RightHandRing2: "rightRingIntermediate",
  RightHandRing3: "rightRingDistal",
  RightHandPinky1: "rightLittleProximal",
  RightHandPinky2: "rightLittleIntermediate",
  RightHandPinky3: "rightLittleDistal",
  LeftEye: "leftEye",
  RightEye: "rightEye",
  Jaw: "jaw"
};
const REQUIRED_VRM_BONES = [
  "hips",
  "spine",
  "head",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "leftUpperLeg",
  "leftLowerLeg",
  "leftFoot",
  "rightUpperLeg",
  "rightLowerLeg",
  "rightFoot"
];
const vn = (rig, n) => rig.humanoid && rig.humanoid[n] || MAP_M2V[n] || n;
const KNOWN_ALIASES = {
  neck_pitch: "head_pitch",
  neck_yaw: "head_yaw",
  legL_flex: "legL_swing",
  legR_flex: "legR_swing",
  knee_flex_L: "kneeL",
  knee_flex_R: "kneeR",
  invulnerable: "inv"
};
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}
function findClosestChannel(name2, validChannels) {
  if (KNOWN_ALIASES[name2] && validChannels.includes(KNOWN_ALIASES[name2])) {
    return KNOWN_ALIASES[name2];
  }
  let best = null;
  let bestDist = Infinity;
  for (const candidate of validChannels) {
    const dist = levenshtein(name2.toLowerCase(), candidate.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  if (best && bestDist <= Math.max(3, Math.floor(name2.length / 2))) {
    return best;
  }
  return null;
}
function validateSchema(clip, rig = null) {
  const errors = [];
  const addError = (path2, message, hint = null, code = RULE_CODES.SCHEMA_ERROR, extra = {}) => {
    errors.push({
      path: path2,
      message,
      hint,
      code,
      issue: createIssue({
        level: "FAIL",
        rule: code,
        hint,
        ...extra
      })
    });
  };
  if (!clip || typeof clip !== "object" || Array.isArray(clip)) {
    addError("$", "Clip must be a valid JSON object.");
    return { valid: false, errors };
  }
  if (typeof clip.duration !== "number" || clip.duration <= 0 || clip.duration > 30) {
    addError(
      "duration",
      `Duration must be a number between 0 and 30 seconds (received: ${clip.duration}).`,
      "Set duration to a positive number in seconds, e.g. 1.2"
    );
  }
  const validChannels = rig ? allChannelNames(rig) : [];
  if (clip.channels != null) {
    if (typeof clip.channels !== "object" || Array.isArray(clip.channels)) {
      addError("channels", "Channels must be an object of keyframe arrays.");
    } else {
      for (const [chName, kfs] of Object.entries(clip.channels)) {
        if (validChannels.length && !validChannels.includes(chName)) {
          const suggestion = findClosestChannel(chName, validChannels);
          const hint = suggestion ? `Unknown channel '${chName}', did you mean '${suggestion}'?` : `Channel '${chName}' is not defined in target rig.`;
          addError(`channels.${chName}`, hint, hint, RULE_CODES.CHANNEL_UNKNOWN, {
            channel: chName
          });
        }
        if (!Array.isArray(kfs)) {
          addError(
            `channels.${chName}`,
            `Channel '${chName}' keyframes must be an array of [time, value, easing?].`,
            'Format as [[0, 0, "linear"], [0.5, 45, "easeInOutQuad"]]'
          );
        } else {
          let prevT = -1;
          for (let i = 0; i < kfs.length; i++) {
            const kf = kfs[i];
            if (!Array.isArray(kf) || kf.length < 2) {
              addError(
                `channels.${chName}[${i}]`,
                `Keyframe at index ${i} must have at least [time, value].`
              );
              continue;
            }
            const [t, val, easing] = kf;
            if (typeof t !== "number" || t < 0 || clip.duration && t > clip.duration + 1e-4) {
              addError(
                `channels.${chName}[${i}][0]`,
                `Keyframe time must be between 0 and clip duration (${clip.duration}s).`,
                "Ensure 0 <= t <= duration"
              );
            } else if (t < prevT - 1e-4) {
              addError(
                `channels.${chName}[${i}][0]`,
                `Keyframe timestamps must be non-decreasing (at index ${i}, t=${t} < prev=${prevT}).`,
                "Sort keyframes chronologically by time"
              );
            }
            prevT = t;
            if (typeof val !== "number") {
              addError(`channels.${chName}[${i}][1]`, "Keyframe value must be a number.");
            }
            if (easing != null && typeof easing !== "string") {
              addError(`channels.${chName}[${i}][2]`, "Easing name must be a string.");
            }
          }
        }
      }
    }
  }
  if (clip.windows != null) {
    if (typeof clip.windows !== "object" || Array.isArray(clip.windows)) {
      addError("windows", "Windows must be an object { window_name: [start, end] }.");
    } else {
      for (const [wName, win] of Object.entries(clip.windows)) {
        if (!Array.isArray(win) || win.length !== 2) {
          addError(
            `windows.${wName}`,
            `Window '${wName}' must be a 2-element array [start, end].`,
            RULE_CODES.WINDOW_INVALID
          );
        } else if (typeof win[0] !== "number" || typeof win[1] !== "number" || win[0] < 0 || win[0] >= win[1] || clip.duration && win[1] > clip.duration + 1e-4) {
          addError(
            `windows.${wName}`,
            `Window '${wName}' bounds [${win.join(", ")}] are invalid. Must satisfy 0 <= start < end <= duration.`,
            `Adjust window bounds so 0 <= ${win[0]} < ${win[1]} <= ${clip.duration}`,
            RULE_CODES.WINDOW_INVALID
          );
        }
      }
    }
  }
  if (clip.events != null) {
    if (!Array.isArray(clip.events)) {
      addError("events", "Events must be an array of event objects [{ t, id, ... }].");
    } else {
      for (let i = 0; i < clip.events.length; i++) {
        const ev = clip.events[i];
        if (!ev || typeof ev !== "object") {
          addError(`events[${i}]`, "Event must be an object.");
        } else if (typeof ev.t !== "number" || ev.t < 0 || clip.duration && ev.t > clip.duration + 1e-4) {
          addError(
            `events[${i}].t`,
            `Event time must be within clip duration (received t=${ev.t}).`,
            "Ensure event timestamp satisfies 0 <= t <= duration",
            RULE_CODES.EVENT_OUT_OF_BOUNDS
          );
        }
      }
    }
  }
  if (clip.expressions != null) {
    if (typeof clip.expressions !== "object" || Array.isArray(clip.expressions)) {
      addError("expressions", "Expressions must be an object of keyframe arrays.");
    } else {
      for (const [exprName, kfs] of Object.entries(clip.expressions)) {
        if (!VRM10_EXPRESSIONS.includes(exprName)) {
          addError(
            `expressions.${exprName}`,
            `Expression '${exprName}' is not a standard VRM 1.0 expression preset.`,
            `Use standard VRM 1.0 presets: ${VRM10_EXPRESSIONS.slice(0, 8).join(", ")}...`,
            RULE_CODES.VRM10_EXPRESSIONS
          );
        }
        if (!Array.isArray(kfs)) {
          addError(
            `expressions.${exprName}`,
            `Expression '${exprName}' keyframes must be an array of [time, weight, easing?].`
          );
        }
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function rootMotion(clip, t) {
  if (!clip.move) return [0, 0, 0];
  const segs = Array.isArray(clip.move) ? clip.move : [clip.move];
  let tot = [0, 0, 0];
  for (const s of segs) {
    const d = vnorm(s.dir), t0 = s.t0 ?? 0, t1 = s.t1 ?? clip.duration;
    const u = Math.min(1, Math.max(0, (t - t0) / Math.max(t1 - t0, 1e-6)));
    tot = vadd(tot, vscale(d, s.distance * ease(s.ease || "linear", u)));
  }
  return tot;
}
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];
const qinv = (q) => [-q[0], -q[1], -q[2], q[3]];
const qnorm = (q) => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};
const qaxis = (ax, ang) => {
  const l = Math.hypot(ax[0], ax[1], ax[2]) || 1;
  const s = Math.sin(ang / 2) / l;
  return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(ang / 2)];
};
const qrot = (q, v) => {
  const t = vscale(vcross([q[0], q[1], q[2]], v), 2);
  return vadd(vadd(v, vscale(t, q[3])), vcross([q[0], q[1], q[2]], t));
};
const qarc = (v0, v1) => {
  const d = vdot(v0, v1);
  if (d < -0.999999) {
    let ax = vcross([1, 0, 0], v0);
    if (vlen(ax) < 1e-6) ax = vcross([0, 1, 0], v0);
    return qaxis(vnorm(ax), Math.PI);
  }
  const c = vcross(v0, v1);
  return qnorm([c[0], c[1], c[2], 1 + d]);
};
const qangle = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])));
function evalExpressions(clip, t) {
  const o = {};
  const ex = clip.expressions || {};
  for (const k of Object.keys(ex)) {
    o[k] = sampleKeys(ex[k], t);
  }
  return o;
}
const OP_EVALUATORS = {
  axis: (op, gp, cv, qd) => {
    return qmul(qaxis(vnorm(qrot(gp, op.axis)), cv[op.ch] * D2R * op.w), qd);
  },
  aim: (op, gp, cv, qd) => {
    const el = cv[op.name + "_elev"] * D2R, az = cv[op.name + "_azim"] * D2R, ro = cv[op.name + "_roll"] * D2R;
    const d = [
      op.lateral[0] * Math.cos(el) * Math.cos(az),
      Math.sin(el),
      Math.cos(el) * Math.sin(az)
    ];
    const dc = vnorm(qrot(gp, d)), rc = vnorm(qrot(gp, op.rest_dir));
    return qmul(qaxis(dc, ro), qmul(qarc(rc, dc), qd));
  }
};
function evalPose(rig, ctx, clip, t) {
  const cv = evalChannels(rig, ctx, clip, t), n = ctx.n;
  const G = new Array(n), local = new Array(n), pos = new Array(n);
  let hips = ctx.offsets[0].slice();
  const ps = ctx.posScale;
  for (const po of ctx.posOps) {
    hips = vadd(hips, vscale(po.axis, cv[po.ch] * ps));
  }
  const root2 = rootMotion(clip, t);
  for (let i = 0; i < n; i++) {
    const p = ctx.parents[i];
    const gp = p < 0 ? [0, 0, 0, 1] : G[p];
    let qd = [0, 0, 0, 1];
    for (const op of ctx.ops[i]) {
      const evaluator = OP_EVALUATORS[op.kind];
      if (evaluator) {
        qd = evaluator(op, gp, cv, qd);
      }
    }
    G[i] = qnorm(qmul(qd, gp));
    local[i] = qnorm(qmul(qinv(gp), qmul(qd, gp)));
    pos[i] = p < 0 ? vadd(root2, hips) : vadd(pos[p], qrot(gp, ctx.offsets[i]));
  }
  return { pos, delta: G, local, root: root2, hips, cv, expr: evalExpressions(clip, t) };
}
function check$7({ ctx, limits, poses, tAt }) {
  const an = limits.anatomy;
  const I = ctx.idx;
  const lines = [];
  const issues = [];
  const fx = (v, d = 0) => v.toFixed(d);
  let kMin = Infinity, kMinSide = "kiri", kMinT = 0, kMax = -Infinity, kMaxSide = "kiri", kMaxT = 0, eMax = 0, eMaxSide = "kiri", eMaxT = 0, nMax = 0, nMaxT = 0;
  const ang = (a, b) => R2D * Math.acos(Math.min(1, Math.max(-1, vdot(a, b))));
  for (let f = 0; f < poses.length; f++) {
    const P = poses[f];
    const t = tAt(f);
    const p = P.pos;
    const lax = vnorm(vsub(p[I.LeftUpLeg], p[I.RightUpLeg]));
    for (const s of ["Left", "Right"]) {
      const th = vnorm(vsub(p[I[s + "Leg"]], p[I[s + "UpLeg"]]));
      const sh = vnorm(vsub(p[I[s + "Foot"]], p[I[s + "Leg"]]));
      const flex = R2D * Math.atan2(vdot(vcross(th, sh), lax), vdot(th, sh));
      if (flex < kMin - 1e-4) {
        kMin = flex;
        kMinSide = s === "Left" ? "kiri" : "kanan";
        kMinT = t;
      }
      if (flex > kMax + 1e-4) {
        kMax = flex;
        kMaxSide = s === "Left" ? "kiri" : "kanan";
        kMaxT = t;
      }
      const ua = vnorm(vsub(p[I[s + "ForeArm"]], p[I[s + "Arm"]]));
      const fa = vnorm(vsub(p[I[s + "Hand"]], p[I[s + "ForeArm"]]));
      const elbowAng = ang(ua, fa);
      if (elbowAng > eMax + 1e-4) {
        eMax = elbowAng;
        eMaxSide = s === "Left" ? "kiri" : "kanan";
        eMaxT = t;
      }
    }
    const neckAng = ang(vnorm(vsub(p[I.Neck], p[I.Spine2])), vnorm(vsub(p[I.Head], p[I.Neck])));
    if (neckAng > nMax + 1e-4) {
      nMax = neckAng;
      nMaxT = t;
    }
  }
  const kIsFail = kMin < an.knee_flex_min || kMax > an.knee_flex_max;
  const kTxt = `lutut: fleksi ${fx(kMin, 1)}° (${kMinSide} @${kMinT.toFixed(2)}s) sampai ${fx(kMax, 1)}° (${kMaxSide} @${kMaxT.toFixed(2)}s)`;
  lines.push(
    kIsFail ? [
      "FAIL",
      `${kTxt} (batas ${an.knee_flex_min}..${an.knee_flex_max}°, negatif = menekuk terbalik)`
    ] : ["PASS", `${kTxt} (dalam batas ${an.knee_flex_min}..${an.knee_flex_max}°)`]
  );
  if (kMin < an.knee_flex_min) {
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.ANATOMY_KNEE,
        joint: kMinSide === "kiri" ? "LeftLeg" : "RightLeg",
        t: kMinT,
        value: kMin,
        limit: an.knee_flex_min,
        unit: "deg",
        hint: `Increase knee angle by at least ${(an.knee_flex_min - kMin).toFixed(1)}° to avoid negative hyperextension.`
      })
    );
  }
  if (kMax > an.knee_flex_max) {
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.ANATOMY_KNEE,
        joint: kMaxSide === "kiri" ? "LeftLeg" : "RightLeg",
        t: kMaxT,
        value: kMax,
        limit: an.knee_flex_max,
        unit: "deg",
        hint: `Reduce knee flexion by at least ${(kMax - an.knee_flex_max).toFixed(1)}° to stay within anatomical limit ${an.knee_flex_max}°.`
      })
    );
  }
  lines.push([
    eMax > an.elbow_flex_max ? "FAIL" : "PASS",
    `siku: tekuk maks ${fx(eMax, 1)}° (${eMaxSide} @${eMaxT.toFixed(2)}s, batas maks ${an.elbow_flex_max}°)`
  ]);
  if (eMax > an.elbow_flex_max) {
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.ANATOMY_ELBOW,
        joint: eMaxSide === "kiri" ? "LeftForeArm" : "RightForeArm",
        t: eMaxT,
        value: eMax,
        limit: an.elbow_flex_max,
        unit: "deg",
        hint: `Reduce elbow flexion by at least ${(eMax - an.elbow_flex_max).toFixed(1)}° to stay within ${an.elbow_flex_max}°.`
      })
    );
  }
  lines.push([
    nMax > an.neck_bend_max ? "FAIL" : "PASS",
    `leher-kepala: tekuk maks ${fx(nMax, 1)}° (@${nMaxT.toFixed(2)}s, batas maks ${an.neck_bend_max}°)`
  ]);
  if (nMax > an.neck_bend_max) {
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.ANATOMY_NECK,
        joint: "Neck",
        t: nMaxT,
        value: nMax,
        limit: an.neck_bend_max,
        unit: "deg",
        hint: `Reduce neck/head tilt by at least ${(nMax - an.neck_bend_max).toFixed(1)}° to stay within ${an.neck_bend_max}°.`
      })
    );
  }
  return { lines, issues };
}
const anatomyRule = {
  name: "anatomy",
  check: check$7
};
function check$6({ ctx, limits, style = "stylized", poses, frames, FPS: FPS2 = 30 }) {
  const lim = limits.styles[style];
  const lines = [];
  const issues = [];
  const fx = (v, d = 0) => v.toFixed(d);
  let mS = 0, mSb = "", mSt = 0, mA = 0, mAb = "", mAt = 0;
  const speedSeries = new Array(frames + 1).fill(0);
  for (let i = 0; i < ctx.n; i++) {
    let prevS = 0;
    for (let f = 1; f <= frames; f++) {
      const s = qangle(poses[f - 1].local[i], poses[f].local[i]) * R2D * FPS2;
      speedSeries[f] = Math.max(speedSeries[f], s);
      if (s > mS + 1e-4) {
        mS = s;
        mSb = ctx.names[i];
        mSt = f / FPS2;
      }
      const acc = Math.abs(s - prevS) * FPS2;
      if (f > 1 && acc > mA + 1e-4) {
        mA = acc;
        mAb = ctx.names[i];
        mAt = f / FPS2;
      }
      prevS = s;
    }
  }
  const spTxt = `kecepatan sudut maks ${fx(mS)} °/s (${mSb} @${mSt.toFixed(2)}s)`;
  if (mS > lim.ang_speed_fail) {
    lines.push(["FAIL", `${spTxt} > ${lim.ang_speed_fail}`]);
    const minSpacing = mS / (lim.ang_speed_warn * FPS2);
    const pctReduction = Math.round((1 - lim.ang_speed_warn / mS) * 100);
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.SPEED_LIMIT,
        joint: mSb,
        t: mSt,
        value: mS,
        limit: lim.ang_speed_fail,
        unit: "deg/s",
        hint: `Increase keyframe spacing near t=${mSt.toFixed(2)}s to at least ${minSpacing.toFixed(3)}s or reduce angular rotation by at least ${pctReduction}%.`
      })
    );
  } else if (mS > lim.ang_speed_warn) {
    lines.push(["WARN", `${spTxt} > ${lim.ang_speed_warn} (menyentak?)`]);
    const minSpacing = mS / (lim.ang_speed_warn * FPS2);
    const pctReduction = Math.round((1 - lim.ang_speed_warn / mS) * 100);
    issues.push(
      createIssue({
        level: "WARN",
        rule: RULE_CODES.SPEED_LIMIT,
        joint: mSb,
        t: mSt,
        value: mS,
        limit: lim.ang_speed_warn,
        unit: "deg/s",
        hint: `Increase keyframe spacing near t=${mSt.toFixed(2)}s to at least ${minSpacing.toFixed(3)}s or reduce angular rotation by at least ${pctReduction}%.`
      })
    );
  } else {
    lines.push(["PASS", spTxt]);
  }
  lines.push([
    mA > lim.ang_accel_warn ? "WARN" : "PASS",
    `percepatan sudut maks ${fx(mA)} °/s² (${mAb} @${mAt.toFixed(2)}s)`
  ]);
  if (mA > lim.ang_accel_warn) {
    issues.push(
      createIssue({
        level: "WARN",
        rule: RULE_CODES.ACCEL_LIMIT,
        joint: mAb,
        t: mAt,
        value: mA,
        limit: lim.ang_accel_warn,
        unit: "deg/s²",
        hint: `Smooth out rapid acceleration changes on joint ${mAb} around t=${mAt.toFixed(2)}s.`
      })
    );
  }
  return { lines, issues, speedSeries };
}
const angularSpeedRule = {
  name: "angular-speed",
  check: check$6
};
function checkChannelRanges(rig, clip) {
  const w = [];
  const issues = [];
  const valid = allChannelNames(rig);
  const chs = clip.channels || {};
  for (const c of Object.keys(chs)) {
    if (!valid.includes(c)) {
      w.push(["FAIL", `channel tidak dikenal: ${c}`]);
      const suggestion = findClosestChannel(c, valid);
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.CHANNEL_UNKNOWN,
          channel: c,
          hint: suggestion ? `Unknown channel '${c}', did you mean '${suggestion}'?` : `Unknown channel '${c}'.`
        })
      );
      continue;
    }
    const rg = channelRange(rig, c);
    let worst = 0;
    let wt = 0;
    let valAtWorst = 0;
    for (let f = 0; f <= Math.ceil(clip.duration * FPS); f++) {
      const t = Math.min(f / FPS, clip.duration);
      const v = sampleKeys(chs[c], t);
      const over = Math.max(rg[0] - v, v - rg[1]);
      if (over > 1e-4 && over > worst) {
        worst = over;
        wt = t;
        valAtWorst = v;
      }
    }
    if (worst > 0) {
      w.push([
        "WARN",
        `channel ${c} keluar range [${rg[0]}, ${rg[1]}]: nilai ${valAtWorst.toFixed(1)} (selisih ${worst.toFixed(1)}) di t=${wt.toFixed(2)}s`
      ]);
      const limit = valAtWorst > rg[1] ? rg[1] : rg[0];
      issues.push(
        createIssue({
          level: "WARN",
          rule: RULE_CODES.CHANNEL_RANGE_EXCEEDED,
          channel: c,
          t: wt,
          value: valAtWorst,
          limit,
          unit: "deg",
          hint: `Clamp channel '${c}' between [${rg[0]}, ${rg[1]}]; current value ${valAtWorst.toFixed(1)} exceeds limit by ${worst.toFixed(1)}.`
        })
      );
    }
  }
  return { lines: w, issues };
}
function check$5({ rig, clip }) {
  const result = checkChannelRanges(rig, clip);
  const lines = result.lines.map((item) => Array.isArray(item) ? item : ["WARN", item]);
  return { lines, issues: result.issues };
}
const channelRangesRule = {
  name: "channel-ranges",
  check: check$5
};
function check$4({ ctx, limits, clip, poses, floorY: floorY2, tAt, FPS: FPS2 = 30 }) {
  const fl = limits.floor;
  const vm = clip.validate || {};
  const I = ctx.idx;
  const lines = [];
  const issues = [];
  let minToe = Infinity, minToeSide = "kiri", minToeT = 0, contact = 0;
  const slide = [];
  let maxSlide = 0, maxSlideSide = "", maxSlideT = 0;
  for (let f = 0; f < poses.length; f++) {
    const t = tAt(f);
    for (const s of ["Left", "Right"]) {
      const ti = I[s + "ToeBase"];
      const tp = poses[f].pos[ti];
      if (tp[1] < minToe - 1e-5) {
        minToe = tp[1];
        minToeSide = s === "Left" ? "kiri" : "kanan";
        minToeT = t;
      }
      const plantedWin = s === "Left" ? clip.windows?.planted_L : clip.windows?.planted_R;
      const inC = plantedWin ? t >= plantedWin[0] && t <= plantedWin[1] : tp[1] - floorY2 < fl.contact_height_m;
      if (inC) contact++;
      if (f + 1 < poses.length && inC) {
        const nextT = tAt(f + 1);
        const nextInC = plantedWin ? nextT >= plantedWin[0] && nextT <= plantedWin[1] : poses[f + 1].pos[ti][1] - floorY2 < fl.contact_height_m;
        if (nextInC) {
          const tn = poses[f + 1].pos[ti];
          const spd = Math.hypot(tn[0] - tp[0], tn[2] - tp[2]) * FPS2;
          slide.push(spd);
          if (spd > maxSlide + 1e-4) {
            maxSlide = spd;
            maxSlideSide = s === "Left" ? "kiri" : "kanan";
            maxSlideT = t;
          }
        }
      }
    }
  }
  const pen = floorY2 - minToe;
  if (vm.check_floor !== false) {
    const isPenFail = pen > fl.penetration_fail_m;
    lines.push([
      isPenFail ? "FAIL" : "PASS",
      `lantai: toe ${minToeSide} terendah ${(minToe - floorY2).toFixed(3)} m dari lantai di t=${minToeT.toFixed(2)}s (penetrasi ${Math.max(
        pen,
        0
      ).toFixed(3)} m, batas maks ${fl.penetration_fail_m} m)`
    ]);
    if (isPenFail) {
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.FLOOR_PENETRATION,
          joint: minToeSide === "kiri" ? "LeftToeBase" : "RightToeBase",
          t: minToeT,
          value: pen,
          limit: fl.penetration_fail_m,
          unit: "m",
          hint: `Raise hip_y/root by at least ${(pen - fl.penetration_fail_m).toFixed(3)}m or adjust foot flexion.`
        })
      );
    }
  }
  if (vm.foot_slide !== false || clip.windows?.planted_L || clip.windows?.planted_R) {
    if (!slide.length) {
      lines.push(["PASS", "foot sliding: tidak ada frame kontak (klip melayang/tanpa tumpuan)"]);
    } else {
      slide.sort((a, b) => a - b);
      const mean = slide.reduce((a, b) => a + b, 0) / slide.length;
      const p95 = slide[Math.floor(slide.length * 0.95)];
      const hasPlanted = clip.windows?.planted_L || clip.windows?.planted_R;
      const label = hasPlanted ? "foot sliding (jendela tumpuan)" : "foot sliding";
      const isSlideWarn = p95 > fl.slide_warn_ms;
      lines.push([
        isSlideWarn ? "WARN" : "PASS",
        `${label}: ${contact} frame kontak, rata-rata ${mean.toFixed(2)} m/s, p95 ${p95.toFixed(
          2
        )} m/s (maks ${maxSlide.toFixed(2)} m/s @${maxSlideT.toFixed(2)}s kaki ${maxSlideSide}, batas ${fl.slide_warn_ms} m/s)`
      ]);
      if (isSlideWarn) {
        issues.push(
          createIssue({
            level: "WARN",
            rule: RULE_CODES.FOOT_SLIDE,
            joint: maxSlideSide === "kiri" ? "LeftToeBase" : "RightToeBase",
            t: maxSlideT,
            value: p95,
            limit: fl.slide_warn_ms,
            unit: "m/s",
            hint: "Lock foot position during planted window or reduce horizontal root speed during ground contact."
          })
        );
      }
    }
  }
  return { lines, issues };
}
const floorRule = {
  name: "floor",
  check: check$4
};
function check$3({ ctx, clip, limits, style = "stylized", poses, frames }) {
  const lines = [];
  const issues = [];
  if (!clip.loop) return { lines, issues };
  const lim = limits.styles[style];
  let worst = 0, wb = "";
  for (let i = 0; i < ctx.n; i++) {
    const d = qangle(poses[0].local[i], poses[frames].local[i]) * R2D;
    if (d > worst + 1e-4) {
      worst = d;
      wb = ctx.names[i];
    }
  }
  const isFail = worst > lim.loop_pose_diff_deg;
  lines.push([
    isFail ? "FAIL" : "PASS",
    `loop: selisih pose awal-akhir maks ${worst.toFixed(1)}° (${wb})`
  ]);
  if (isFail) {
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.LOOP_MISMATCH,
        joint: wb,
        value: worst,
        limit: lim.loop_pose_diff_deg,
        unit: "deg",
        hint: `Align start and end keyframes for joint ${wb} (current difference: ${worst.toFixed(1)}°, limit: ${lim.loop_pose_diff_deg}°).`
      })
    );
  }
  return { lines, issues };
}
const loopRule = {
  name: "loop",
  check: check$3
};
function check$2({ limits, clip, style = "stylized", poses, frames, FPS: FPS2 = 30 }) {
  const lim = limits.styles[style];
  const dur = clip.duration;
  const lines = [];
  const issues = [];
  const r0 = poses[0].root, r1 = poses[frames].root, dist = Math.hypot(r1[0] - r0[0], r1[2] - r0[2]);
  lines.push(["PASS", `root motion: ${dist.toFixed(2)} m horizontal dalam ${dur.toFixed(2)} s`]);
  let rMax = 0, rMaxT = 0;
  const rootSpeed = new Array(frames + 1).fill(0);
  for (let f = 1; f <= frames; f++) {
    const a = poses[f - 1].root, b = poses[f].root, s = Math.hypot(b[0] - a[0], b[2] - a[2]) * FPS2;
    rootSpeed[f] = s;
    if (s > rMax) {
      rMax = s;
      rMaxT = f / FPS2;
    }
  }
  if (rMax > 0.01) {
    const t = `kecepatan root maks ${rMax.toFixed(1)} m/s @${rMaxT.toFixed(2)}s`;
    if (rMax > lim.root_speed_fail) {
      lines.push(["FAIL", `${t} > ${lim.root_speed_fail} (terasa seperti teleport)`]);
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.ROOT_MOTION_SPEED,
          joint: "root",
          t: rMaxT,
          value: rMax,
          limit: lim.root_speed_fail,
          unit: "m/s",
          hint: `Smooth root motion translation or reduce displacement near t=${rMaxT.toFixed(2)}s.`
        })
      );
    } else if (rMax > lim.root_speed_warn) {
      lines.push(["WARN", `${t} > ${lim.root_speed_warn}`]);
      issues.push(
        createIssue({
          level: "WARN",
          rule: RULE_CODES.ROOT_MOTION_SPEED,
          joint: "root",
          t: rMaxT,
          value: rMax,
          limit: lim.root_speed_warn,
          unit: "m/s",
          hint: `Smooth root motion translation or reduce displacement near t=${rMaxT.toFixed(2)}s.`
        })
      );
    } else {
      lines.push(["PASS", t]);
    }
  }
  const cl = clip.claims || {};
  if (cl.distance != null) {
    const tol = cl.tolerance ?? 0.1;
    const isDistPass = Math.abs(dist - cl.distance) <= cl.distance * tol;
    lines.push([
      isDistPass ? "PASS" : "FAIL",
      `klaim jarak ${cl.distance.toFixed(2)} m (±${Math.round(tol * 100)}%): terukur ${dist.toFixed(
        2
      )} m`
    ]);
    if (!isDistPass) {
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.ROOT_MOTION_CLAIM_DIST,
          joint: "root",
          value: dist,
          limit: cl.distance,
          unit: "m",
          hint: `Actual root travel ${dist.toFixed(2)}m does not match claimed distance ${cl.distance.toFixed(2)}m (±${Math.round(tol * 100)}%).`
        })
      );
    }
  }
  if (cl.duration != null) {
    const tol = cl.tolerance ?? 0.1;
    const isDurPass = Math.abs(dur - cl.duration) <= cl.duration * tol;
    lines.push([
      isDurPass ? "PASS" : "FAIL",
      `klaim durasi ${cl.duration.toFixed(2)} s: terukur ${dur.toFixed(2)} s`
    ]);
    if (!isDurPass) {
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.ROOT_MOTION_CLAIM_DUR,
          value: dur,
          limit: cl.duration,
          unit: "s",
          hint: `Actual duration ${dur.toFixed(2)}s does not match claimed duration ${cl.duration.toFixed(2)}s.`
        })
      );
    }
  }
  return { lines, issues, rootSpeed };
}
const rootMotionRule = {
  name: "root-motion",
  check: check$2
};
function versionIssues(version, changelog, fv = 1) {
  const out = [];
  const issues = [];
  if (fv > FORMAT_VERSION) {
    out.push(["FAIL", `format_version ${fv} lebih baru dari yang didukung (${FORMAT_VERSION})`]);
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.VERSION_FORMAT,
        value: fv,
        limit: FORMAT_VERSION,
        hint: `format_version ${fv} is newer than currently supported version ${FORMAT_VERSION}.`
      })
    );
  }
  if (!Array.isArray(changelog) || !changelog.length) {
    out.push(["WARN", `v${version} tanpa changelog`]);
    issues.push(
      createIssue({
        level: "WARN",
        rule: RULE_CODES.CHANGELOG_INVALID,
        hint: `Provide a changelog array detailing changes for v${version}.`
      })
    );
    return { lines: out, issues };
  }
  let ok = true;
  changelog.forEach((e, i) => {
    if (!e || +e.v !== i + 1 || !String(e.catatan || "").trim()) ok = false;
  });
  if (!ok) {
    out.push(["FAIL", "changelog tidak valid (harus berurutan v1..vN, tiap entri punya catatan)"]);
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.CHANGELOG_INVALID,
        hint: "Changelog must be sequential from v1..vN with a non-empty catatan note."
      })
    );
  } else if (changelog[changelog.length - 1].v !== version) {
    const lastV = changelog[changelog.length - 1].v;
    out.push(["FAIL", `version ${version} tetapi changelog berakhir di v${lastV}`]);
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.CHANGELOG_VERSION_MISMATCH,
        value: version,
        limit: lastV,
        hint: `Clip version ${version} does not match last changelog entry v${lastV}.`
      })
    );
  } else {
    out.push([
      "PASS",
      `versi v${version}, format ${fv}, changelog ${changelog.length} entri konsisten`
    ]);
  }
  return { lines: out, issues };
}
function check$1({ clip }) {
  const result = versionIssues(clip.version ?? 1, clip.changelog, clip.format_version ?? 1);
  return result;
}
const versionRule = {
  name: "version",
  check: check$1
};
function check({ clip }) {
  const dur = clip.duration;
  const lines = [];
  const issues = [];
  const wins = clip.windows || {};
  for (const wn of Object.keys(wins)) {
    const w = wins[wn];
    const ok = w.length === 2 && w[0] >= 0 && w[0] < w[1] && w[1] <= dur + 1e-4;
    lines.push([
      ok ? "PASS" : "FAIL",
      `jendela ${wn} [${w.join(", ")}] ${ok ? "valid" : "tidak valid (harus 0 <= mulai < akhir <= durasi)"}`
    ]);
    if (!ok) {
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.WINDOW_INVALID,
          channel: wn,
          hint: `Ensure window '${wn}' satisfies 0 <= start < end <= duration (${dur.toFixed(2)}s).`
        })
      );
    }
  }
  const hn = wins.hitbox ? "hitbox" : wins.active ? "active" : "";
  if (hn && wins.cancel) {
    const ok = wins.cancel[0] >= wins[hn][1] - 1e-4;
    lines.push([
      ok ? "PASS" : "FAIL",
      `urutan: cancel (${wins.cancel[0].toFixed(2)}) dimulai setelah ${hn} selesai (${wins[hn][1].toFixed(2)})`
    ]);
    if (!ok) {
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.WINDOW_SEQUENCE,
          hint: `Window 'cancel' (${wins.cancel[0].toFixed(2)}) must start after '${hn}' ends (${wins[hn][1].toFixed(2)}).`
        })
      );
    }
  }
  for (const ev of clip.events || []) {
    const ok = ev.t >= 0 && ev.t <= dur + 1e-4;
    if (!ok) {
      lines.push(["FAIL", `event ${ev.id ?? "?"} di t=${ev.t} di luar durasi`]);
      issues.push(
        createIssue({
          level: "FAIL",
          rule: RULE_CODES.EVENT_OUT_OF_BOUNDS,
          t: ev.t,
          hint: `Event '${ev.id ?? "?"}' timestamp t=${ev.t} is outside clip duration (${dur.toFixed(2)}s).`
        })
      );
    }
  }
  return { lines, issues };
}
const windowsRule = {
  name: "windows",
  check
};
class RuleRegistry {
  constructor() {
    this.rules = /* @__PURE__ */ new Map();
  }
  register(rule) {
    if (!rule || !rule.name || typeof rule.check !== "function") {
      throw new Error("Invalid rule: must have name and check function");
    }
    this.rules.set(rule.name, rule);
    return this;
  }
  unregister(name2) {
    this.rules.delete(name2);
    return this;
  }
  get(name2) {
    return this.rules.get(name2);
  }
  getRules() {
    return Array.from(this.rules.values());
  }
}
function createDefaultRuleRegistry() {
  const registry = new RuleRegistry();
  registry.register(angularSpeedRule);
  registry.register(loopRule);
  registry.register(anatomyRule);
  registry.register(floorRule);
  registry.register(rootMotionRule);
  registry.register(windowsRule);
  registry.register(versionRule);
  registry.register(channelRangesRule);
  return registry;
}
const defaultRuleRegistry = createDefaultRuleRegistry();
function validate(rig, ctx, limits, clip, style = "stylized", registry = defaultRuleRegistry, options = {}) {
  const dur = clip.duration, frames = Math.ceil(dur * FPS - 1e-9);
  const tAt = (f) => Math.min(f / FPS, dur);
  const poses = [];
  for (let f = 0; f <= frames; f++) poses.push(evalPose(rig, ctx, clip, tAt(f)));
  const I = ctx.idx, restPos = restPositions(ctx);
  const floorY2 = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);
  const ruleContext = {
    rig,
    ctx,
    limits,
    clip,
    style,
    poses,
    floorY: floorY2,
    frames,
    tAt,
    FPS
  };
  const lines = [];
  const issues = [];
  let speedSeries = null;
  let rootSpeed = null;
  for (const rule of registry.getRules()) {
    const result = rule.check(ruleContext);
    if (!result) continue;
    const ruleLines = Array.isArray(result) ? result : result.lines || [];
    for (const line of ruleLines) {
      lines.push(line);
    }
    if (result.issues && Array.isArray(result.issues)) {
      for (const issue of result.issues) {
        issues.push(issue);
      }
    }
    if (result.speedSeries) speedSeries = result.speedSeries;
    if (result.rootSpeed) rootSpeed = result.rootSpeed;
  }
  let filteredIssues = issues;
  if (options.part && options.parts && options.parts[options.part]) {
    const partDef = options.parts[options.part];
    const chSet = new Set(partDef.channels || []);
    const jtSet = new Set(partDef.joints || []);
    filteredIssues = issues.filter((iss) => {
      if (iss.channel && chSet.has(iss.channel)) return true;
      if (iss.joint && jtSet.has(iss.joint)) return true;
      return false;
    });
  }
  const fail = lines.filter((l) => l[0] === "FAIL").length;
  const warn = lines.filter((l) => l[0] === "WARN").length;
  return {
    lines,
    fail,
    warn,
    poses,
    floorY: floorY2,
    speedSeries,
    rootSpeed,
    frames,
    issues: filteredIssues
  };
}
const DEFAULT_PALETTE = {
  "--bg": "#0e1317",
  "--panel": "#161d23",
  "--panel2": "#1c252c",
  "--view": "#0a0f13",
  "--ink": "#e3eaef",
  "--muted": "#8c9dab",
  "--line": "#27323b",
  "--accent": "#6aa7ff",
  "--accent-ink": "#0b1722",
  "--fig": "#cfd9e0",
  "--figL": "#5aa2ff",
  "--figR": "#ff9a5c",
  "--grid": "#1f2a33",
  "--grid2": "#33424e",
  "--pass": "#1b7f47",
  "--warn": "#a96d08",
  "--fail": "#c22d2d",
  "--w-inv": "#0b8a84",
  "--w-hitbox": "#c22d2d",
  "--w-parry": "#a96d08",
  "--w-cancel": "#6446c4",
  "--t-handR": "#d65a1c",
  "--t-handL": "#1b6fe0",
  "--t-foot": "#6b7c8a",
  "--t-head": "#7a52c9"
};
const C = { ...DEFAULT_PALETTE };
function winColor(w) {
  return C["--w-" + (w === "active" ? "hitbox" : w)] || C["--accent"];
}
function checkVrm10(rig, ctx, clip) {
  const out = [];
  const rigBones = rig.animated_bones.map((b) => vn(rig, b));
  const missingReq = REQUIRED_VRM_BONES.filter((b) => !rigBones.includes(b));
  out.push(
    missingReq.length ? ["FAIL", `VRM 1.0 humanoid: bone wajib tidak lengkap di rig (${missingReq.join(", ")})`] : [
      "PASS",
      `VRM 1.0 humanoid: 15 bone wajib terpenuhi (${rigBones.length} total bone humanoid)`
    ]
  );
  const clipChannels = Object.keys(clip.channels || {});
  const animatedBones = /* @__PURE__ */ new Set();
  const invalidBones = [];
  for (const ch of clipChannels) {
    const chDef = rig.channels[ch];
    if (chDef && chDef.bone) {
      const vname = vn(rig, chDef.bone);
      if (vname) {
        animatedBones.add(vname);
        if (!VRM10_BONES.includes(vname)) {
          invalidBones.push(`${ch} (${vname})`);
        }
      }
    }
  }
  if (invalidBones.length) {
    out.push([
      "FAIL",
      `VRM 1.0 humanoid: channel menganimasikan bone di luar standar VRM 1.0: ${invalidBones.join(", ")}`
    ]);
  } else {
    out.push([
      "PASS",
      `VRM 1.0 humanoid: ${animatedBones.size} bone dianimasikan klip, semua sesuai standar VRM 1.0`
    ]);
  }
  const nonHipsPos = clipChannels.filter((k) => {
    const chDef = rig.channels[k];
    return chDef?.type === "pos" && vn(rig, chDef.bone) !== "hips";
  });
  out.push(
    nonHipsPos.length ? [
      "FAIL",
      `VRMC_vrm_animation-1.0 melarang translasi selain di hips (${nonHipsPos.join(", ")})`
    ] : ["PASS", "VRMC_vrm_animation-1.0: translasi hanya pada hips"]
  );
  if (clip.vrm_spec != null && clip.vrm_spec !== "1.0") {
    out.push([
      "FAIL",
      'VRM 1.0 spesifikasi: vrm_spec "' + clip.vrm_spec + '" ditolak, harus "1.0"'
    ]);
  }
  const ex = clip.expressions || {}, names = Object.keys(ex);
  if (names.length) {
    const bad = names.filter((n) => !VRM10_EXPRESSIONS.includes(n));
    if (bad.length) {
      out.push(["FAIL", "VRM 1.0 ekspresi: nama preset tidak standar (" + bad.join(", ") + ")"]);
    }
    const oor = names.some((n) => ex[n].some((k) => k[1] < -1e-4 || k[1] > 1.0001));
    if (oor) {
      out.push(["FAIL", "VRM 1.0 ekspresi: bobot harus di rentang [0, 1]"]);
    } else if (!bad.length) {
      out.push([
        "PASS",
        "VRM 1.0 ekspresi: " + names.length + " preset valid (" + names.join(", ") + ") dalam [0, 1]"
      ]);
    }
  }
  return out;
}
const ClipKit = {
  VRM10_BONES,
  VRM10_EXPRESSIONS,
  evalExpressions,
  checkVrm10,
  FPS,
  ease,
  EASINGS,
  sampleKeys,
  rootMotion,
  makeCtx,
  evalPose,
  evalChannels,
  restPositions,
  validate,
  allChannelNames,
  channelDefault,
  channelRange,
  checkChannelRanges,
  versionIssues,
  qrot,
  qmul,
  qinv,
  vadd,
  vsub,
  vnorm,
  vlen,
  vdot,
  vcross
};
const WIDTH = {
  Spine: 0.12,
  Spine1: 0.13,
  Spine2: 0.13,
  Neck: 0.05,
  Head: 0.04,
  LeftShoulder: 0.06,
  RightShoulder: 0.06,
  LeftArm: 0.05,
  RightArm: 0.05,
  LeftForeArm: 0.042,
  RightForeArm: 0.042,
  LeftHand: 0.03,
  RightHand: 0.03,
  LeftUpLeg: 0.09,
  RightUpLeg: 0.09,
  LeftLeg: 0.075,
  RightLeg: 0.075,
  LeftFoot: 0.05,
  RightFoot: 0.05,
  LeftToeBase: 0.04,
  RightToeBase: 0.04
};
const sideColor = (n, C2) => n.startsWith("Left") ? C2["--figL"] : n.startsWith("Right") ? C2["--figR"] : C2["--fig"];
function floorY(it) {
  return it && it.res ? it.res.floorY : 0.03;
}
function drawFigure(g, P, ctx, rig, alpha, thin, prjFn, C2, KF) {
  const pos = P.pos;
  const segs = [];
  const I = ctx.idx;
  const rs = rig.scale || 1;
  for (let i = 1; i < ctx.n; i++) {
    const a = prjFn(pos[ctx.parents[i]]);
    const b = prjFn(pos[i]);
    if (a && b) segs.push({ i, a, b, z: (a[2] + b[2]) / 2 });
  }
  segs.sort((s, t) => t.z - s.z);
  g.globalAlpha = alpha;
  g.lineCap = "round";
  for (const s of segs) {
    const n = ctx.names[s.i];
    g.strokeStyle = sideColor(n, C2);
    g.lineWidth = Math.max(2, (WIDTH[n] || 0.012) * rs * KF / s.z);
    g.beginPath();
    g.moveTo(s.a[0], s.a[1]);
    g.lineTo(s.b[0], s.b[1]);
    g.stroke();
  }
  const hd = P.delta[I.Head];
  const c = ClipKit.vadd(pos[I.Head], ClipKit.qrot(hd, [0, 0.1 * rs, 0.012 * rs]));
  const nose = ClipKit.vadd(c, ClipKit.qrot(hd, [0, -5e-3 * rs, 0.105 * rs]));
  const pc = prjFn(c);
  const pn = prjFn(nose);
  if (pc) {
    const rr = Math.max(3, 0.1 * rs * KF / pc[2]);
    g.strokeStyle = C2["--fig"];
    g.fillStyle = C2["--view"];
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(pc[0], pc[1], rr, 0, 7);
    g.fill();
    g.stroke();
    if (pn && true) {
      g.fillStyle = C2["--fig"];
      g.beginPath();
      g.arc(pn[0], pn[1], Math.max(2, 0.014 * rs * KF / pn[2]), 0, 7);
      g.fill();
    }
  }
  {
    for (let i = 0; i < ctx.n; i++) {
      const p = prjFn(pos[i]);
      if (!p) continue;
      g.fillStyle = C2["--view"];
      g.strokeStyle = sideColor(ctx.names[i], C2);
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(p[0], p[1], Math.max(1.8, 0.016 * rs * KF / p[2]), 0, 7);
      g.fill();
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}
function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
class SvgContext2D {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.elements = [];
    this.currentPath = "";
    this.fillStyle = "#000000";
    this.strokeStyle = "#000000";
    this.lineWidth = 1;
    this.lineCap = "butt";
    this.lineDash = [];
    this.globalAlpha = 1;
    this.font = "12px sans-serif";
    this.textAlign = "left";
    this.stateStack = [];
  }
  save() {
    this.stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineCap: this.lineCap,
      lineDash: [...this.lineDash],
      globalAlpha: this.globalAlpha,
      font: this.font,
      textAlign: this.textAlign
    });
  }
  restore() {
    const s = this.stateStack.pop();
    if (s) {
      this.fillStyle = s.fillStyle;
      this.strokeStyle = s.strokeStyle;
      this.lineWidth = s.lineWidth;
      this.lineCap = s.lineCap;
      this.lineDash = s.lineDash;
      this.globalAlpha = s.globalAlpha;
      this.font = s.font;
      this.textAlign = s.textAlign;
    }
  }
  setTransform(_a, _b, _c, _d, _e, _f) {
  }
  beginPath() {
    this.currentPath = "";
  }
  moveTo(x, y) {
    this.currentPath += `M ${Number(x.toFixed(2))} ${Number(y.toFixed(2))} `;
  }
  lineTo(x, y) {
    this.currentPath += `L ${Number(x.toFixed(2))} ${Number(y.toFixed(2))} `;
  }
  arc(x, y, r, startAngle, endAngle) {
    const sweep = Math.abs(endAngle - startAngle);
    if (sweep >= 2 * Math.PI - 0.05) {
      this.elements.push(
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="${this.fillStyle}" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" opacity="${this.globalAlpha}" />`
      );
    } else {
      const x1 = x + r * Math.cos(startAngle);
      const y1 = y + r * Math.sin(startAngle);
      const x2 = x + r * Math.cos(endAngle);
      const y2 = y + r * Math.sin(endAngle);
      const largeArc = sweep > Math.PI ? 1 : 0;
      this.currentPath += `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} `;
    }
  }
  ellipse(x, y, rx, ry, _rotation, startAngle, endAngle) {
    const sweep = Math.abs(endAngle - startAngle);
    if (sweep >= 2 * Math.PI - 0.05) {
      this.elements.push(
        `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="${this.fillStyle}" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" opacity="${this.globalAlpha}" />`
      );
    }
  }
  stroke() {
    if (!this.currentPath.trim()) return;
    const dash = this.lineDash.length ? ` stroke-dasharray="${this.lineDash.join(",")}"` : "";
    this.elements.push(
      `<path d="${this.currentPath.trim()}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" stroke-linecap="${this.lineCap}"${dash} opacity="${this.globalAlpha}" />`
    );
  }
  fill() {
    if (!this.currentPath.trim()) return;
    this.elements.push(
      `<path d="${this.currentPath.trim()}" fill="${this.fillStyle}" stroke="none" opacity="${this.globalAlpha}" />`
    );
  }
  fillRect(x, y, w, h) {
    this.elements.push(
      `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${this.fillStyle}" opacity="${this.globalAlpha}" />`
    );
  }
  strokeRect(x, y, w, h) {
    this.elements.push(
      `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" opacity="${this.globalAlpha}" />`
    );
  }
  fillText(text, x, y) {
    let anchor = "start";
    if (this.textAlign === "center") anchor = "middle";
    else if (this.textAlign === "right") anchor = "end";
    let fontSize = "12px";
    const m = String(this.font).match(/(\d+(?:\.\d+)?px)/);
    if (m) fontSize = m[1];
    this.elements.push(
      `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${this.fillStyle}" font-family="monospace, sans-serif" font-size="${fontSize}" text-anchor="${anchor}" opacity="${this.globalAlpha}">${escapeXml(text)}</text>`
    );
  }
  measureText(text) {
    let fontSize = 12;
    const m = String(this.font).match(/(\d+(?:\.\d+)?)px/);
    if (m) fontSize = parseFloat(m[1]);
    return { width: text.length * fontSize * 0.6 };
  }
  setLineDash(d) {
    this.lineDash = Array.isArray(d) ? d : [];
  }
  toSvg() {
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}">`,
      `<rect width="${this.width}" height="${this.height}" fill="#111318" />`,
      ...this.elements,
      `</svg>`
    ].join("\n");
  }
}
function buildCamBasis(yaw, pitch, dist, target) {
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const eye = [target[0] + dist * sy * cp, target[1] + dist * sp, target[2] + dist * cy * cp];
  const f = vnorm(vsub(target, eye));
  let r = vcross(f, [0, 1, 0]);
  if (vlen(r) < 1e-4) r = [1, 0, 0];
  r = vnorm(r);
  const u = vcross(r, f);
  return { eye, f, r, u };
}
function projectPoint(p, offsetX, offsetY, cellW, cellH, KF, B) {
  const d = vsub(p, B.eye);
  const z = vdot(d, B.f);
  if (z < 0.05) return null;
  return [
    offsetX + cellW / 2 + vdot(d, B.r) / z * KF,
    offsetY + cellH / 2 - vdot(d, B.u) / z * KF,
    z
  ];
}
function renderContactSheet(rig, ctx, clip, options = {}) {
  const frameCount = Math.min(16, Math.max(4, options.frameCount || 8));
  const dur = clip.duration || 1;
  const silhouette = !!options.silhouette;
  const viewMode = options.view || "perspective";
  const views = viewMode === "multi" ? [
    { name: "Front", yaw: 0, pitch: 0.05, dist: 4.2 },
    { name: "3/4 Perspective", yaw: 0.55, pitch: 0.15, dist: 4.2 },
    { name: "Side", yaw: Math.PI / 2, pitch: 0.05, dist: 4.2 }
  ] : [
    {
      name: viewMode,
      yaw: viewMode === "side" ? Math.PI / 2 : viewMode === "front" ? 0 : 0.55,
      pitch: viewMode === "perspective" ? 0.15 : 0.05,
      dist: 4.2
    }
  ];
  const cellW = 180;
  const cellH = 260;
  const marginX = 24;
  const marginY = 32;
  const timelineH = 48;
  const titleH = 40;
  const totalW = marginX * 2 + frameCount * cellW;
  const totalH = marginY * 2 + titleH + views.length * cellH + timelineH;
  const g = options.ctx2d || new SvgContext2D(totalW, totalH);
  const C2 = { ...DEFAULT_PALETTE };
  if (silhouette) {
    C2["--fig"] = "#00f0ff";
    C2["--figL"] = "#00f0ff";
    C2["--figR"] = "#00b4d8";
    C2["--view"] = "#0d1117";
  }
  g.fillStyle = C2["--view"] || "#111318";
  g.fillRect(0, 0, totalW, totalH);
  g.fillStyle = C2["--ink"] || "#e6edf3";
  g.font = "bold 15px sans-serif";
  g.textAlign = "left";
  const clipName = clip.name || "Clip";
  g.fillText(
    `ClipKit Contact Sheet — ${clipName} (${dur.toFixed(2)}s, v${clip.version || 1})`,
    marginX,
    26
  );
  g.font = "11px sans-serif";
  g.fillStyle = C2["--muted"] || "#8b949e";
  g.fillText(
    `Frames: ${frameCount} | Silhouette: ${silhouette ? "ON" : "OFF"} | Mode: ${viewMode}`,
    marginX + 420,
    26
  );
  const sampleTimes = [];
  const poses = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1);
    sampleTimes.push(t);
    poses.push(evalPose(rig, ctx, clip, t * dur));
  }
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const P of poses) {
    for (const p of P.pos) {
      if (p[0] < minX) minX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[2] < minZ) minZ = p[2];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
      if (p[2] > maxZ) maxZ = p[2];
    }
  }
  const r0 = poses[0].root;
  const r1 = poses[poses.length - 1].root;
  const rootTravelVec = [r1[0] - r0[0], r1[1] - r0[1], r1[2] - r0[2]];
  const rootTravelDist = Math.hypot(rootTravelVec[0], rootTravelVec[2]);
  const midP = poses[Math.floor(poses.length / 2)];
  const camTarget = [midP.root[0], 0.85, midP.root[2]];
  const I = ctx.idx;
  const yFloor = floorY({ res: { floorY: 0.03 } });
  for (let rowIdx = 0; rowIdx < views.length; rowIdx++) {
    const v = views[rowIdx];
    const rowY = marginY + titleH + rowIdx * cellH;
    const B = buildCamBasis(v.yaw, v.pitch, v.dist, camTarget);
    const KF = cellH / 2 / Math.tan(20 * Math.PI / 180);
    g.fillStyle = C2["--muted"] || "#8b949e";
    g.font = "10px sans-serif";
    g.textAlign = "left";
    g.fillText(v.name.toUpperCase(), marginX, rowY + 14);
    const distalJoints = [
      { name: "Head", idx: I.Head, color: "#f9e2af" },
      { name: "LeftHand", idx: I.LeftHand, color: "#89b4fa" },
      { name: "RightHand", idx: I.RightHand, color: "#fab387" },
      { name: "LeftFoot", idx: I.LeftFoot, color: "#a6e3a1" },
      { name: "RightFoot", idx: I.RightFoot, color: "#f38ba8" }
    ];
    for (let i = 0; i < frameCount; i++) {
      const colX = marginX + i * cellW;
      const t = sampleTimes[i];
      const P = poses[i];
      g.strokeStyle = C2["--grid"] || "#21262d";
      g.lineWidth = 1;
      g.strokeRect(colX, rowY, cellW, cellH);
      const prjFn = (p) => projectPoint(p, colX, rowY, cellW, cellH, KF, B);
      const fl0 = prjFn([-1.5 + midP.root[0], yFloor, midP.root[2]]);
      const fl1 = prjFn([1.5 + midP.root[0], yFloor, midP.root[2]]);
      if (fl0 && fl1) {
        g.strokeStyle = C2["--grid2"] || "#30363d";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(fl0[0], fl0[1]);
        g.lineTo(fl1[0], fl1[1]);
        g.stroke();
      }
      drawFigure(g, P, ctx, rig, 1, false, prjFn, C2, KF);
      if (rowIdx === 0) {
        g.fillStyle = C2["--ink"] || "#e6edf3";
        g.font = "bold 11px monospace";
        g.textAlign = "left";
        g.fillText(`#${i}  ${(t * dur).toFixed(2)}s`, colX + 8, rowY + 20);
        const activeWins = [];
        const tSec = t * dur;
        for (const [wn, wRange] of Object.entries(clip.windows || {})) {
          if (tSec >= wRange[0] - 1e-4 && tSec <= wRange[1] + 1e-4) {
            activeWins.push(wn);
          }
        }
        let tagY = rowY + 36;
        for (const tag of activeWins) {
          const col = winColor(tag);
          g.fillStyle = col;
          g.fillRect(colX + 8, tagY - 9, g.measureText(tag).width + 6, 12);
          g.fillStyle = "#000000";
          g.font = "9px monospace";
          g.fillText(tag.toUpperCase(), colX + 11, tagY);
          tagY += 15;
        }
      }
    }
    for (const dj of distalJoints) {
      if (dj.idx == null) continue;
      g.strokeStyle = dj.color;
      g.lineWidth = 1.6;
      g.setLineDash([3, 2]);
      g.beginPath();
      let hasStart = false;
      for (let i = 0; i < frameCount; i++) {
        const colX = marginX + i * cellW;
        const prjFn = (p) => projectPoint(p, colX, rowY, cellW, cellH, KF, B);
        const pt = prjFn(poses[i].pos[dj.idx]);
        if (pt) {
          if (hasStart) g.lineTo(pt[0], pt[1]);
          else {
            g.moveTo(pt[0], pt[1]);
            hasStart = true;
          }
        }
      }
      g.stroke();
      g.setLineDash([]);
    }
  }
  const tlY = totalH - marginY - timelineH + 6;
  const tlW = frameCount * cellW;
  g.fillStyle = "#161b22";
  g.fillRect(marginX, tlY, tlW, timelineH - 12);
  g.strokeStyle = C2["--grid"] || "#30363d";
  g.strokeRect(marginX, tlY, tlW, timelineH - 12);
  for (const [wn, wRange] of Object.entries(clip.windows || {})) {
    const x0 = marginX + wRange[0] / dur * tlW;
    const x1 = marginX + wRange[1] / dur * tlW;
    const col = winColor(wn);
    g.fillStyle = col;
    g.globalAlpha = 0.35;
    g.fillRect(x0, tlY, Math.max(x1 - x0, 2), timelineH - 12);
    g.globalAlpha = 1;
    g.fillStyle = col;
    g.font = "9px monospace";
    g.textAlign = "left";
    g.fillText(wn, x0 + 4, tlY + 16);
  }
  for (let i = 0; i < frameCount; i++) {
    const tx = marginX + i / (frameCount - 1) * tlW;
    g.strokeStyle = C2["--ink"] || "#e6edf3";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(tx, tlY + timelineH - 18);
    g.lineTo(tx, tlY + timelineH - 12);
    g.stroke();
    g.fillStyle = C2["--muted"] || "#8b949e";
    g.font = "9px monospace";
    g.textAlign = "center";
    g.fillText(`#${i}`, tx, tlY + timelineH - 4);
  }
  const metadata = {
    clip: clip.name || "unnamed",
    duration: dur,
    frameCount,
    camera: {
      mode: viewMode,
      target: camTarget,
      views
    },
    rootTravel: {
      vector: [
        Number(rootTravelVec[0].toFixed(4)),
        Number(rootTravelVec[1].toFixed(4)),
        Number(rootTravelVec[2].toFixed(4))
      ],
      distance: Number(rootTravelDist.toFixed(4))
    },
    bounds: {
      min: [Number(minX.toFixed(3)), Number(minY.toFixed(3)), Number(minZ.toFixed(3))],
      max: [Number(maxX.toFixed(3)), Number(maxY.toFixed(3)), Number(maxZ.toFixed(3))]
    },
    windows: clip.windows || {},
    frames: sampleTimes.map((t, idx) => {
      const tSec = Number((t * dur).toFixed(4));
      const activeWindows = [];
      for (const [wn, wRange] of Object.entries(clip.windows || {})) {
        if (tSec >= wRange[0] - 1e-4 && tSec <= wRange[1] + 1e-4) {
          activeWindows.push(wn);
        }
      }
      return {
        index: idx,
        t: Number(t.toFixed(4)),
        timeSec: tSec,
        root: [
          Number(poses[idx].root[0].toFixed(4)),
          Number(poses[idx].root[1].toFixed(4)),
          Number(poses[idx].root[2].toFixed(4))
        ],
        activeWindows
      };
    })
  };
  const svg = g.toSvg ? g.toSvg() : null;
  return {
    svg,
    metadata,
    width: totalW,
    height: totalH
  };
}
function runCheck(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error("Usage: clipkit check <clip-file> [--sheet <dir>] [--json]");
  }
  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: Unreadable JSON input: ${e.message}`);
    return 2;
  }
  const { motus: motus2 } = loadRigs();
  const ctx = makeCtx(motus2);
  const style = options.style || "stylized";
  const failOn = options.failOn || "fail";
  const schemaRes = validateSchema(clip, motus2);
  if (!schemaRes.valid) {
    const fails2 = schemaRes.errors;
    if (options.json) {
      console.log(
        formatDeterministicJson({
          valid: false,
          stage: "schema",
          failCount: fails2.length,
          warnCount: 0,
          issues: fails2.map((f) => f.issue)
        })
      );
    } else {
      console.error(`FAIL: Schema error(s) in ${inputPath}:`);
      for (const err of fails2) {
        console.error(`  - [${err.path}] ${err.message}`);
        if (err.hint) console.error(`    Hint: ${err.hint}`);
      }
    }
    return 1;
  }
  const valRes = validate(motus2, ctx, limitsData, clip, style, void 0, {
    part: options.part,
    parts: partsData
  });
  const fails = valRes.issues.filter((i) => i.level === "FAIL");
  const warns = valRes.issues.filter((i) => i.level === "WARN");
  const isPass = failOn === "warn" ? fails.length === 0 && warns.length === 0 : fails.length === 0;
  let sheetInfo = null;
  if (options.sheet) {
    const targetDir = options.sheet;
    const baseName = inputPath === "-" ? clip.name || "clip" : path.basename(inputPath, path.extname(inputPath));
    const sheetRes = renderContactSheet(motus2, ctx, clip, {
      frameCount: options.frames ? parseInt(options.frames, 10) : 8,
      silhouette: options.silhouette,
      view: options.view || "perspective"
    });
    try {
      const safeSvgPath = resolveSafeOutputPath(path.join(targetDir, `${baseName}_sheet.svg`), {
        force: options.force,
        allowOutside: options.allowOutside
      });
      const safeMetaPath = resolveSafeOutputPath(path.join(targetDir, `${baseName}_sheet.json`), {
        force: options.force,
        allowOutside: options.allowOutside
      });
      fs.writeFileSync(safeSvgPath, sheetRes.svg, "utf8");
      fs.writeFileSync(safeMetaPath, formatDeterministicJson(sheetRes.metadata), "utf8");
      sheetInfo = {
        imagePath: safeSvgPath,
        metadataPath: safeMetaPath,
        rootTravel: sheetRes.metadata.rootTravel,
        bounds: sheetRes.metadata.bounds
      };
    } catch (err) {
      console.error(`Warning: Failed to write contact sheet: ${err.message}`);
    }
  }
  let displayIssues = valRes.issues;
  if (options.maxIssues && options.maxIssues > 0) {
    displayIssues = displayIssues.slice(0, Number(options.maxIssues));
  }
  if (options.json) {
    console.log(
      formatDeterministicJson({
        valid: isPass,
        stage: "validation",
        style,
        failCount: fails.length,
        warnCount: warns.length,
        issueCount: valRes.issues.length,
        issues: displayIssues,
        sheet: sheetInfo
      })
    );
  } else {
    const status = isPass ? "PASS" : "FAIL";
    console.log(
      `${status}: ${inputPath} [${style}] — ${fails.length} failure(s), ${warns.length} warning(s)`
    );
    if (sheetInfo) {
      console.log(`Contact sheet: ${sheetInfo.imagePath}`);
    }
    if (displayIssues.length > 0) {
      console.log("\nIssues:");
      for (const iss of displayIssues) {
        const target = iss.channel || iss.joint || "";
        const tStr = iss.t != null ? `@${iss.t.toFixed(2)}s` : "";
        const loc = target || tStr ? ` (${[target, tStr].filter(Boolean).join(" ")})` : "";
        console.log(`  [${iss.level}] ${iss.rule}${loc}`);
        if (iss.hint) {
          console.log(`    Hint: ${iss.hint}`);
        }
      }
    }
  }
  return isPass ? 0 : 1;
}
function buildVrmaGlb(rig, ctx, clip) {
  const dur = clip.duration, frames = Math.ceil(dur * FPS - 1e-9), count = frames + 1;
  const times = new Float32Array(count);
  const poses = [];
  for (let f = 0; f < count; f++) {
    const t = Math.min(f / FPS, dur);
    times[f] = t;
    poses.push(evalPose(rig, ctx, clip, t));
  }
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
      rotation: [0, 0, 0, 1]
    };
    if (childrenMap[i].length) nd.children = childrenMap[i];
    nodes.push(nd);
    humanBones[bname] = { node: i };
  }
  const exprPresetMap = {};
  for (const en of exNames) {
    const nodeIdx = nodes.length;
    nodes.push({ name: "expr_" + en, translation: [0, 0, 0] });
    exprPresetMap[en] = { node: nodeIdx };
  }
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
  const timeAcc = pushFloat32(times, "SCALAR", [0], [times[count - 1]]);
  const hipsTr = new Float32Array(count * 3);
  for (let f = 0; f < count; f++) {
    const p0 = poses[f].pos[0];
    hipsTr[f * 3] = p0[0];
    hipsTr[f * 3 + 1] = p0[1];
    hipsTr[f * 3 + 2] = p0[2];
  }
  const hipsTrAcc = pushFloat32(hipsTr, "VEC3");
  samplers.push({ input: timeAcc, interpolation: "LINEAR", output: hipsTrAcc });
  animChannels.push({
    sampler: samplers.length - 1,
    target: { node: 0, path: "translation" }
  });
  for (let i = 0; i < ctx.n; i++) {
    const rot = new Float32Array(count * 4);
    for (let f = 0; f < count; f++) {
      const q = poses[f].local[i];
      rot[f * 4] = q[0];
      rot[f * 4 + 1] = q[1];
      rot[f * 4 + 2] = q[2];
      rot[f * 4 + 3] = q[3];
    }
    const rAcc = pushFloat32(rot, "VEC4");
    samplers.push({ input: timeAcc, interpolation: "LINEAR", output: rAcc });
    animChannels.push({
      sampler: samplers.length - 1,
      target: { node: i, path: "rotation" }
    });
  }
  for (const en of exNames) {
    const exTr = new Float32Array(count * 3);
    for (let f = 0; f < count; f++) {
      exTr[f * 3] = Math.min(1, Math.max(0, poses[f].expr[en] ?? 0));
    }
    const exAcc = pushFloat32(exTr, "VEC3");
    samplers.push({ input: timeAcc, interpolation: "LINEAR", output: exAcc });
    animChannels.push({
      sampler: samplers.length - 1,
      target: { node: exprPresetMap[en].node, path: "translation" }
    });
  }
  const vrmaExt = { specVersion: "1.0", humanoid: { humanBones } };
  if (exNames.length) vrmaExt.expressions = { preset: exprPresetMap };
  const rootNodes = [0, ...exNames.map((en) => exprPresetMap[en].node)];
  const gltf = {
    asset: { version: "2.0", generator: "ClipKit Web VRM 1.0 Edition" },
    extensionsUsed: ["VRMC_vrm_animation"],
    extensions: { VRMC_vrm_animation: vrmaExt },
    scene: 0,
    scenes: [{ nodes: rootNodes }],
    nodes,
    animations: [{ name: clip.name || "clip", samplers, channels: animChannels }],
    bufferViews,
    accessors,
    buffers: [{ byteLength: byteOffset }]
  };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltf));
  const jsonPad = (4 - jsonBytes.byteLength % 4) % 4;
  const binPad = (4 - byteOffset % 4) % 4;
  const totalLength = 12 + 8 + jsonBytes.byteLength + jsonPad + 8 + byteOffset + binPad;
  const glb = new ArrayBuffer(totalLength);
  const dv = new DataView(glb);
  const outU8 = new Uint8Array(glb);
  dv.setUint32(0, 1179937895, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, totalLength, true);
  let ptr = 12;
  dv.setUint32(ptr, jsonBytes.byteLength + jsonPad, true);
  dv.setUint32(ptr + 4, 1313821514, true);
  ptr += 8;
  outU8.set(jsonBytes, ptr);
  ptr += jsonBytes.byteLength;
  for (let i = 0; i < jsonPad; i++) outU8[ptr++] = 32;
  dv.setUint32(ptr, byteOffset + binPad, true);
  dv.setUint32(ptr + 4, 5130562, true);
  ptr += 8;
  for (const ch of chunks) {
    outU8.set(ch, ptr);
    ptr += ch.byteLength;
  }
  for (let i = 0; i < binPad; i++) outU8[ptr++] = 0;
  return new Blob([glb], { type: "model/gltf-binary" });
}
async function runExport(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error("Usage: clipkit export <clip-file> [--out <vrma-file>] [--force]");
  }
  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: Unreadable JSON input: ${e.message}`);
    return 2;
  }
  const { motus: motus2 } = loadRigs();
  const ctx = makeCtx(motus2);
  const blob = buildVrmaGlb(motus2, ctx, clip);
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let outPath = options.out;
  if (!outPath) {
    const baseName = inputPath === "-" ? clip.name || "clip" : path.basename(inputPath, path.extname(inputPath));
    outPath = `${baseName}.vrma`;
  }
  if (outPath === "-") {
    process.stdout.write(buffer);
    return 0;
  }
  try {
    const safeOut = resolveSafeOutputPath(outPath, {
      force: options.force,
      allowOutside: options.allowOutside
    });
    fs.writeFileSync(safeOut, buffer);
    console.log(`Exported .vrma (${buffer.length} bytes) to: ${safeOut}`);
    return 0;
  } catch (err) {
    console.error(`Export failed: ${err.message}`);
    return 2;
  }
}
function runRules(_args, options = {}) {
  const registered = defaultRuleRegistry.getRules();
  const ruleDescriptions = {
    "angular-speed": "Evaluates peak angular velocity (°/s) and angular acceleration (°/s²).",
    anatomy: "Checks anatomical limits on knee, elbow, and neck flexion.",
    floor: "Checks foot ground penetration and foot sliding during ground contact.",
    "root-motion": "Validates root displacement velocity and consistency with claims.",
    windows: "Verifies interval bounds and ordering of gameplay windows (hitbox, cancel).",
    loop: "Asserts initial and final poses match within tolerance for looping clips.",
    "channel-ranges": "Validates channel values stay within anatomical min/max limits.",
    vrm10: "Enforces VRM 1.0 humanoid specification (15 required bones, translation on hips only).",
    version: "Checks format_version and sequential changelog versioning."
  };
  const results = registered.map((r) => ({
    name: r.name,
    description: ruleDescriptions[r.name] || "Custom validation rule"
  }));
  if (options.json) {
    console.log(
      formatDeterministicJson({
        rules: results,
        ruleCodes: RULE_CODES,
        limits: limitsData
      })
    );
  } else {
    console.log(`Validation Rules (${results.length}):`);
    for (const r of results) {
      console.log(`  - ${r.name.padEnd(16)} : ${r.description}`);
    }
    console.log("\nConfigurable Style Limits:");
    for (const [st, lims] of Object.entries(limitsData.styles)) {
      console.log(
        `  * ${st}: speed_warn=${lims.ang_speed_warn}°/s, speed_fail=${lims.ang_speed_fail}°/s, loop_tol=${lims.loop_pose_diff_deg}°`
      );
    }
  }
  return 0;
}
function runSchema(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error("Usage: clipkit schema <clip-file> [--json]");
  }
  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    if (options.json) {
      console.log(
        formatDeterministicJson({
          valid: false,
          errors: [{ path: "$", message: `Invalid JSON: ${e.message}`, code: "JSON_SYNTAX_ERROR" }]
        })
      );
    } else {
      console.error(`Error: Invalid JSON syntax in ${inputPath}: ${e.message}`);
    }
    return 2;
  }
  const { motus: motus2 } = loadRigs();
  const res = validateSchema(clip, motus2);
  if (options.json) {
    console.log(formatDeterministicJson(res));
  } else {
    if (res.valid) {
      console.log(
        `PASS: Schema validation successful for ${inputPath} (duration: ${clip.duration}s)`
      );
    } else {
      console.error(`FAIL: Schema validation failed with ${res.errors.length} issue(s):`);
      for (const err of res.errors) {
        console.error(`  - [${err.path}] ${err.message}`);
        if (err.hint) console.error(`    Hint: ${err.hint}`);
      }
    }
  }
  return res.valid ? 0 : 1;
}
function runSheet(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error("Usage: clipkit sheet <clip-file> [--dir <dir>] [--frames <n>] [--silhouette]");
  }
  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: Unreadable JSON input: ${e.message}`);
    return 2;
  }
  const { motus: motus2 } = loadRigs();
  const ctx = makeCtx(motus2);
  const frameCount = options.frames ? parseInt(options.frames, 10) : 8;
  const sheetRes = renderContactSheet(motus2, ctx, clip, {
    frameCount,
    silhouette: options.silhouette,
    view: options.view || "perspective"
  });
  const baseName = inputPath === "-" ? clip.name || "clip" : path.basename(inputPath, path.extname(inputPath));
  const targetDir = options.dir || ".";
  const svgFilename = options.out || path.join(targetDir, `${baseName}_sheet.svg`);
  const metaFilename = path.join(targetDir, `${baseName}_sheet.json`);
  try {
    const safeSvgPath = resolveSafeOutputPath(svgFilename, {
      force: options.force,
      allowOutside: options.allowOutside
    });
    fs.writeFileSync(safeSvgPath, sheetRes.svg, "utf8");
    const safeMetaPath = resolveSafeOutputPath(metaFilename, {
      force: options.force,
      allowOutside: options.allowOutside
    });
    fs.writeFileSync(safeMetaPath, formatDeterministicJson(sheetRes.metadata), "utf8");
    if (options.json) {
      console.log(
        formatDeterministicJson({
          sheetPath: safeSvgPath,
          metadataPath: safeMetaPath,
          metadata: sheetRes.metadata
        })
      );
    } else {
      console.log(`Contact sheet generated successfully:`);
      console.log(`  SVG image : ${safeSvgPath}`);
      console.log(`  Metadata  : ${safeMetaPath}`);
    }
    return 0;
  } catch (err) {
    console.error(`Sheet generation failed: ${err.message}`);
    return 2;
  }
}
function runValidate(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error("Usage: clipkit validate <clip-file> [options]");
  }
  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: Unreadable JSON input: ${e.message}`);
    return 2;
  }
  const { motus: motus2 } = loadRigs();
  const ctx = makeCtx(motus2);
  const style = options.style || "stylized";
  const failOn = options.failOn || "fail";
  const res = validate(motus2, ctx, limitsData, clip, style, void 0, {
    part: options.part,
    parts: partsData
  });
  const fails = res.issues.filter((i) => i.level === "FAIL");
  const warns = res.issues.filter((i) => i.level === "WARN");
  const isPass = failOn === "warn" ? fails.length === 0 && warns.length === 0 : fails.length === 0;
  let displayIssues = res.issues;
  if (options.maxIssues && options.maxIssues > 0) {
    displayIssues = displayIssues.slice(0, Number(options.maxIssues));
  }
  if (options.json) {
    console.log(
      formatDeterministicJson({
        valid: isPass,
        style,
        part: options.part || null,
        failCount: fails.length,
        warnCount: warns.length,
        issueCount: res.issues.length,
        issues: displayIssues,
        lines: options.verbose ? res.lines : void 0
      })
    );
  } else {
    const status = isPass ? "PASS" : "FAIL";
    console.log(
      `${status}: ${inputPath} [${style}] — ${fails.length} failure(s), ${warns.length} warning(s)`
    );
    if (displayIssues.length > 0) {
      console.log("\nIssues:");
      for (const iss of displayIssues) {
        const target = iss.channel || iss.joint || "";
        const tStr = iss.t != null ? `@${iss.t.toFixed(2)}s` : "";
        const loc = target || tStr ? ` (${[target, tStr].filter(Boolean).join(" ")})` : "";
        console.log(`  [${iss.level}] ${iss.rule}${loc}`);
        if (iss.hint) {
          console.log(`    Hint: ${iss.hint}`);
        }
      }
      if (options.maxIssues && res.issues.length > options.maxIssues) {
        console.log(`  ... and ${res.issues.length - options.maxIssues} more issues (truncated)`);
      }
    }
    if (options.verbose) {
      console.log("\nReport lines:");
      for (const [lvl, text] of res.lines) {
        console.log(`  [${lvl}] ${text}`);
      }
    }
  }
  return isPass ? 0 : 1;
}
const CLI_VERSION = "1.0.0";
function parseArgs(rawArgs) {
  const args = [];
  const options = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--") {
      args.push(...rawArgs.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key.includes("=")) {
        const [k, v] = key.split("=");
        options[camelCase(k)] = v;
      } else if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-") && [
        "style",
        "part",
        "fail-on",
        "max-issues",
        "sheet",
        "dir",
        "out",
        "frames",
        "view"
      ].includes(key)) {
        options[camelCase(key)] = rawArgs[++i];
      } else {
        options[camelCase(key)] = true;
      }
    } else if (arg.startsWith("-") && arg.length > 1 && arg !== "-") {
      const flag = arg.slice(1);
      if (flag === "h") options.help = true;
      else if (flag === "v") options.version = true;
      else if (flag === "j") options.json = true;
      else options[flag] = true;
    } else {
      args.push(arg);
    }
  }
  return { args, options };
}
function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function printHelp(command = null) {
  if (command === "check") {
    console.log(`clipkit check <clip-file> [options]

Runs schema validation, physics checks, and optional contact sheet rendering in one call.

Options:
  --sheet <dir>            Directory to output annotated contact sheet SVG and metadata
  --style <style>          Validation style: realistic | stylized (default) | exaggerated
  --part <part>            Filter checks by body part: face | hands | arms | legs | torso
  --fail-on <level>        Fail threshold: 'fail' (default) or 'warn'
  --json                   Emit byte-identical JSON report
  --force                  Overwrite existing sheet files
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit check src/data/clips/slash.json --sheet ./out --json
`);
    return;
  }
  if (command === "validate") {
    console.log(`clipkit validate <clip-file> [options]

Evaluates animation clip against anatomical, kinematic, and VRM 1.0 validation rules.

Options:
  --style <style>          Validation style: realistic | stylized (default) | exaggerated
  --part <part>            Filter checks by body part: face | hands | arms | legs | torso
  --fail-on <level>        Fail threshold: 'fail' (default) or 'warn'
  --max-issues <n>         Limit output to first n issues
  --verbose                Print raw validation lines alongside structured issues
  --json                   Emit byte-identical JSON output

Example:
  clipkit validate src/data/clips/dodge.json --style realistic --json
`);
    return;
  }
  if (command === "schema") {
    console.log(`clipkit schema <clip-file> [options]

Performs syntax and schema validation before physics checks, reporting location and "did you mean" hints.

Options:
  --json                   Emit machine-readable JSON output

Example:
  clipkit schema src/data/clips/walk.json
`);
    return;
  }
  if (command === "channels") {
    console.log(`clipkit channels [options]

Lists all valid rig channels, anatomical limits, and body part assignments.

Options:
  --part <part>            Filter channels by part: face | hands | arms | legs | torso
  --json                   Emit channels as a JSON array

Example:
  clipkit channels --part arms
`);
    return;
  }
  if (command === "rules") {
    console.log(`clipkit rules [options]

Lists all registered validation rules, descriptions, and configurable style limits.

Options:
  --json                   Emit rule registry and limits as JSON

Example:
  clipkit rules --json
`);
    return;
  }
  if (command === "export") {
    console.log(`clipkit export <clip-file> [options]

Exports a ClipKit animation clip into standard binary .vrma (VRMC_vrm_animation-1.0).

Options:
  --out <file>             Output file path (default: <clip-name>.vrma, or '-' for stdout)
  --force                  Overwrite existing file
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit export src/data/clips/jump.json --out ./out/jump.vrma
`);
    return;
  }
  if (command === "sheet") {
    console.log(`clipkit sheet <clip-file> [options]

Renders a headless contact sheet with distal motion arcs, gameplay windows, and JSON metadata.

Options:
  --frames <n>             Number of sampled frames (4 to 16, default: 8)
  --view <mode>            Camera view: perspective (default) | front | side | multi
  --silhouette             Render high-contrast silhouette contrast mode
  --dir <dir>              Output directory for SVG and metadata sidecar
  --out <file>             Specific SVG output file path
  --json                   Output metadata JSON to stdout
  --force                  Overwrite existing files
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit sheet src/data/clips/slash.json --frames 10 --view multi --dir ./sheets
`);
    return;
  }
  console.log(`ClipKit Web Agent CLI v${CLI_VERSION}

Deterministic, machine-first command line interface for animation validation,
diagnostics, VRMA export, and contact sheet inspection.

Usage:
  clipkit <command> [arguments] [options]

Commands:
  check <clip>             Run schema, validation, and optional contact sheet together
  validate <clip>          Validate animation against kinematics, anatomy, and VRM 1.0
  schema <clip>            Validate clip schema and detect unknown channels with suggestions
  channels                 List available channels, ranges, and body parts
  rules                    List validation rules and style threshold limits
  export <clip>            Export clip to binary .vrma (VRMC_vrm_animation-1.0)
  sheet <clip>             Render headless annotated contact sheet (SVG + JSON sidecar)

Global Options:
  -h, --help               Show help for command
  -v, --version            Show CLI version
  --json                   Machine-readable deterministic JSON output

Run 'clipkit <command> --help' for details and examples on any command.
`);
}
async function main(argv = process.argv.slice(2)) {
  const { args, options } = parseArgs(argv);
  if (options.version) {
    console.log(`clipkit v${CLI_VERSION}`);
    return 0;
  }
  const command = args[0];
  const commandArgs = args.slice(1);
  if (options.help || !command) {
    printHelp(command);
    return 0;
  }
  try {
    switch (command) {
      case "check":
        return await runCheck(commandArgs, options);
      case "validate":
        return await runValidate(commandArgs, options);
      case "schema":
        return await runSchema(commandArgs, options);
      case "channels":
        return await runChannels(commandArgs, options);
      case "rules":
        return await runRules(commandArgs, options);
      case "export":
        return await runExport(commandArgs, options);
      case "sheet":
        return await runSheet(commandArgs, options);
      default:
        console.error(`Error: Unknown command '${command}'. Run 'clipkit --help' for usage.`);
        return 2;
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return 3;
  }
}
const exitCode = await main(process.argv.slice(2));
if (typeof exitCode === "number" && exitCode !== 0) {
  process.exit(exitCode);
}

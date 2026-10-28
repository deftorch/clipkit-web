#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const name$o = "MotusMan_v55";
const skeleton_scene = "res://characters/motus_man/MotusMan_v55.fbx";
const path_prefix = "Skeleton3D";
const frame = "model: +X kiri karakter, +Y atas, +Z depan (diverifikasi oleh tests/test_clip_rig.gd)";
const animated_bones = ["Hips", "Spine", "Spine1", "Spine2", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand", "RightShoulder", "RightArm", "RightForeArm", "RightHand", "Neck", "Head", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase", "LeftHandThumb1", "LeftHandThumb2", "LeftHandThumb3", "LeftHandIndex1", "LeftHandIndex2", "LeftHandIndex3", "LeftHandMiddle1", "LeftHandMiddle2", "LeftHandMiddle3", "LeftHandRing1", "LeftHandRing2", "LeftHandRing3", "LeftHandPinky1", "LeftHandPinky2", "LeftHandPinky3", "RightHandThumb1", "RightHandThumb2", "RightHandThumb3", "RightHandIndex1", "RightHandIndex2", "RightHandIndex3", "RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3", "RightHandRing1", "RightHandRing2", "RightHandRing3", "RightHandPinky1", "RightHandPinky2", "RightHandPinky3", "LeftEye", "RightEye", "Jaw"];
const channels$n = { "lean": { "type": "axis", "bones": { "Spine": 0.4, "Spine1": 0.3, "Spine2": 0.3 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-30, 60], "unit": "deg", "desc": "+ = membungkuk ke depan" }, "side_lean": { "type": "axis", "bones": { "Spine": 0.4, "Spine1": 0.3, "Spine2": 0.3 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-35, 35], "unit": "deg", "desc": "+ = miring ke kanan karakter" }, "twist": { "type": "axis", "bones": { "Spine": 0.4, "Spine1": 0.3, "Spine2": 0.3 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-60, 60], "unit": "deg", "desc": "+ = dada berputar ke kiri karakter" }, "hip_pitch": { "type": "axis", "bones": { "Hips": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-30, 45], "unit": "deg", "desc": "+ = panggul condong ke depan" }, "hip_twist": { "type": "axis", "bones": { "Hips": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-60, 60], "unit": "deg", "desc": "+ = panggul berputar ke kiri" }, "hip_roll": { "type": "axis", "bones": { "Hips": 1 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-25, 25], "unit": "deg", "desc": "+ = panggul miring ke kanan" }, "head_pitch": { "type": "axis", "bones": { "Neck": 0.4, "Head": 0.6 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-40, 45], "unit": "deg", "desc": "+ = kepala menunduk" }, "head_yaw": { "type": "axis", "bones": { "Neck": 0.4, "Head": 0.6 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-70, 70], "unit": "deg", "desc": "+ = menoleh ke kiri" }, "legL_swing": { "type": "axis", "bones": { "LeftUpLeg": 1 }, "axis": [1, 0, 0], "sign": -1, "default": 0, "range": [-45, 120], "unit": "deg", "desc": "+ = paha terangkat ke depan" }, "legL_abd": { "type": "axis", "bones": { "LeftUpLeg": 1 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-30, 60], "unit": "deg", "desc": "+ = paha membuka ke luar" }, "kneeL": { "type": "axis", "bones": { "LeftLeg": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-5, 150], "unit": "deg", "desc": "+ = lutut menekuk" }, "footL_pitch": { "type": "axis", "bones": { "LeftFoot": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-45, 60], "unit": "deg", "desc": "+ = ujung kaki turun" }, "elbowL": { "type": "axis", "bones": { "LeftForeArm": 1 }, "axis": [0, 1, 0], "sign": -1, "default": 10, "range": [-5, 150], "unit": "deg", "desc": "+ = siku menekuk" }, "legR_swing": { "type": "axis", "bones": { "RightUpLeg": 1 }, "axis": [1, 0, 0], "sign": -1, "default": 0, "range": [-45, 120], "unit": "deg", "desc": "+ = paha terangkat ke depan" }, "legR_abd": { "type": "axis", "bones": { "RightUpLeg": 1 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-30, 60], "unit": "deg", "desc": "+ = paha membuka ke luar" }, "kneeR": { "type": "axis", "bones": { "RightLeg": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-5, 150], "unit": "deg", "desc": "+ = lutut menekuk" }, "footR_pitch": { "type": "axis", "bones": { "RightFoot": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [-45, 60], "unit": "deg", "desc": "+ = ujung kaki turun" }, "elbowR": { "type": "axis", "bones": { "RightForeArm": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 10, "range": [-5, 150], "unit": "deg", "desc": "+ = siku menekuk" }, "hip_x": { "type": "pos", "bone": "Hips", "axis": [1, 0, 0], "default": 0, "range": [-1.5, 1.5], "unit": "m", "desc": "offset posisi panggul (frame model: X kiri, Y atas, Z depan)" }, "hip_y": { "type": "pos", "bone": "Hips", "axis": [0, 1, 0], "default": 0, "range": [-0.6, 0.5], "unit": "m", "desc": "offset posisi panggul (frame model: X kiri, Y atas, Z depan)" }, "hip_z": { "type": "pos", "bone": "Hips", "axis": [0, 0, 1], "default": 0, "range": [-1.5, 1.5], "unit": "m", "desc": "offset posisi panggul (frame model: X kiri, Y atas, Z depan)" }, "thumbL": { "type": "axis", "bones": { "LeftHandThumb1": 0.3, "LeftHandThumb2": 0.9, "LeftHandThumb3": 0.9 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = thumb left menekuk (kepal)" }, "indexL": { "type": "axis", "bones": { "LeftHandIndex1": 1, "LeftHandIndex2": 1.1, "LeftHandIndex3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = index left menekuk (kepal)" }, "middleL": { "type": "axis", "bones": { "LeftHandMiddle1": 1, "LeftHandMiddle2": 1.1, "LeftHandMiddle3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = middle left menekuk (kepal)" }, "ringL": { "type": "axis", "bones": { "LeftHandRing1": 1, "LeftHandRing2": 1.1, "LeftHandRing3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = ring left menekuk (kepal)" }, "littleL": { "type": "axis", "bones": { "LeftHandPinky1": 1, "LeftHandPinky2": 1.1, "LeftHandPinky3": 0.7 }, "axis": [0, 0, 1], "sign": -1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = little left menekuk (kepal)" }, "spreadL": { "type": "axis", "bones": { "LeftHandIndex1": -0.5, "LeftHandRing1": 0.5, "LeftHandPinky1": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-10, 30], "unit": "deg", "desc": "+ = jari tangan left merenggang" }, "thumbR": { "type": "axis", "bones": { "RightHandThumb1": 0.3, "RightHandThumb2": 0.9, "RightHandThumb3": 0.9 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = thumb right menekuk (kepal)" }, "indexR": { "type": "axis", "bones": { "RightHandIndex1": 1, "RightHandIndex2": 1.1, "RightHandIndex3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = index right menekuk (kepal)" }, "middleR": { "type": "axis", "bones": { "RightHandMiddle1": 1, "RightHandMiddle2": 1.1, "RightHandMiddle3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = middle right menekuk (kepal)" }, "ringR": { "type": "axis", "bones": { "RightHandRing1": 1, "RightHandRing2": 1.1, "RightHandRing3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = ring right menekuk (kepal)" }, "littleR": { "type": "axis", "bones": { "RightHandPinky1": 1, "RightHandPinky2": 1.1, "RightHandPinky3": 0.7 }, "axis": [0, 0, 1], "sign": 1, "default": 0, "range": [-20, 95], "unit": "deg", "desc": "+ = little right menekuk (kepal)" }, "spreadR": { "type": "axis", "bones": { "RightHandIndex1": -0.5, "RightHandRing1": 0.5, "RightHandPinky1": 1 }, "axis": [0, 1, 0], "sign": -1, "default": 0, "range": [-10, 30], "unit": "deg", "desc": "+ = jari tangan right merenggang" }, "eye_yaw": { "type": "axis", "bones": { "LeftEye": 1, "RightEye": 1 }, "axis": [0, 1, 0], "sign": 1, "default": 0, "range": [-35, 35], "unit": "deg", "desc": "+ = melirik ke kiri karakter" }, "eye_pitch": { "type": "axis", "bones": { "LeftEye": 1, "RightEye": 1 }, "axis": [1, 0, 0], "sign": -1, "default": 0, "range": [-30, 30], "unit": "deg", "desc": "+ = melirik ke atas" }, "jaw_open": { "type": "axis", "bones": { "Jaw": 1 }, "axis": [1, 0, 0], "sign": 1, "default": 0, "range": [0, 35], "unit": "deg", "desc": "+ = rahang terbuka" } };
const aims = { "armL": { "bone": "LeftArm", "child": "LeftForeArm", "lateral": [1, 0, 0], "default": { "elev": -75, "azim": 0, "roll": 0 }, "range": { "elev": [-95, 175], "azim": [-100, 140], "roll": [-120, 120] }, "desc": "elev: sudut di atas horizontal (-90 = tergantung); azim: 0 = ke samping, 90 = ke depan; roll: putar sekitar lengan" }, "armR": { "bone": "RightArm", "child": "RightForeArm", "lateral": [-1, 0, 0], "default": { "elev": -75, "azim": 0, "roll": 0 }, "range": { "elev": [-95, 175], "azim": [-100, 140], "roll": [-120, 120] }, "desc": "elev: sudut di atas horizontal (-90 = tergantung); azim: 0 = ke samping, 90 = ke depan; roll: putar sekitar lengan" } };
const rest$1 = { "parents": [-1, 0, 1, 2, 3, 4, 5, 6, 3, 8, 9, 10, 3, 12, 0, 14, 15, 16, 0, 18, 19, 20, 7, 22, 23, 7, 25, 26, 7, 28, 29, 7, 31, 32, 7, 34, 35, 11, 37, 38, 11, 40, 41, 11, 43, 44, 11, 46, 47, 11, 49, 50, 13, 13, 13], "offsets": [[0, 0.9675, -0.01057], [0, 0.10807, 891e-5], [0, 0.19205, -0.01352], [0, 0.13268, -0.01981], [0.03781, 0.1217, 738e-5], [0.13919, -0.02671, -0.06951], [0.30339, -1e-5, 0], [0.26976, 0, -1e-5], [-0.03781, 0.1217, 738e-5], [-0.13919, -0.02671, -0.06951], [-0.3034, -1e-5, 0], [-0.26975, 1e-5, -1e-5], [0, 0.1639, -0.02378], [0, 0.09096, 0.01897], [0.09009, -0.01451, 526e-5], [0.05211, -0.42231, -0.01271], [0.0286, -0.39602, -0.06271], [-8e-4, -0.10454, 0.16578], [-0.09009, -0.01451, 527e-5], [-0.05211, -0.42232, -0.01271], [-0.02859, -0.39602, -0.06271], [8e-4, -0.10454, 0.16578], [0.02, -4e-3, 0.026], [0.021, -15e-4, 0.021], [0.0224, -16e-4, 0.0224], [0.075, 0, 0.022], [0.04, 0, 0], [0.025, 0, 0], [0.078, 0, 7e-3], [0.045, 0, 0], [0.028, 0, 0], [0.074, 0, -8e-3], [0.042, 0, 0], [0.026, 0, 0], [0.068, 0, -0.022], [0.032, 0, 0], [0.02, 0, 0], [-0.02, -4e-3, 0.026], [-0.021, -15e-4, 0.021], [-0.0224, -16e-4, 0.0224], [-0.075, 0, 0.022], [-0.04, 0, 0], [-0.025, 0, 0], [-0.078, 0, 7e-3], [-0.045, 0, 0], [-0.028, 0, 0], [-0.074, 0, -8e-3], [-0.042, 0, 0], [-0.026, 0, 0], [-0.068, 0, -0.022], [-0.032, 0, 0], [-0.02, 0, 0], [0.032, 0.07, 0.08], [-0.032, 0.07, 0.08], [0, 0.02, 0.015]] };
const motus = {
  name: name$o,
  skeleton_scene,
  path_prefix,
  frame,
  animated_bones,
  channels: channels$n,
  aims,
  rest: rest$1
};
const name$n = "VRM1_Constraint_Twist_Sample";
const kind = "vrm1";
const humanoid = { "Hips": "hips", "Spine": "spine", "Spine1": "chest", "Spine2": "upperChest", "Neck": "neck", "Head": "head", "LeftShoulder": "leftShoulder", "LeftArm": "leftUpperArm", "LeftForeArm": "leftLowerArm", "LeftHand": "leftHand", "RightShoulder": "rightShoulder", "RightArm": "rightUpperArm", "RightForeArm": "rightLowerArm", "RightHand": "rightHand", "LeftUpLeg": "leftUpperLeg", "LeftLeg": "leftLowerLeg", "LeftFoot": "leftFoot", "LeftToeBase": "leftToes", "RightUpLeg": "rightUpperLeg", "RightLeg": "rightLowerLeg", "RightFoot": "rightFoot", "RightToeBase": "rightToes", "LeftHandThumb1": "leftThumbMetacarpal", "LeftHandThumb2": "leftThumbProximal", "LeftHandThumb3": "leftThumbDistal", "LeftHandIndex1": "leftIndexProximal", "LeftHandIndex2": "leftIndexIntermediate", "LeftHandIndex3": "leftIndexDistal", "LeftHandMiddle1": "leftMiddleProximal", "LeftHandMiddle2": "leftMiddleIntermediate", "LeftHandMiddle3": "leftMiddleDistal", "LeftHandRing1": "leftRingProximal", "LeftHandRing2": "leftRingIntermediate", "LeftHandRing3": "leftRingDistal", "LeftHandPinky1": "leftLittleProximal", "LeftHandPinky2": "leftLittleIntermediate", "LeftHandPinky3": "leftLittleDistal", "RightHandThumb1": "rightThumbMetacarpal", "RightHandThumb2": "rightThumbProximal", "RightHandThumb3": "rightThumbDistal", "RightHandIndex1": "rightIndexProximal", "RightHandIndex2": "rightIndexIntermediate", "RightHandIndex3": "rightIndexDistal", "RightHandMiddle1": "rightMiddleProximal", "RightHandMiddle2": "rightMiddleIntermediate", "RightHandMiddle3": "rightMiddleDistal", "RightHandRing1": "rightRingProximal", "RightHandRing2": "rightRingIntermediate", "RightHandRing3": "rightRingDistal", "RightHandPinky1": "rightLittleProximal", "RightHandPinky2": "rightLittleIntermediate", "RightHandPinky3": "rightLittleDistal", "LeftEye": "leftEye", "RightEye": "rightEye", "Jaw": "jaw" };
const rest = { "offsets": [[0, 0.90808, 358e-5], [0, 0.05207, 0.01252], [0, 0.11301, 305e-5], [0, 0.10764, -0.01465], [0.0224, 0.10569, -0.02997], [0.08616, -0.01226, 0], [0.21985, 0, 0], [0.21469, 0, -37e-5], [-0.0224, 0.10569, -0.02997], [-0.08616, -0.01226, 0], [-0.21985, 0, 0], [-0.21469, 0, 37e-5], [0, 0.13229, -0.03836], [0, 0.07317, 915e-5], [0.07716, -0.03977, -366e-5], [0, -0.35291, -739e-5], [0, -0.41474, -0.02494], [0, -0.06305, 0.11069], [-0.07716, -0.03977, -366e-5], [0, -0.35291, -739e-5], [0, -0.41474, -0.02494], [0, -0.06305, 0.11069], [0.01877, -375e-5, 0.0244], [0.01971, -141e-5, 0.01971], [0.02102, -15e-4, 0.02102], [0.07039, 0, 0.02065], [0.03754, 0, 0], [0.02346, 0, 0], [0.07321, 0, 657e-5], [0.04224, 0, 0], [0.02628, 0, 0], [0.06946, 0, -751e-5], [0.03942, 0, 0], [0.0244, 0, 0], [0.06382, 0, -0.02065], [0.03004, 0, 0], [0.01877, 0, 0], [-0.01877, -375e-5, 0.0244], [-0.01971, -141e-5, 0.01971], [-0.02102, -15e-4, 0.02102], [-0.07039, 0, 0.02065], [-0.03754, 0, 0], [-0.02346, 0, 0], [-0.07321, 0, 657e-5], [-0.04224, 0, 0], [-0.02628, 0, 0], [-0.06946, 0, -751e-5], [-0.03942, 0, 0], [-0.0244, 0, 0], [-0.06382, 0, -0.02065], [-0.03004, 0, 0], [-0.01877, 0, 0], [0.03004, 0.0657, 0.07509], [-0.03004, 0.0657, 0.07509], [0, 0.01877, 0.01408]] };
const scale = 0.9386;
const pos_scale = 0.9391;
const info = { "name": "VRM1_Constraint_Twist_Sample", "spec": "1.0", "nodes": 171, "hipsY": 0.9080763, "legLen": 0.7684779899116934, "scale": 0.9386, "posScale": 0.9391, "synth": [], "warns": [], "height": 1.386266881653605, "present": 22, "total": 22, "extraBones": 32, "license": "https://vrm.dev/licenses/1.0/", "droop": 4120740451177791e-19, "extraPresent": 0 };
const vrmSamplePatch = {
  name: name$n,
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
function writeOutputFile(targetPath, content, options = {}) {
  const safePath = resolveSafeOutputPath(targetPath, options);
  fs.writeFileSync(safePath, content, typeof content === "string" ? "utf8" : void 0);
  return safePath;
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
    let part2 = "torso";
    for (const [pName, pDef] of Object.entries(partsData)) {
      if (pDef.channels && pDef.channels.includes(name2)) {
        part2 = pName;
        break;
      }
    }
    if (partFilter && part2 !== partFilter) {
      continue;
    }
    results.push({
      name: name2,
      part: part2,
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
  SCHEMA_ERROR: "SCHEMA_ERROR",
  LAYER_NOT_FOUND: "LAYER_NOT_FOUND",
  LAYER_DURATION_CLIPPED: "LAYER_DURATION_CLIPPED",
  AIM_ADDITIVE_APPROX: "AIM_ADDITIVE_APPROX",
  CHANNEL_COLLISION: "CHANNEL_COLLISION",
  TORSO_OVERRIDE_CONFLICT: "TORSO_OVERRIDE_CONFLICT",
  WINDOW_COLLISION: "WINDOW_COLLISION",
  MOVE_COLLISION: "MOVE_COLLISION"
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
const FORMAT_VERSION = 2;
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
  if (clip.layers != null) {
    if (!Array.isArray(clip.layers)) {
      addError(
        "layers",
        "Layers must be an array of layer objects [{ ref, channels, mode, offset }]."
      );
    } else {
      for (let i = 0; i < clip.layers.length; i++) {
        const l = clip.layers[i];
        if (!l || typeof l !== "object" || Array.isArray(l)) {
          addError(`layers[${i}]`, "Layer must be an object.");
          continue;
        }
        if (!l.ref && !l.clip) {
          addError(
            `layers[${i}]`,
            'Layer must define a "ref" string or an embedded "clip" object.',
            'Provide "ref": "pose_name" or "ref": "clip_name"'
          );
        }
        if (l.mode != null && l.mode !== "override" && l.mode !== "additive") {
          addError(
            `layers[${i}].mode`,
            `Layer mode must be 'override' or 'additive' (received: '${l.mode}').`,
            'Use "override" or "additive"'
          );
        }
        if (l.channels != null && !Array.isArray(l.channels)) {
          addError(
            `layers[${i}].channels`,
            "Layer channels must be an array of channel patterns/globs.",
            'Provide an array like ["armR_*", "elbowR"]'
          );
        }
        if (l.offset != null && typeof l.offset !== "number") {
          addError(`layers[${i}].offset`, "Layer offset must be a number in seconds.");
        }
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
const HIERARCHY_LEVELS = {
  PELVIS: "pelvis",
  SPINE: "spine",
  SHOULDERS: "shoulders",
  WRISTS: "wrists",
  FINGERS: "fingers"
};
const DEFAULT_PROPAGATION_DELAYS = {
  [HIERARCHY_LEVELS.PELVIS]: 0,
  // t0 + 0ms (Root / Pelvis)
  [HIERARCHY_LEVELS.SPINE]: 0.03,
  // t0 + 30ms (Spine / Chest / Thighs)
  [HIERARCHY_LEVELS.SHOULDERS]: 0.06,
  // t0 + 60ms (Shoulders / Neck / Knees)
  [HIERARCHY_LEVELS.WRISTS]: 0.1,
  // t0 + 100ms (Elbows / Wrists / Feet)
  [HIERARCHY_LEVELS.FINGERS]: 0.13
  // t0 + 130ms (Fingers / Face)
};
const CHANNEL_HIERARCHY_MAP = {
  // Level 0: Pelvis & Root motion
  hip_x: HIERARCHY_LEVELS.PELVIS,
  hip_y: HIERARCHY_LEVELS.PELVIS,
  hip_z: HIERARCHY_LEVELS.PELVIS,
  hip_pitch: HIERARCHY_LEVELS.PELVIS,
  hip_twist: HIERARCHY_LEVELS.PELVIS,
  hip_roll: HIERARCHY_LEVELS.PELVIS,
  // Level 1: Spine, Torso & Thighs
  lean: HIERARCHY_LEVELS.SPINE,
  side_lean: HIERARCHY_LEVELS.SPINE,
  twist: HIERARCHY_LEVELS.SPINE,
  legL_swing: HIERARCHY_LEVELS.SPINE,
  legL_abd: HIERARCHY_LEVELS.SPINE,
  legR_swing: HIERARCHY_LEVELS.SPINE,
  legR_abd: HIERARCHY_LEVELS.SPINE,
  // Level 2: Shoulders, Upper Arms, Neck & Knees
  head_pitch: HIERARCHY_LEVELS.SHOULDERS,
  head_yaw: HIERARCHY_LEVELS.SHOULDERS,
  armL_elev: HIERARCHY_LEVELS.SHOULDERS,
  armL_azim: HIERARCHY_LEVELS.SHOULDERS,
  armL_roll: HIERARCHY_LEVELS.SHOULDERS,
  armR_elev: HIERARCHY_LEVELS.SHOULDERS,
  armR_azim: HIERARCHY_LEVELS.SHOULDERS,
  armR_roll: HIERARCHY_LEVELS.SHOULDERS,
  kneeL: HIERARCHY_LEVELS.SHOULDERS,
  kneeR: HIERARCHY_LEVELS.SHOULDERS,
  // Level 3: Forearms, Elbows, Wrists, Feet & Face
  elbowL: HIERARCHY_LEVELS.WRISTS,
  elbowR: HIERARCHY_LEVELS.WRISTS,
  footL_pitch: HIERARCHY_LEVELS.WRISTS,
  footR_pitch: HIERARCHY_LEVELS.WRISTS,
  jaw_open: HIERARCHY_LEVELS.WRISTS,
  eye_yaw: HIERARCHY_LEVELS.WRISTS,
  eye_pitch: HIERARCHY_LEVELS.WRISTS,
  // Level 4: Digits (Fingers)
  thumbL: HIERARCHY_LEVELS.FINGERS,
  indexL: HIERARCHY_LEVELS.FINGERS,
  middleL: HIERARCHY_LEVELS.FINGERS,
  ringL: HIERARCHY_LEVELS.FINGERS,
  littleL: HIERARCHY_LEVELS.FINGERS,
  spreadL: HIERARCHY_LEVELS.FINGERS,
  thumbR: HIERARCHY_LEVELS.FINGERS,
  indexR: HIERARCHY_LEVELS.FINGERS,
  middleR: HIERARCHY_LEVELS.FINGERS,
  ringR: HIERARCHY_LEVELS.FINGERS,
  littleR: HIERARCHY_LEVELS.FINGERS,
  spreadR: HIERARCHY_LEVELS.FINGERS
};
function calculateDampedOvershoot(amplitude, dt, damping = 12, frequency = 4) {
  if (dt < 0) return 0;
  return amplitude * Math.exp(-damping * dt) * Math.cos(2 * Math.PI * frequency * dt);
}
function applyHierarchicalDelays(clip, options = {}) {
  const delays = {
    ...DEFAULT_PROPAGATION_DELAYS,
    ...options.delays || {}
  };
  options.delayStep ?? 0.03;
  const channelMap = options.channelMap || CHANNEL_HIERARCHY_MAP;
  const dur = clip.duration || 1;
  const resultChannels = {};
  for (const [ch, kfs] of Object.entries(clip.channels || {})) {
    if (!Array.isArray(kfs) || kfs.length === 0) {
      resultChannels[ch] = kfs;
      continue;
    }
    const level = channelMap[ch] || HIERARCHY_LEVELS.PELVIS;
    let offset = delays[level] ?? 0;
    if (options.delayScale != null) {
      offset *= options.delayScale;
    }
    if (offset <= 1e-4) {
      resultChannels[ch] = JSON.parse(JSON.stringify(kfs));
      continue;
    }
    const shifted = [];
    const firstVal = kfs[0][1];
    shifted.push([0, firstVal, kfs[0][2] || "linear"]);
    const startIndex = Math.abs(kfs[0][0]) < 1e-4 ? 1 : 0;
    for (let i = startIndex; i < kfs.length; i++) {
      const origT = kfs[i][0];
      const val = kfs[i][1];
      const easing = kfs[i][2] || "inOutSine";
      const newT = Number(Math.min(dur, origT + offset).toFixed(4));
      if (newT > 1e-4) {
        shifted.push([newT, val, easing]);
      }
    }
    const lastKey = shifted[shifted.length - 1];
    if (lastKey[0] < dur - 1e-4) {
      const finalVal = kfs[kfs.length - 1][1];
      shifted.push([dur, finalVal, "linear"]);
    }
    const cleanKeys = [];
    for (const key of shifted) {
      if (cleanKeys.length > 0) {
        const prev = cleanKeys[cleanKeys.length - 1];
        if (Math.abs(prev[0] - key[0]) < 1e-4) {
          cleanKeys[cleanKeys.length - 1] = key;
          continue;
        }
      }
      cleanKeys.push(key);
    }
    resultChannels[ch] = cleanKeys;
  }
  return {
    ...clip,
    channels: resultChannels
  };
}
function applyDampedOvershoot(clip, options = {}) {
  const damping = options.damping ?? 12;
  const frequency = options.frequency ?? 4;
  const overshootScale = options.overshootScale ?? 0.08;
  const dur = clip.duration || 1;
  const targetLevels = options.targetLevels || /* @__PURE__ */ new Set([HIERARCHY_LEVELS.SHOULDERS, HIERARCHY_LEVELS.WRISTS, HIERARCHY_LEVELS.FINGERS]);
  const channelMap = options.channelMap || CHANNEL_HIERARCHY_MAP;
  const resultChannels = {};
  for (const [ch, kfs] of Object.entries(clip.channels || {})) {
    if (!Array.isArray(kfs) || kfs.length < 2) {
      resultChannels[ch] = kfs;
      continue;
    }
    const level = channelMap[ch] || HIERARCHY_LEVELS.PELVIS;
    if (!targetLevels.has(level)) {
      resultChannels[ch] = JSON.parse(JSON.stringify(kfs));
      continue;
    }
    const newKeys = [];
    for (let i = 0; i < kfs.length; i++) {
      const curKey = kfs[i];
      newKeys.push([...curKey]);
      const nextKey = kfs[i + 1];
      const prevKey = kfs[i - 1];
      if (prevKey && (!nextKey || nextKey[0] - curKey[0] >= 0.2)) {
        const incomingDelta = curKey[1] - prevKey[1];
        if (Math.abs(incomingDelta) >= 10) {
          const tStop = curKey[0];
          const availableSpan = nextKey ? nextKey[0] - tStop : dur - tStop;
          const settleDuration = Math.min(0.25, availableSpan * 0.8);
          if (settleDuration >= 0.08) {
            const peakOvershoot = incomingDelta * overshootScale;
            const tPeak = Number((tStop + settleDuration * 0.4).toFixed(4));
            const vPeak = Number((curKey[1] + peakOvershoot).toFixed(4));
            const tRebound = Number((tStop + settleDuration * 0.75).toFixed(4));
            const reboundOffset = calculateDampedOvershoot(
              peakOvershoot,
              settleDuration * 0.75,
              damping,
              frequency
            );
            const vRebound = Number((curKey[1] + reboundOffset).toFixed(4));
            if (tPeak < (nextKey ? nextKey[0] : dur)) {
              newKeys.push([tPeak, vPeak, "outQuad"]);
            }
            if (tRebound < (nextKey ? nextKey[0] : dur) && tRebound > tPeak) {
              newKeys.push([tRebound, vRebound, "inOutSine"]);
            }
          }
        }
      }
    }
    newKeys.sort((a, b) => a[0] - b[0]);
    const deduped = [];
    for (const key of newKeys) {
      if (deduped.length > 0) {
        const prev = deduped[deduped.length - 1];
        if (Math.abs(prev[0] - key[0]) < 1e-4) {
          continue;
        }
      }
      deduped.push(key);
    }
    resultChannels[ch] = deduped;
  }
  return {
    ...clip,
    channels: resultChannels
  };
}
function applyOverlap(clip, options = {}) {
  if (!clip || typeof clip !== "object") {
    throw new Error("Invalid clip supplied to applyOverlap");
  }
  let result = JSON.parse(JSON.stringify(clip));
  if (options.enablePropagation !== false) {
    result = applyHierarchicalDelays(result, options);
  }
  if (options.enableOvershoot !== false) {
    result = applyDampedOvershoot(result, options);
  }
  if (result.name) {
    result.name = options.name || `${result.name}_overlap`;
  }
  return result;
}
function matchChannelPattern(channelName, pattern) {
  if (pattern === "*" || pattern === channelName) return true;
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1);
    return channelName.startsWith(prefix);
  }
  return false;
}
function matchesAnyPattern(channelName, patterns) {
  if (!patterns || !patterns.length) return true;
  return patterns.some((pat) => matchChannelPattern(channelName, pat));
}
function composeClips(baseClip, layers = [], options = {}) {
  const warnings = [];
  const addWarn = (code, message, extra = {}) => {
    warnings.push({ code, message, ...extra });
  };
  const dur = baseClip.duration || 1;
  const FPS2 = options.FPS || 30;
  const frames = Math.ceil(dur * FPS2);
  const composite = {
    name: baseClip.name ? `${baseClip.name}_composite` : "composite",
    duration: dur,
    loop: !!baseClip.loop,
    format_version: baseClip.format_version || 1,
    channels: JSON.parse(JSON.stringify(baseClip.channels || {})),
    expressions: JSON.parse(JSON.stringify(baseClip.expressions || {})),
    windows: JSON.parse(JSON.stringify(baseClip.windows || {})),
    events: JSON.parse(JSON.stringify(baseClip.events || [])),
    claims: baseClip.claims ? JSON.parse(JSON.stringify(baseClip.claims)) : void 0,
    validate: baseClip.validate ? JSON.parse(JSON.stringify(baseClip.validate)) : void 0,
    move: baseClip.move ? [...baseClip.move] : void 0
  };
  const channelOwners = /* @__PURE__ */ new Map();
  for (const ch of Object.keys(composite.channels)) {
    channelOwners.set(ch, "base");
  }
  const TORSO_CHANNELS = /* @__PURE__ */ new Set([
    "lean",
    "side_lean",
    "twist",
    "hip_pitch",
    "hip_twist",
    "hip_roll",
    "head_pitch",
    "head_yaw"
  ]);
  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    let layerClip = layer.clip;
    if (!layerClip && layer.ref && options.resolveRef) {
      layerClip = options.resolveRef(layer.ref);
    }
    if (!layerClip) {
      addWarn(
        "LAYER_NOT_FOUND",
        `Layer [${layerIdx}] reference '${layer.ref}' could not be resolved.`
      );
      continue;
    }
    if (layer.effect === "overlap" || layer.effect?.kind === "overlap") {
      const effectOpts = typeof layer.effect === "object" ? layer.effect.options || {} : {};
      layerClip = applyOverlap(layerClip, effectOpts);
    }
    const layerDur = layerClip.duration || dur;
    const offset = layer.offset || 0;
    const mode = layer.mode || "override";
    const channelPatterns = layer.channels || ["*"];
    if (layerDur + offset > dur + 1e-4) {
      addWarn(
        "LAYER_DURATION_CLIPPED",
        `Layer [${layerIdx}] duration (${layerDur}s + ${offset}s offset) exceeds base clip duration (${dur}s) and was clipped.`
      );
    }
    const layerChannels = layerClip.channels || {};
    for (const [chName, layerKfs] of Object.entries(layerChannels)) {
      if (!matchesAnyPattern(chName, channelPatterns)) {
        continue;
      }
      const isAim = chName.includes("_elev") || chName.includes("_azim") || chName.includes("_roll");
      if (isAim && mode === "additive") {
        addWarn(
          "AIM_ADDITIVE_APPROX",
          `Additive composition on aim channel '${chName}' in layer [${layerIdx}] is an angular approximation. 'override' is recommended.`,
          { channel: chName }
        );
      }
      if (channelOwners.has(chName) && channelOwners.get(chName) !== "base") {
        addWarn(
          "CHANNEL_COLLISION",
          `Multiple layers write to channel '${chName}' (layer [${layerIdx}] and ${channelOwners.get(chName)}).`,
          { channel: chName }
        );
      }
      if (TORSO_CHANNELS.has(chName) && channelOwners.has(chName) && mode !== "additive") {
        addWarn(
          "TORSO_OVERRIDE_CONFLICT",
          `Shared torso channel '${chName}' in layer [${layerIdx}] uses 'override' mode instead of 'additive', which may distort balance.`,
          { channel: chName }
        );
      }
      channelOwners.set(chName, `layer_${layerIdx}`);
      if (mode === "override") {
        composite.channels[chName] = layerKfs.map(([t, val, easing]) => {
          const newT = Number((t + offset).toFixed(4));
          return easing ? [newT, val, easing] : [newT, val];
        }).filter(([t]) => t >= 0 && t <= dur + 1e-4);
      } else if (mode === "additive") {
        const baseKfs = composite.channels[chName] || [
          [0, 0],
          [dur, 0]
        ];
        const combinedKfs = [];
        for (let f = 0; f <= frames; f++) {
          const t = Math.min(f / FPS2, dur);
          const baseVal = sampleKeys(baseKfs, t);
          const layerT = t - offset;
          let layerVal = 0;
          if (layerT >= 0 && layerT <= layerDur) {
            layerVal = sampleKeys(layerKfs, layerT);
          } else if (layerT > layerDur && !layerClip.loop) {
            layerVal = sampleKeys(layerKfs, layerDur);
          }
          combinedKfs.push([Number(t.toFixed(4)), Number((baseVal + layerVal).toFixed(4))]);
        }
        composite.channels[chName] = combinedKfs;
      }
    }
    if (layerClip.expressions) {
      for (const [exprName, layerKfs] of Object.entries(layerClip.expressions)) {
        if (mode === "additive" && composite.expressions[exprName]) {
          const baseKfs = composite.expressions[exprName];
          const combinedKfs = [];
          for (let f = 0; f <= frames; f++) {
            const t = Math.min(f / FPS2, dur);
            const baseVal = sampleKeys(baseKfs, t);
            const layerT = t - offset;
            const layerVal = layerT >= 0 ? sampleKeys(layerKfs, layerT) : 0;
            const clamped = Math.max(0, Math.min(1, baseVal + layerVal));
            combinedKfs.push([Number(t.toFixed(4)), Number(clamped.toFixed(4))]);
          }
          composite.expressions[exprName] = combinedKfs;
        } else {
          composite.expressions[exprName] = layerKfs.map(([t, val, easing]) => {
            const newT = Number((t + offset).toFixed(4));
            const clamped = Math.max(0, Math.min(1, val));
            return easing ? [newT, clamped, easing] : [newT, clamped];
          });
        }
      }
    }
    if (layerClip.windows) {
      for (const [wn, [start, end]] of Object.entries(layerClip.windows)) {
        if (composite.windows[wn]) {
          addWarn(
            "WINDOW_COLLISION",
            `Window '${wn}' defined in both base and layer [${layerIdx}]. Base window retained.`
          );
        } else {
          composite.windows[wn] = [
            Number(Math.max(0, start + offset).toFixed(4)),
            Number(Math.min(dur, end + offset).toFixed(4))
          ];
        }
      }
    }
    if (layerClip.events) {
      for (const ev of layerClip.events) {
        const shiftedT = Number((ev.t + offset).toFixed(4));
        if (shiftedT >= 0 && shiftedT <= dur + 1e-4) {
          composite.events.push({
            ...ev,
            t: shiftedT
          });
        }
      }
    }
    if (layerClip.move) {
      if (composite.move) {
        addWarn(
          "MOVE_COLLISION",
          `Multiple sources define root motion 'move'. Base motion retained; layer [${layerIdx}] move ignored.`
        );
      } else {
        composite.move = [...layerClip.move];
      }
    }
  }
  composite.events.sort((a, b) => a.t - b.t);
  return {
    clip: composite,
    warnings
  };
}
function rootMotion(clip, t) {
  if (!clip.move) return [0, 0, 0];
  if (Array.isArray(clip.move) && typeof clip.move[0] === "number") {
    const u = Math.min(1, Math.max(0, t / (clip.duration || 1)));
    return [clip.move[0] * u, (clip.move[1] || 0) * u, (clip.move[2] || 0) * u];
  }
  const segs = Array.isArray(clip.move) ? clip.move : [clip.move];
  let tot = [0, 0, 0];
  for (const s of segs) {
    if (!s || typeof s !== "object" || !s.dir) continue;
    const d = vnorm(s.dir), t0 = s.t0 ?? 0, t1 = s.t1 ?? clip.duration;
    const u = Math.min(1, Math.max(0, (t - t0) / Math.max(t1 - t0, 1e-6)));
    tot = vadd(tot, vscale(d, (s.distance || 0) * ease(s.ease || "linear", u)));
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
function versionIssues(version2, changelog2, fv = 1) {
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
  if (!Array.isArray(changelog2) || !changelog2.length) {
    out.push(["WARN", `v${version2} tanpa changelog`]);
    issues.push(
      createIssue({
        level: "WARN",
        rule: RULE_CODES.CHANGELOG_INVALID,
        hint: `Provide a changelog array detailing changes for v${version2}.`
      })
    );
    return { lines: out, issues };
  }
  let ok = true;
  changelog2.forEach((e, i) => {
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
  } else if (changelog2[changelog2.length - 1].v !== version2) {
    const lastV = changelog2[changelog2.length - 1].v;
    out.push(["FAIL", `version ${version2} tetapi changelog berakhir di v${lastV}`]);
    issues.push(
      createIssue({
        level: "FAIL",
        rule: RULE_CODES.CHANGELOG_VERSION_MISMATCH,
        value: version2,
        limit: lastV,
        hint: `Clip version ${version2} does not match last changelog entry v${lastV}.`
      })
    );
  } else {
    out.push([
      "PASS",
      `versi v${version2}, format ${fv}, changelog ${changelog2.length} entri konsisten`
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
function validate$7(rig, ctx, limits, clip, style = "stylized", registry = defaultRuleRegistry, options = {}) {
  let targetClip = clip;
  const compIssues = [];
  const compLines = [];
  const layerReports = [];
  if (clip.layers && Array.isArray(clip.layers) && clip.layers.length > 0 && !options.isLayerPass) {
    for (let i = 0; i < clip.layers.length; i++) {
      const layer = clip.layers[i];
      let layerClip = layer.clip;
      if (!layerClip && layer.ref && options.resolveRef) {
        layerClip = options.resolveRef(layer.ref);
      }
      if (layerClip) {
        let layerPart = layer.part;
        if (!layerPart && options.parts && layerClip.channels) {
          const lChannels = Object.keys(layerClip.channels);
          for (const [pName, pDef] of Object.entries(options.parts)) {
            const set = new Set(pDef.channels || []);
            if (lChannels.some((ch) => set.has(ch))) {
              layerPart = pName;
              break;
            }
          }
        }
        const layerRes = validate$7(rig, ctx, limits, layerClip, style, registry, {
          ...options,
          part: layerPart,
          isLayerPass: true
        });
        layerReports.push({ layerIdx: i, part: layerPart, report: layerRes });
      }
    }
    const { clip: composed, warnings } = composeClips(clip, clip.layers, options);
    targetClip = composed;
    for (const w of warnings) {
      compLines.push(["WARN", `[${w.code}] ${w.message}`]);
      compIssues.push(
        createIssue({
          level: "WARN",
          rule: RULE_CODES[w.code] || w.code,
          channel: w.channel || null,
          hint: w.message
        })
      );
    }
  }
  const dur = targetClip.duration, frames = Math.ceil(dur * FPS - 1e-9);
  const tAt = (f) => Math.min(f / FPS, dur);
  const poses = [];
  for (let f = 0; f <= frames; f++) poses.push(evalPose(rig, ctx, targetClip, tAt(f)));
  const I = ctx.idx, restPos = restPositions(ctx);
  const floorY2 = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);
  const ruleContext = {
    rig,
    ctx,
    limits,
    clip: targetClip,
    style,
    poses,
    floorY: floorY2,
    frames,
    tAt,
    FPS
  };
  const lines = [...compLines];
  const issues = [...compIssues];
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
    issues: filteredIssues,
    compositeClip: targetClip,
    layerReports
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
  validate: validate$7,
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
function renderComparisonContactSheet(rig, ctx, clipA, clipB, options = {}) {
  const frameCount = Math.min(16, Math.max(4, options.frameCount || 8));
  const durA = clipA.duration || 1;
  const durB = clipB.duration || 1;
  const cellW = 180;
  const cellH = 260;
  const marginX = 24;
  const marginY = 32;
  const titleH = 40;
  const totalW = marginX * 2 + frameCount * cellW;
  const totalH = marginY * 2 + titleH + 2 * cellH;
  const g = options.ctx2d || new SvgContext2D(totalW, totalH);
  const C2 = { ...DEFAULT_PALETTE };
  g.fillStyle = C2["--view"] || "#111318";
  g.fillRect(0, 0, totalW, totalH);
  g.fillStyle = C2["--ink"] || "#e6edf3";
  g.font = "bold 15px sans-serif";
  g.textAlign = "left";
  g.fillText(
    `ClipKit Comparison — [A] ${clipA.name || "Clip A"} vs [B] ${clipB.name || "Clip B"}`,
    marginX,
    26
  );
  ctx.idx;
  const yFloor = floorY({ res: { floorY: 0.03 } });
  const KF = cellH / 2 / Math.tan(20 * Math.PI / 180);
  const rows = [
    {
      clip: clipA,
      label: `[A] ${clipA.name || "Clip A"} (${durA.toFixed(2)}s)`,
      dur: durA,
      arcColors: {
        Head: "#e0fbfc",
        LeftHand: "#00f0ff",
        RightHand: "#70d6ff",
        LeftFoot: "#3a86ff",
        RightFoot: "#8338ec"
      },
      tagColor: "#00f0ff"
    },
    {
      clip: clipB,
      label: `[B] ${clipB.name || "Clip B"} (${durB.toFixed(2)}s)`,
      dur: durB,
      arcColors: {
        Head: "#ffd166",
        LeftHand: "#ff007f",
        RightHand: "#ff9e00",
        LeftFoot: "#ef476f",
        RightFoot: "#e76f51"
      },
      tagColor: "#ff007f"
    }
  ];
  for (let rIdx = 0; rIdx < 2; rIdx++) {
    const row = rows[rIdx];
    const rowY = marginY + titleH + rIdx * cellH;
    g.fillStyle = row.tagColor;
    g.font = "bold 12px sans-serif";
    g.textAlign = "left";
    g.fillText(row.label, marginX, rowY + 16);
    const poses = [];
    for (let i = 0; i < frameCount; i++) {
      const t = i / (frameCount - 1);
      poses.push(evalPose(rig, ctx, row.clip, t * row.dur));
    }
    const midP = poses[Math.floor(poses.length / 2)];
    const camTarget = [midP.root[0], 0.85, midP.root[2]];
    const B = buildCamBasis(0.55, 0.15, 4.2, camTarget);
    for (let i = 0; i < frameCount; i++) {
      const colX = marginX + i * cellW;
      const t = i / (frameCount - 1);
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
      g.fillStyle = C2["--muted"] || "#8b949e";
      g.font = "10px monospace";
      g.textAlign = "left";
      g.fillText(`#${i} ${(t * row.dur).toFixed(2)}s`, colX + 8, rowY + 32);
    }
  }
  const svg = g.toSvg ? g.toSvg() : null;
  return {
    svg,
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
  const valRes = validate$7(motus2, ctx, limitsData, clip, style, void 0, {
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
const name$m = "dodge";
const vrm_spec$d = "1.0";
const format_version$d = 1;
const version$d = 2;
const changelog$d = [{ "v": 1, "catatan": "Versi awal pada rig lama." }, { "v": 2, "catatan": "Dikonversi penuh ke VRM 1.0 Humanoid + preset ekspresi surprised & blink saat melompat mundur 2.5 m." }];
const group$d = "locomotion";
const tags$d = ["vrm-1.0", "defense", "i-frame"];
const duration$m = 0.8;
const loop$d = false;
const channels$m = { "hip_y": [[0, 0], [0.12, -0.108, "outQuad"], [0.18, -8e-3, "outQuad"], [0.34, 0.16, "outQuad"], [0.5, -8e-3, "inQuad"], [0.6, -0.108, "outQuad"], [0.8, 0, "inOutSine"]], "hip_z": [[0, 0], [0.12, -0.107, "outQuad"], [0.18, -0.039, "outQuad"], [0.34, -0.2, "outQuad"], [0.5, -0.039, "inQuad"], [0.6, -0.107, "outQuad"], [0.8, 0, "inOutSine"]], "lean": [[0, 0], [0.12, 25, "outQuad"], [0.34, 10, "inOutSine"], [0.6, 25, "outQuad"], [0.8, 0, "outBack"]], "armL_elev": [[0, -75], [0.12, -60, "outQuad"], [0.34, -25, "outQuad"], [0.6, -60, "inOutSine"], [0.8, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.12, -60, "outQuad"], [0.34, -25, "outQuad"], [0.6, -60, "inOutSine"], [0.8, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.12, -35, "outQuad"], [0.34, 35, "outQuad"], [0.6, -30, "inOutSine"], [0.8, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.12, -35, "outQuad"], [0.34, 35, "outQuad"], [0.6, -30, "inOutSine"], [0.8, 0, "inOutSine"]], "elbowL": [[0, 10], [0.34, 50, "outQuad"], [0.8, 10, "inOutSine"]], "elbowR": [[0, 10], [0.34, 50, "outQuad"], [0.8, 10, "inOutSine"]], "legL_swing": [[0, 0], [0.12, 35, "outQuad"], [0.18, 10, "outQuad"], [0.34, 50, "outQuad"], [0.5, 10, "inQuad"], [0.6, 35, "outQuad"], [0.8, 0, "inOutSine"]], "legR_swing": [[0, 0], [0.12, 35, "outQuad"], [0.18, 10, "outQuad"], [0.34, 50, "outQuad"], [0.5, 10, "inQuad"], [0.6, 35, "outQuad"], [0.8, 0, "inOutSine"]], "kneeL": [[0, 3], [0.12, 55, "outQuad"], [0.18, 15, "outQuad"], [0.34, 90, "outQuad"], [0.5, 15, "inQuad"], [0.6, 55, "outQuad"], [0.8, 3, "inOutSine"]], "kneeR": [[0, 3], [0.12, 55, "outQuad"], [0.18, 15, "outQuad"], [0.34, 90, "outQuad"], [0.5, 15, "inQuad"], [0.6, 55, "outQuad"], [0.8, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.12, -20, "outQuad"], [0.18, -5, "outQuad"], [0.34, 20, "outQuad"], [0.5, -5, "inQuad"], [0.6, -20, "outQuad"], [0.8, 0, "inOutSine"]], "footR_pitch": [[0, 0], [0.12, -20, "outQuad"], [0.18, -5, "outQuad"], [0.34, 20, "outQuad"], [0.5, -5, "inQuad"], [0.6, -20, "outQuad"], [0.8, 0, "inOutSine"]] };
const expressions$f = { "surprised": [[0, 0], [0.15, 0.85, "outQuad"], [0.5, 0.2, "inOutSine"], [0.8, 0, "linear"]], "blink": [[0, 0], [0.08, 1, "outQuad"], [0.18, 0, "inQuad"]] };
const move$4 = { "dir": [0, 0, -1], "distance": 2.5, "t0": 0.18, "t1": 0.5, "ease": "linear" };
const windows$8 = { "inv": [0.1, 0.45], "cancel": [0.6, 0.8] };
const events$d = [{ "t": 0.18, "type": "sfx", "id": "whoosh" }, { "t": 0.5, "type": "vfx", "id": "dust" }];
const claims$d = { "distance": 2.5, "tolerance": 0.1, "duration": 0.8 };
const dodge = {
  name: name$m,
  vrm_spec: vrm_spec$d,
  format_version: format_version$d,
  version: version$d,
  changelog: changelog$d,
  group: group$d,
  tags: tags$d,
  duration: duration$m,
  loop: loop$d,
  channels: channels$m,
  expressions: expressions$f,
  move: move$4,
  windows: windows$8,
  events: events$d,
  claims: claims$d
};
const name$l = "hands_eyes_jaw";
const vrm_spec$c = "1.0";
const format_version$c = 1;
const version$c = 1;
const changelog$c = [{ "v": 1, "catatan": "Klip demo: kepalan, tunjuk, spread jari, lirikan mata, rahang terbuka." }];
const group$c = "locomotion";
const tags$c = ["demo", "jari", "mata", "rahang"];
const duration$l = 3;
const loop$c = true;
const channels$l = { "lean": [[0, 1], [1, 3.5, "inOutSine"], [2, 1, "inOutSine"]], "side_lean": [[0, -1.5], [1, 1.5, "inOutSine"], [2, -1.5, "inOutSine"]], "head_pitch": [[0, 0], [1, -3, "inOutSine"], [2, 0, "inOutSine"]], "head_yaw": [[0, -3], [1, 3, "inOutSine"], [2, -3, "inOutSine"]], "armL_elev": [[0, -76], [1, -73, "inOutSine"], [2, -76, "inOutSine"]], "armR_elev": [[0, -76], [1, -73, "inOutSine"], [2, -76, "inOutSine"]], "elbowL": [[0, 12], [1, 16, "inOutSine"], [2, 12, "inOutSine"]], "elbowR": [[0, 12], [1, 16, "inOutSine"], [2, 12, "inOutSine"]], "kneeL": [[0, 3], [2, 3]], "kneeR": [[0, 3], [2, 3]], "indexR": [[0, 0], [0.8, 0], [1, 0, "linear"], [3, 0, "linear"]], "middleR": [[0, 0], [0.8, 90, "outQuad"], [2.2, 90], [3, 0, "inOutSine"]], "ringR": [[0, 0], [0.8, 90, "outQuad"], [2.2, 90], [3, 0, "inOutSine"]], "littleR": [[0, 0], [0.8, 90, "outQuad"], [2.2, 90], [3, 0, "inOutSine"]], "thumbR": [[0, 0], [0.8, 70, "outQuad"], [2.2, 70], [3, 0, "inOutSine"]], "indexL": [[0, 0], [1.5, 80, "inOutSine"], [3, 0, "inOutSine"]], "middleL": [[0, 0], [1.5, 80, "inOutSine"], [3, 0, "inOutSine"]], "ringL": [[0, 0], [1.5, 80, "inOutSine"], [3, 0, "inOutSine"]], "littleL": [[0, 0], [1.5, 80, "inOutSine"], [3, 0, "inOutSine"]], "spreadR": [[0, 0], [2.2, 0], [2.6, 25, "outQuad"], [3, 0, "inOutSine"]], "eye_yaw": [[0, 0], [0.75, -25, "inOutSine"], [2.25, 25, "inOutSine"], [3, 0, "inOutSine"]], "eye_pitch": [[0, 0], [1.5, 12, "inOutSine"], [3, 0, "inOutSine"]], "jaw_open": [[0, 0], [0.4, 20, "outQuad"], [0.8, 0, "inQuad"], [1.2, 20, "outQuad"], [1.6, 0, "inQuad"], [3, 0]] };
const expressions$e = { "happy": [[0, 0], [1.5, 0.6, "inOutSine"], [3, 0, "inOutSine"]] };
const events$c = [{ "t": 1.5, "type": "sfx", "id": "demo_mid" }];
const claims$c = { "duration": 3 };
const hands_eyes_jaw = {
  name: name$l,
  vrm_spec: vrm_spec$c,
  format_version: format_version$c,
  version: version$c,
  changelog: changelog$c,
  group: group$c,
  tags: tags$c,
  duration: duration$l,
  loop: loop$c,
  channels: channels$l,
  expressions: expressions$e,
  events: events$c,
  claims: claims$c
};
const name$k = "idle";
const vrm_spec$b = "1.0";
const format_version$b = 1;
const version$b = 1;
const changelog$b = [{ "v": 1, "catatan": "Siklus berdiri bernapas halus VRM 1.0 dengan kedipan mata (blink) dan ekspresi relaxed." }];
const group$b = "locomotion";
const tags$b = ["vrm-1.0", "idle", "loop", "vtuber"];
const duration$k = 2;
const loop$b = true;
const channels$k = { "lean": [[0, 1], [1, 3.5, "inOutSine"], [2, 1, "inOutSine"]], "side_lean": [[0, -1.5], [1, 1.5, "inOutSine"], [2, -1.5, "inOutSine"]], "head_pitch": [[0, 0], [1, -3, "inOutSine"], [2, 0, "inOutSine"]], "head_yaw": [[0, -3], [1, 3, "inOutSine"], [2, -3, "inOutSine"]], "armL_elev": [[0, -76], [1, -73, "inOutSine"], [2, -76, "inOutSine"]], "armR_elev": [[0, -76], [1, -73, "inOutSine"], [2, -76, "inOutSine"]], "elbowL": [[0, 12], [1, 16, "inOutSine"], [2, 12, "inOutSine"]], "elbowR": [[0, 12], [1, 16, "inOutSine"], [2, 12, "inOutSine"]], "kneeL": [[0, 3], [2, 3]], "kneeR": [[0, 3], [2, 3]] };
const expressions$d = { "relaxed": [[0, 0.35], [1, 0.55, "inOutSine"], [2, 0.35, "inOutSine"]], "blink": [[0, 0], [0.85, 0, "hold"], [0.93, 1, "outQuad"], [1.05, 0, "inQuad"], [2, 0, "linear"]] };
const events$b = [{ "t": 1, "type": "breath", "id": "inhale_peak" }];
const claims$b = { "duration": 2, "tolerance": 0.1 };
const idle = {
  name: name$k,
  vrm_spec: vrm_spec$b,
  format_version: format_version$b,
  version: version$b,
  changelog: changelog$b,
  group: group$b,
  tags: tags$b,
  duration: duration$k,
  loop: loop$b,
  channels: channels$k,
  expressions: expressions$d,
  events: events$b,
  claims: claims$b
};
const name$j = "jump";
const vrm_spec$a = "1.0";
const format_version$a = 1;
const version$a = 1;
const changelog$a = [{ "v": 1, "catatan": "Lompatan maju 1.5 m dengan ancang-ancang jongkok, melayang di udara, dan mendarat stabil." }];
const group$a = "locomotion";
const tags$a = ["vrm-1.0", "jump", "air"];
const duration$j = 0.9;
const loop$a = false;
const channels$j = { "hip_y": [[0, 0], [0.18, -0.105, "outQuad"], [0.45, 0.34, "outQuad"], [0.72, -0.105, "inQuad"], [0.9, 0, "inOutSine"]], "lean": [[0, 0], [0.18, 22, "outQuad"], [0.45, -8, "inOutSine"], [0.72, 22, "outQuad"], [0.9, 0, "inOutSine"]], "head_pitch": [[0, 0], [0.18, 10, "outQuad"], [0.45, -15, "outQuad"], [0.72, 8, "inQuad"], [0.9, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.18, -80, "outQuad"], [0.45, 35, "outQuad"], [0.72, -55, "inQuad"], [0.9, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.18, -80, "outQuad"], [0.45, 35, "outQuad"], [0.72, -55, "inQuad"], [0.9, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.18, -25, "outQuad"], [0.45, 45, "outQuad"], [0.72, 15, "inQuad"], [0.9, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.18, -25, "outQuad"], [0.45, 45, "outQuad"], [0.72, 15, "inQuad"], [0.9, 0, "inOutSine"]], "elbowL": [[0, 10], [0.18, 35, "outQuad"], [0.45, 25, "outQuad"], [0.72, 45, "inQuad"], [0.9, 10, "inOutSine"]], "elbowR": [[0, 10], [0.18, 35, "outQuad"], [0.45, 25, "outQuad"], [0.72, 45, "inQuad"], [0.9, 10, "inOutSine"]], "legL_swing": [[0, 0], [0.18, 35, "outQuad"], [0.45, 45, "outQuad"], [0.72, 35, "inQuad"], [0.9, 0, "inOutSine"]], "legR_swing": [[0, 0], [0.18, 35, "outQuad"], [0.45, 20, "outQuad"], [0.72, 35, "inQuad"], [0.9, 0, "inOutSine"]], "kneeL": [[0, 3], [0.18, 55, "outQuad"], [0.45, 80, "outQuad"], [0.72, 55, "inQuad"], [0.9, 3, "inOutSine"]], "kneeR": [[0, 3], [0.18, 55, "outQuad"], [0.45, 45, "outQuad"], [0.72, 55, "inQuad"], [0.9, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.18, -20, "outQuad"], [0.45, 25, "outQuad"], [0.72, -20, "inQuad"], [0.9, 0, "inOutSine"]], "footR_pitch": [[0, 0], [0.18, -20, "outQuad"], [0.45, 25, "outQuad"], [0.72, -20, "inQuad"], [0.9, 0, "inOutSine"]] };
const expressions$c = { "surprised": [[0, 0], [0.2, 0.8, "outQuad"], [0.65, 0.2, "inQuad"], [0.9, 0, "linear"]], "aa": [[0, 0], [0.22, 0.6, "outQuad"], [0.6, 0, "inQuad"]], "blink": [[0, 0], [0.7, 0], [0.76, 1, "outQuad"], [0.86, 0, "inQuad"]] };
const move$3 = { "dir": [0, 0, 1], "distance": 1.5, "t0": 0.18, "t1": 0.72, "ease": "inOutSine" };
const events$a = [{ "t": 0.18, "type": "sfx", "id": "jump_launch" }, { "t": 0.72, "type": "vfx", "id": "land_dust" }];
const claims$a = { "distance": 1.5, "duration": 0.9, "tolerance": 0.1 };
const jump = {
  name: name$j,
  vrm_spec: vrm_spec$a,
  format_version: format_version$a,
  version: version$a,
  changelog: changelog$a,
  group: group$a,
  tags: tags$a,
  duration: duration$j,
  loop: loop$a,
  channels: channels$j,
  expressions: expressions$c,
  move: move$3,
  events: events$a,
  claims: claims$a
};
const name$i = "kick_axe";
const vrm_spec$9 = "1.0";
const format_version$9 = 1;
const version$9 = 1;
const changelog$9 = [{ "v": 1, "catatan": "Tendangan kapak melompat (Jumping Axe Kick / Kakato Otoshi): melompat maju sambil mengayunkan kaki kanan tinggi ke atas lalu menghantam lurus ke bawah." }];
const group$9 = "combat";
const tags$9 = ["vrm-1.0", "combat", "kick", "axe-kick", "air"];
const duration$i = 1;
const loop$9 = false;
const channels$i = { "hip_y": [[0, 0], [0.16, -0.05, "inOutSine"], [0.4, 0.22, "outSine"], [0.62, -0.02, "inSine"], [1, 0, "inOutSine"]], "lean": [[0, 0], [0.16, 14, "inOutSine"], [0.4, -12, "inOutSine"], [0.62, 22, "inOutSine"], [1, 0, "inOutSine"]], "twist": [[0, 0], [0.16, -18, "inOutSine"], [0.4, 15, "inOutSine"], [0.62, 22, "inOutSine"], [1, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.16, -15, "inOutSine"], [0.4, 18, "inOutSine"], [0.62, 15, "inOutSine"], [1, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.16, -60, "inOutSine"], [0.4, 20, "inOutSine"], [0.62, -45, "inOutSine"], [1, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.16, -60, "inOutSine"], [0.4, 10, "inOutSine"], [0.62, -55, "inOutSine"], [1, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.4, 45, "inOutSine"], [0.62, 20, "inOutSine"], [1, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.4, 30, "inOutSine"], [0.62, -25, "inOutSine"], [1, 0, "inOutSine"]], "elbowL": [[0, 10], [0.4, 65, "inOutSine"], [1, 10, "inOutSine"]], "elbowR": [[0, 10], [0.4, 55, "inOutSine"], [1, 10, "inOutSine"]], "legR_swing": [[0, 0], [0.16, 22, "inOutSine"], [0.4, 112, "inOutSine"], [0.62, 22, "inOutSine"], [1, 0, "inOutSine"]], "kneeR": [[0, 3], [0.16, 35, "inOutSine"], [0.4, 8, "inOutSine"], [0.62, 25, "inOutSine"], [1, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.16, -10, "inOutSine"], [0.4, -12, "inOutSine"], [0.62, -8, "inOutSine"], [1, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.16, 26, "inOutSine"], [0.4, 18, "inOutSine"], [0.62, 18, "inOutSine"], [1, 0, "inOutSine"]], "kneeL": [[0, 3], [0.16, 42, "inOutSine"], [0.4, 38, "inOutSine"], [0.62, 28, "inOutSine"], [1, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.16, -16, "inOutSine"], [0.4, 15, "inOutSine"], [0.62, -10, "inOutSine"], [1, 0, "inOutSine"]] };
const expressions$b = { "angry": [[0, 0], [0.2, 0.95, "outQuad"], [0.7, 0.95, "hold"], [1, 0, "inOutSine"]], "aa": [[0, 0], [0.35, 0.9, "outQuad"], [0.68, 0, "inQuad"]] };
const move$2 = { "dir": [0, 0, 1], "distance": 1.1, "t0": 0.16, "t1": 0.62, "ease": "inOutSine" };
const windows$7 = { "hitbox": [0.42, 0.6], "cancel": [0.72, 1] };
const events$9 = [{ "t": 0.18, "type": "sfx", "id": "axe_jump" }, { "t": 0.52, "type": "vfx", "id": "heavy_slam" }];
const claims$9 = { "distance": 1.1, "duration": 1, "tolerance": 0.1 };
const validate$6 = { "foot_slide": false };
const kick_axe = {
  name: name$i,
  vrm_spec: vrm_spec$9,
  format_version: format_version$9,
  version: version$9,
  changelog: changelog$9,
  group: group$9,
  tags: tags$9,
  duration: duration$i,
  loop: loop$9,
  channels: channels$i,
  expressions: expressions$b,
  move: move$2,
  windows: windows$7,
  events: events$9,
  claims: claims$9,
  validate: validate$6
};
const name$h = "kick_back";
const vrm_spec$8 = "1.0";
const format_version$8 = 1;
const version$8 = 1;
const changelog$8 = [{ "v": 1, "catatan": "Tendangan belakang berputar (Ushiro Geri / Spinning Back Kick): badan memutar dan mencondong ke depan sambil menghentakkan kaki kanan ke arah belakang." }];
const group$8 = "combat";
const tags$8 = ["vrm-1.0", "combat", "kick", "back-kick"];
const duration$h = 0.95;
const loop$8 = false;
const channels$h = { "hip_y": [[0, 0], [0.22, 0.01, "inOutSine"], [0.45, 0.03, "inOutSine"], [0.68, 0.01, "inOutSine"], [0.95, 0, "inOutSine"]], "hip_pitch": [[0, 0], [0.22, 10, "inOutSine"], [0.45, 22, "inOutSine"], [0.68, 10, "inOutSine"], [0.95, 0, "inOutSine"]], "lean": [[0, 0], [0.22, 12, "inOutSine"], [0.45, 28, "inOutSine"], [0.68, 12, "inOutSine"], [0.95, 0, "inOutSine"]], "twist": [[0, 0], [0.22, -25, "inOutSine"], [0.45, -45, "inOutSine"], [0.68, -20, "inOutSine"], [0.95, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.22, -30, "inOutSine"], [0.45, -55, "inOutSine"], [0.68, -25, "inOutSine"], [0.95, 0, "inOutSine"]], "head_yaw": [[0, 0], [0.22, -30, "inOutSine"], [0.45, -58, "inOutSine"], [0.68, -25, "inOutSine"], [0.95, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.45, -35, "inOutSine"], [0.95, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.45, -30, "inOutSine"], [0.95, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.45, 40, "inOutSine"], [0.95, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.45, 45, "inOutSine"], [0.95, 0, "inOutSine"]], "elbowL": [[0, 10], [0.45, 80, "inOutSine"], [0.95, 10, "inOutSine"]], "elbowR": [[0, 10], [0.45, 85, "inOutSine"], [0.95, 10, "inOutSine"]], "legR_swing": [[0, 0], [0.22, 25, "inOutSine"], [0.45, -42, "inOutSine"], [0.68, 15, "inOutSine"], [0.95, 0, "inOutSine"]], "legR_abd": [[0, 0], [0.22, 10, "inOutSine"], [0.45, 18, "inOutSine"], [0.68, 8, "inOutSine"], [0.95, 0, "inOutSine"]], "kneeR": [[0, 3], [0.22, 80, "inOutSine"], [0.45, 8, "inOutSine"], [0.68, 65, "inOutSine"], [0.95, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.45, -18, "inOutSine"], [0.95, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.22, 12, "inOutSine"], [0.45, 26, "inOutSine"], [0.68, 12, "inOutSine"], [0.95, 0, "inOutSine"]], "kneeL": [[0, 3], [0.22, 8, "inOutSine"], [0.45, 12, "inOutSine"], [0.68, 8, "inOutSine"], [0.95, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.45, -6, "inOutSine"], [0.95, 0, "inOutSine"]] };
const expressions$a = { "angry": [[0, 0], [0.22, 0.9, "outQuad"], [0.65, 0.9, "hold"], [0.95, 0, "inOutSine"]], "oh": [[0, 0], [0.38, 0.85, "outQuad"], [0.62, 0, "inQuad"]] };
const windows$6 = { "hitbox": [0.38, 0.52], "cancel": [0.68, 0.95] };
const events$8 = [{ "t": 0.38, "type": "sfx", "id": "back_kick_thrust" }];
const claims$8 = { "duration": 0.95, "tolerance": 0.1 };
const validate$5 = { "foot_slide": false };
const kick_back = {
  name: name$h,
  vrm_spec: vrm_spec$8,
  format_version: format_version$8,
  version: version$8,
  changelog: changelog$8,
  group: group$8,
  tags: tags$8,
  duration: duration$h,
  loop: loop$8,
  channels: channels$h,
  expressions: expressions$a,
  windows: windows$6,
  events: events$8,
  claims: claims$8,
  validate: validate$5
};
const name$g = "kick_front";
const vrm_spec$7 = "1.0";
const format_version$7 = 1;
const version$7 = 1;
const changelog$7 = [{ "v": 1, "catatan": "Tendangan depan cepat (Mae Geri / Front Snap Kick): angkat lutut (chamber), hentak lurus ke depan, lalu tarik kembali." }];
const group$7 = "combat";
const tags$7 = ["vrm-1.0", "combat", "kick", "front-kick"];
const duration$g = 0.85;
const loop$7 = false;
const channels$g = { "hip_y": [[0, 0], [0.2, 0.01, "inOutSine"], [0.38, 0.02, "inOutSine"], [0.58, 0.01, "inOutSine"], [0.85, 0, "inOutSine"]], "hip_z": [[0, 0], [0.2, 0.04, "inOutSine"], [0.38, 0.12, "outSine"], [0.58, 0.05, "inOutSine"], [0.85, 0, "inOutSine"]], "lean": [[0, 0], [0.2, 4, "inOutSine"], [0.38, -14, "outSine"], [0.58, -4, "inOutSine"], [0.85, 0, "inOutSine"]], "twist": [[0, 0], [0.2, -12, "inOutSine"], [0.38, 18, "outSine"], [0.85, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.2, -10, "inOutSine"], [0.38, 16, "outSine"], [0.85, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.2, -35, "inOutSine"], [0.38, -25, "outSine"], [0.85, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.2, -40, "inOutSine"], [0.38, -45, "outSine"], [0.85, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.2, 45, "inOutSine"], [0.38, 55, "outSine"], [0.85, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.2, 35, "inOutSine"], [0.38, -25, "outSine"], [0.85, 0, "inOutSine"]], "elbowL": [[0, 10], [0.2, 85, "inOutSine"], [0.38, 90, "outSine"], [0.85, 10, "inOutSine"]], "elbowR": [[0, 10], [0.2, 80, "inOutSine"], [0.38, 65, "outSine"], [0.85, 10, "inOutSine"]], "legR_swing": [[0, 0], [0.2, 58, "inOutSine"], [0.38, 88, "outSine"], [0.58, 45, "inOutSine"], [0.85, 0, "inOutSine"]], "kneeR": [[0, 3], [0.2, 92, "inOutSine"], [0.38, 8, "outSine"], [0.58, 78, "inOutSine"], [0.85, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.2, 15, "inOutSine"], [0.38, 28, "outSine"], [0.58, 10, "inOutSine"], [0.85, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.38, 12, "inOutSine"], [0.85, 0, "inOutSine"]], "kneeL": [[0, 3], [0.38, 14, "inOutSine"], [0.85, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.38, -4, "inOutSine"], [0.85, 0, "inOutSine"]] };
const expressions$9 = { "angry": [[0, 0], [0.2, 0.85, "outQuad"], [0.55, 0.85, "hold"], [0.85, 0, "inOutSine"]], "aa": [[0, 0], [0.3, 0.75, "outQuad"], [0.52, 0, "inQuad"]] };
const windows$5 = { "hitbox": [0.32, 0.45], "cancel": [0.6, 0.85] };
const events$7 = [{ "t": 0.32, "type": "sfx", "id": "front_kick_snap" }];
const claims$7 = { "duration": 0.85, "tolerance": 0.1 };
const validate$4 = { "foot_slide": false };
const kick_front = {
  name: name$g,
  vrm_spec: vrm_spec$7,
  format_version: format_version$7,
  version: version$7,
  changelog: changelog$7,
  group: group$7,
  tags: tags$7,
  duration: duration$g,
  loop: loop$7,
  channels: channels$g,
  expressions: expressions$9,
  windows: windows$5,
  events: events$7,
  claims: claims$7,
  validate: validate$4
};
const name$f = "kick_low";
const vrm_spec$6 = "1.0";
const format_version$6 = 1;
const version$6 = 1;
const changelog$6 = [{ "v": 1, "catatan": "Tendangan sapuan bawah (Low Kick / Leg Sweep) mengarah ke betis lawan dengan tumpuan kaki kiri merendah." }];
const group$6 = "combat";
const tags$6 = ["vrm-1.0", "combat", "kick", "low-kick"];
const duration$f = 0.8;
const loop$6 = false;
const channels$f = { "hip_y": [[0, 0], [0.2, -0.015, "inOutSine"], [0.4, -0.02, "inOutSine"], [0.8, 0, "inOutSine"]], "lean": [[0, 0], [0.2, 8, "inOutSine"], [0.4, 15, "inOutSine"], [0.8, 0, "inOutSine"]], "side_lean": [[0, 0], [0.2, 6, "inOutSine"], [0.4, -10, "inOutSine"], [0.8, 0, "inOutSine"]], "twist": [[0, 0], [0.2, -24, "inOutSine"], [0.4, 28, "inOutSine"], [0.8, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.2, -28, "inOutSine"], [0.4, 38, "inOutSine"], [0.8, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.2, -40, "inOutSine"], [0.4, -30, "inOutSine"], [0.8, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.2, -35, "inOutSine"], [0.4, -50, "inOutSine"], [0.8, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.4, 50, "inOutSine"], [0.8, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.2, 35, "inOutSine"], [0.4, -30, "inOutSine"], [0.8, 0, "inOutSine"]], "elbowL": [[0, 10], [0.4, 80, "inOutSine"], [0.8, 10, "inOutSine"]], "elbowR": [[0, 10], [0.4, 45, "inOutSine"], [0.8, 10, "inOutSine"]], "legR_swing": [[0, 0], [0.2, -12, "inOutSine"], [0.4, 42, "inOutSine"], [0.6, 18, "inOutSine"], [0.8, 0, "inOutSine"]], "legR_abd": [[0, 0], [0.2, 18, "inOutSine"], [0.4, 28, "inOutSine"], [0.6, 10, "inOutSine"], [0.8, 0, "inOutSine"]], "kneeR": [[0, 3], [0.2, 38, "inOutSine"], [0.4, 16, "inOutSine"], [0.6, 30, "inOutSine"], [0.8, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.4, 22, "inOutSine"], [0.8, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.2, 18, "inOutSine"], [0.4, 22, "inOutSine"], [0.8, 0, "inOutSine"]], "kneeL": [[0, 3], [0.2, 28, "inOutSine"], [0.4, 34, "inOutSine"], [0.8, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.2, -10, "inOutSine"], [0.4, -14, "inOutSine"], [0.8, 0, "inOutSine"]] };
const expressions$8 = { "angry": [[0, 0], [0.18, 0.75, "outQuad"], [0.55, 0.75, "hold"], [0.8, 0, "inOutSine"]], "ih": [[0, 0], [0.3, 0.65, "outQuad"], [0.52, 0, "inQuad"]] };
const windows$4 = { "hitbox": [0.32, 0.45], "cancel": [0.55, 0.8] };
const events$6 = [{ "t": 0.32, "type": "sfx", "id": "low_sweep" }];
const claims$6 = { "duration": 0.8, "tolerance": 0.1 };
const validate$3 = { "foot_slide": false };
const kick_low = {
  name: name$f,
  vrm_spec: vrm_spec$6,
  format_version: format_version$6,
  version: version$6,
  changelog: changelog$6,
  group: group$6,
  tags: tags$6,
  duration: duration$f,
  loop: loop$6,
  channels: channels$f,
  expressions: expressions$8,
  windows: windows$4,
  events: events$6,
  claims: claims$6,
  validate: validate$3
};
const name$e = "kick_roundhouse";
const vrm_spec$5 = "1.0";
const format_version$5 = 1;
const version$5 = 1;
const changelog$5 = [{ "v": 1, "catatan": "Tendangan sabit memutar (Mawashi Geri / Roundhouse Kick) dengan rotasi pinggul penuh dan ayunan kaki kanan menyamping." }];
const group$5 = "combat";
const tags$5 = ["vrm-1.0", "combat", "kick", "roundhouse"];
const duration$e = 0.95;
const loop$5 = false;
const channels$e = { "hip_y": [[0, 0], [0.22, 0.02, "inOutSine"], [0.44, 0.03, "inOutSine"], [0.65, 0.01, "inOutSine"], [0.95, 0, "inOutSine"]], "lean": [[0, 0], [0.22, 6, "inOutSine"], [0.44, -14, "inOutSine"], [0.65, -5, "inOutSine"], [0.95, 0, "inOutSine"]], "side_lean": [[0, 0], [0.22, -8, "inOutSine"], [0.44, -18, "inOutSine"], [0.65, -8, "inOutSine"], [0.95, 0, "inOutSine"]], "twist": [[0, 0], [0.22, -22, "inOutSine"], [0.44, 32, "inOutSine"], [0.65, 12, "inOutSine"], [0.95, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.22, -25, "inOutSine"], [0.44, 44, "inOutSine"], [0.65, 16, "inOutSine"], [0.95, 0, "inOutSine"]], "hip_roll": [[0, 0], [0.22, -6, "inOutSine"], [0.44, -12, "inOutSine"], [0.65, -4, "inOutSine"], [0.95, 0, "inOutSine"]], "head_yaw": [[0, 0], [0.22, 12, "inOutSine"], [0.44, -24, "inOutSine"], [0.95, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.22, -30, "inOutSine"], [0.44, -20, "inOutSine"], [0.95, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.22, -35, "inOutSine"], [0.44, -30, "inOutSine"], [0.95, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.22, 40, "inOutSine"], [0.44, 60, "inOutSine"], [0.95, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.22, 30, "inOutSine"], [0.44, -35, "inOutSine"], [0.95, 0, "inOutSine"]], "elbowL": [[0, 10], [0.22, 85, "inOutSine"], [0.44, 95, "inOutSine"], [0.95, 10, "inOutSine"]], "elbowR": [[0, 10], [0.22, 75, "inOutSine"], [0.44, 55, "inOutSine"], [0.95, 10, "inOutSine"]], "legR_swing": [[0, 0], [0.22, 45, "inOutSine"], [0.44, 78, "inOutSine"], [0.65, 40, "inOutSine"], [0.95, 0, "inOutSine"]], "legR_abd": [[0, 0], [0.22, 34, "inOutSine"], [0.44, 46, "inOutSine"], [0.65, 22, "inOutSine"], [0.95, 0, "inOutSine"]], "kneeR": [[0, 3], [0.22, 90, "inOutSine"], [0.44, 10, "inOutSine"], [0.65, 75, "inOutSine"], [0.95, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.22, 20, "inOutSine"], [0.44, 35, "inOutSine"], [0.65, 10, "inOutSine"], [0.95, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.44, 14, "inOutSine"], [0.95, 0, "inOutSine"]], "kneeL": [[0, 3], [0.44, 16, "inOutSine"], [0.95, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.44, -4, "inOutSine"], [0.95, 0, "inOutSine"]] };
const expressions$7 = { "angry": [[0, 0], [0.2, 0.9, "outQuad"], [0.6, 0.9, "hold"], [0.95, 0, "inOutSine"]], "oh": [[0, 0], [0.34, 0.8, "outQuad"], [0.58, 0, "inQuad"]] };
const move$1 = { "dir": [0, 0, 1], "distance": 0.35, "t0": 0.15, "t1": 0.45, "ease": "inOutSine" };
const windows$3 = { "hitbox": [0.36, 0.5], "cancel": [0.65, 0.95] };
const events$5 = [{ "t": 0.36, "type": "sfx", "id": "roundhouse_whoosh" }, { "t": 0.42, "type": "trail", "id": "leg_arc" }];
const claims$5 = { "distance": 0.35, "duration": 0.95, "tolerance": 0.1 };
const validate$2 = { "foot_slide": false };
const kick_roundhouse = {
  name: name$e,
  vrm_spec: vrm_spec$5,
  format_version: format_version$5,
  version: version$5,
  changelog: changelog$5,
  group: group$5,
  tags: tags$5,
  duration: duration$e,
  loop: loop$5,
  channels: channels$e,
  expressions: expressions$7,
  move: move$1,
  windows: windows$3,
  events: events$5,
  claims: claims$5,
  validate: validate$2
};
const name$d = "kick_side";
const vrm_spec$4 = "1.0";
const format_version$4 = 1;
const version$4 = 1;
const changelog$4 = [{ "v": 1, "catatan": "Tendangan samping lurus (Yoko Geri / Side Thrust Kick) dengan bukaan abduksi paha tinggi dan kemiringan torso penyeimbang." }];
const group$4 = "combat";
const tags$4 = ["vrm-1.0", "combat", "kick", "side-kick"];
const duration$d = 0.9;
const loop$4 = false;
const channels$d = { "hip_y": [[0, 0], [0.22, 0.02, "inOutSine"], [0.42, 0.04, "inOutSine"], [0.62, 0.02, "inOutSine"], [0.9, 0, "inOutSine"]], "side_lean": [[0, 0], [0.22, -16, "inOutSine"], [0.42, -28, "inOutSine"], [0.62, -14, "inOutSine"], [0.9, 0, "inOutSine"]], "twist": [[0, 0], [0.22, -15, "inOutSine"], [0.42, -26, "inOutSine"], [0.62, -12, "inOutSine"], [0.9, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.22, 32, "inOutSine"], [0.42, 50, "inOutSine"], [0.62, 24, "inOutSine"], [0.9, 0, "inOutSine"]], "hip_roll": [[0, 0], [0.22, -6, "inOutSine"], [0.42, -12, "inOutSine"], [0.62, -5, "inOutSine"], [0.9, 0, "inOutSine"]], "head_yaw": [[0, 0], [0.22, -18, "inOutSine"], [0.42, -35, "inOutSine"], [0.62, -15, "inOutSine"], [0.9, 0, "inOutSine"]], "armL_elev": [[0, -75], [0.22, -35, "inOutSine"], [0.42, -30, "inOutSine"], [0.9, -75, "inOutSine"]], "armR_elev": [[0, -75], [0.22, -30, "inOutSine"], [0.42, -15, "inOutSine"], [0.9, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.42, 45, "inOutSine"], [0.9, 0, "inOutSine"]], "armR_azim": [[0, 0], [0.42, 30, "inOutSine"], [0.9, 0, "inOutSine"]], "elbowL": [[0, 10], [0.42, 85, "inOutSine"], [0.9, 10, "inOutSine"]], "elbowR": [[0, 10], [0.42, 75, "inOutSine"], [0.9, 10, "inOutSine"]], "legR_swing": [[0, 0], [0.22, 38, "inOutSine"], [0.42, 26, "inOutSine"], [0.62, 30, "inOutSine"], [0.9, 0, "inOutSine"]], "legR_abd": [[0, 0], [0.22, 25, "inOutSine"], [0.42, 56, "inOutSine"], [0.62, 28, "inOutSine"], [0.9, 0, "inOutSine"]], "kneeR": [[0, 3], [0.22, 92, "inOutSine"], [0.42, 6, "inOutSine"], [0.62, 72, "inOutSine"], [0.9, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.22, -10, "inOutSine"], [0.42, -18, "inOutSine"], [0.62, -8, "inOutSine"], [0.9, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.42, 10, "inOutSine"], [0.9, 0, "inOutSine"]], "kneeL": [[0, 3], [0.42, 12, "inOutSine"], [0.9, 3, "inOutSine"]] };
const expressions$6 = { "angry": [[0, 0], [0.2, 0.85, "outQuad"], [0.6, 0.85, "hold"], [0.9, 0, "inOutSine"]], "ee": [[0, 0], [0.32, 0.75, "outQuad"], [0.55, 0, "inQuad"]] };
const windows$2 = { "hitbox": [0.35, 0.48], "cancel": [0.62, 0.9] };
const events$4 = [{ "t": 0.35, "type": "sfx", "id": "side_kick_thrust" }];
const claims$4 = { "duration": 0.9, "tolerance": 0.1 };
const validate$1 = { "foot_slide": false };
const kick_side = {
  name: name$d,
  vrm_spec: vrm_spec$4,
  format_version: format_version$4,
  version: version$4,
  changelog: changelog$4,
  group: group$4,
  tags: tags$4,
  duration: duration$d,
  loop: loop$4,
  channels: channels$d,
  expressions: expressions$6,
  windows: windows$2,
  events: events$4,
  claims: claims$4,
  validate: validate$1
};
const name$c = "parry";
const vrm_spec$3 = "1.0";
const format_version$3 = 1;
const version$3 = 3;
const changelog$3 = [{ "v": 1, "catatan": "Versi awal." }, { "v": 2, "catatan": "Perbaikan lipatan siku." }, { "v": 3, "catatan": "Standar VRM 1.0: blok silang di depan dada (upperChest/rightUpperArm/rightLowerArm) dengan ekspresi fokus." }];
const group$3 = "combat";
const tags$3 = ["vrm-1.0", "defense", "parry"];
const duration$c = 0.6;
const loop$3 = false;
const channels$c = { "lean": [[0, 0], [0.04, 3, "outQuad"], [0.16, -10, "outQuad"], [0.34, -6, "inOutSine"], [0.6, 0, "inOutSine"]], "twist": [[0, 0], [0.16, 15, "outQuad"], [0.34, 5, "inOutSine"], [0.6, 0, "inOutSine"]], "armR_elev": [[0, -75], [0.04, -85, "outQuad"], [0.16, -10, "outQuad"], [0.34, -10, "inOutSine"], [0.6, -75, "inOutSine"]], "armR_azim": [[0, 0], [0.04, -10, "outQuad"], [0.16, 55, "outQuad"], [0.34, 55, "inOutSine"], [0.6, 0, "inOutSine"]], "elbowR": [[0, 10], [0.04, 10, "outQuad"], [0.16, 95, "outQuad"], [0.34, 95, "inOutSine"], [0.6, 10, "inOutSine"]], "armL_elev": [[0, -75], [0.16, -20, "outQuad"], [0.6, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.16, 50, "outQuad"], [0.6, 0, "inOutSine"]], "elbowL": [[0, 10], [0.16, 80, "outQuad"], [0.6, 10, "inOutSine"]], "hip_y": [[0, 0], [0.16, -0.039, "outQuad"], [0.6, 0, "inOutSine"]], "hip_z": [[0, 0], [0.16, -0.042, "outQuad"], [0.6, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.16, 20, "outQuad"], [0.6, 0, "inOutSine"]], "legR_swing": [[0, 0], [0.16, 20, "outQuad"], [0.6, 0, "inOutSine"]], "kneeL": [[0, 3], [0.16, 35, "outQuad"], [0.6, 3, "inOutSine"]], "kneeR": [[0, 3], [0.16, 35, "outQuad"], [0.6, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.16, -15, "outQuad"], [0.6, 0, "inOutSine"]], "footR_pitch": [[0, 0], [0.16, -15, "outQuad"], [0.6, 0, "inOutSine"]] };
const expressions$5 = { "angry": [[0, 0], [0.14, 0.65, "outQuad"], [0.34, 0.65, "hold"], [0.6, 0, "inOutSine"]] };
const windows$1 = { "parry": [0.16, 0.32], "cancel": [0.42, 0.6] };
const events$3 = [{ "t": 0.16, "type": "sfx", "id": "clang_ready" }];
const claims$3 = { "duration": 0.6, "tolerance": 0.1 };
const parry = {
  name: name$c,
  vrm_spec: vrm_spec$3,
  format_version: format_version$3,
  version: version$3,
  changelog: changelog$3,
  group: group$3,
  tags: tags$3,
  duration: duration$c,
  loop: loop$3,
  channels: channels$c,
  expressions: expressions$5,
  windows: windows$1,
  events: events$3,
  claims: claims$3
};
const name$b = "slash";
const vrm_spec$2 = "1.0";
const format_version$2 = 1;
const version$2 = 2;
const changelog$2 = [{ "v": 1, "catatan": "Versi awal pada rig lama." }, { "v": 2, "catatan": "Disesuaikan ke rig VRM 1.0 dengan preset ekspresi angry dan vokal aa saat menebas." }];
const group$2 = "combat";
const tags$2 = ["vrm-1.0", "attack"];
const duration$b = 0.9;
const loop$2 = false;
const channels$b = { "twist": [[0, 0], [0.25, -35, "inOutSine"], [0.45, 35, "inQuad"], [0.9, 0, "inOutSine"]], "hip_twist": [[0, 0], [0.25, -28, "inOutSine"], [0.45, 32, "inQuad"], [0.9, 0, "inOutSine"]], "lean": [[0, 0], [0.25, -8, "inOutSine"], [0.45, 22, "inQuad"], [0.9, 0, "inOutSine"]], "head_yaw": [[0, 0], [0.25, 10, "inOutSine"], [0.45, -15, "inQuad"], [0.9, 0, "inOutSine"]], "armR_elev": [[0, -75], [0.25, 45, "outQuad"], [0.45, -10, "inQuad"], [0.9, -75, "inOutSine"]], "armR_azim": [[0, 0], [0.25, -30, "outQuad"], [0.45, 80, "inQuad"], [0.9, 0, "inOutSine"]], "elbowR": [[0, 10], [0.25, 90, "outQuad"], [0.45, 15, "inQuad"], [0.9, 10, "inOutSine"]], "armL_elev": [[0, -75], [0.25, -40, "outQuad"], [0.45, -60, "inQuad"], [0.9, -75, "inOutSine"]], "armL_azim": [[0, 0], [0.25, 40, "outQuad"], [0.45, -20, "inQuad"], [0.9, 0, "inOutSine"]], "elbowL": [[0, 10], [0.25, 70, "outQuad"], [0.9, 10, "inOutSine"]], "hip_y": [[0, 0], [0.15, -0.01, "outQuad"], [0.3, -0.05, "inOutSine"], [0.45, -0.112, "inQuad"], [0.9, 0, "inOutSine"]], "hip_z": [[0, 0], [0.15, 0.05, "outQuad"], [0.3, 0.25, "inOutSine"], [0.45, 0.414, "inQuad"], [0.9, 0, "inOutSine"]], "legL_swing": [[0, 0], [0.15, 5, "outQuad"], [0.3, 40, "inOutSine"], [0.45, 33, "inQuad"], [0.9, 0, "inOutSine"]], "kneeL": [[0, 3], [0.15, 20, "outQuad"], [0.3, 70, "inOutSine"], [0.45, 60, "inQuad"], [0.9, 3, "inOutSine"]], "footL_pitch": [[0, 0], [0.3, -20, "inOutSine"], [0.45, -27, "inQuad"], [0.9, 0, "inOutSine"]], "legR_swing": [[0, 0], [0.15, -5, "outQuad"], [0.3, -22, "inOutSine"], [0.45, -30, "inQuad"], [0.9, 0, "inOutSine"]], "kneeR": [[0, 3], [0.3, 3, "inOutSine"], [0.45, 0, "inQuad"], [0.9, 3, "inOutSine"]], "footR_pitch": [[0, 0], [0.45, -30, "inQuad"], [0.9, 0, "inOutSine"]] };
const expressions$4 = { "angry": [[0, 0], [0.25, 0.9, "outQuad"], [0.65, 0.9, "hold"], [0.9, 0, "inOutSine"]], "aa": [[0, 0], [0.32, 0], [0.38, 0.8, "outQuad"], [0.55, 0, "inQuad"]] };
const windows = { "hitbox": [0.36, 0.47], "cancel": [0.6, 0.9] };
const events$2 = [{ "t": 0.32, "type": "sfx", "id": "swoosh" }, { "t": 0.4, "type": "trail", "id": "blade_on" }, { "t": 0.5, "type": "trail", "id": "blade_off" }];
const claims$2 = { "duration": 0.9, "tolerance": 0.1 };
const slash = {
  name: name$b,
  vrm_spec: vrm_spec$2,
  format_version: format_version$2,
  version: version$2,
  changelog: changelog$2,
  group: group$2,
  tags: tags$2,
  duration: duration$b,
  loop: loop$2,
  channels: channels$b,
  expressions: expressions$4,
  windows,
  events: events$2,
  claims: claims$2
};
const name$a = "walk";
const vrm_spec$1 = "1.0";
const format_version$1 = 1;
const version$1 = 1;
const changelog$1 = [{ "v": 1, "catatan": "Siklus jalan kaki maju 1.3 m/detik dengan ayunan tangan bersilang dan ekspresi ceria." }];
const group$1 = "locomotion";
const tags$1 = ["vrm-1.0", "walk", "loop"];
const duration$a = 1;
const loop$1 = true;
const channels$a = { "hip_y": [[0, -0.015], [0.25, 0.018, "inOutSine"], [0.5, -0.015, "inOutSine"], [0.75, 0.018, "inOutSine"], [1, -0.015, "inOutSine"]], "lean": [[0, 4], [1, 4]], "twist": [[0, -8], [0.5, 8, "inOutSine"], [1, -8, "inOutSine"]], "hip_twist": [[0, 8], [0.5, -8, "inOutSine"], [1, 8, "inOutSine"]], "hip_roll": [[0, -3], [0.5, 3, "inOutSine"], [1, -3, "inOutSine"]], "armL_elev": [[0, -72], [0.5, -70, "inOutSine"], [1, -72, "inOutSine"]], "armR_elev": [[0, -70], [0.5, -72, "inOutSine"], [1, -70, "inOutSine"]], "armL_azim": [[0, -22], [0.5, 26, "inOutSine"], [1, -22, "inOutSine"]], "armR_azim": [[0, 26], [0.5, -22, "inOutSine"], [1, 26, "inOutSine"]], "elbowL": [[0, 18], [0.5, 30, "inOutSine"], [1, 18, "inOutSine"]], "elbowR": [[0, 30], [0.5, 18, "inOutSine"], [1, 30, "inOutSine"]], "legL_swing": [[0, 26], [0.5, -20, "inOutSine"], [1, 26, "inOutSine"]], "legR_swing": [[0, -20], [0.5, 26, "inOutSine"], [1, -20, "inOutSine"]], "kneeL": [[0, 8], [0.25, 14, "inOutSine"], [0.5, 18, "inOutSine"], [0.75, 48, "outSine"], [1, 8, "inSine"]], "kneeR": [[0, 18], [0.25, 48, "outSine"], [0.5, 8, "inSine"], [0.75, 14, "inOutSine"], [1, 18, "inOutSine"]], "footL_pitch": [[0, -10], [0.5, 14, "inOutSine"], [1, -10, "inOutSine"]], "footR_pitch": [[0, 14], [0.5, -10, "inOutSine"], [1, 14, "inOutSine"]] };
const expressions$3 = { "happy": [[0, 0.25], [1, 0.25]] };
const move = { "dir": [0, 0, 1], "distance": 1.3, "t0": 0, "t1": 1, "ease": "linear" };
const events$1 = [{ "t": 0.05, "type": "sfx", "id": "step_L" }, { "t": 0.55, "type": "sfx", "id": "step_R" }];
const claims$1 = { "distance": 1.3, "duration": 1, "tolerance": 0.1 };
const validate = { "foot_slide": false };
const walk = {
  name: name$a,
  vrm_spec: vrm_spec$1,
  format_version: format_version$1,
  version: version$1,
  changelog: changelog$1,
  group: group$1,
  tags: tags$1,
  duration: duration$a,
  loop: loop$1,
  channels: channels$a,
  expressions: expressions$3,
  move,
  events: events$1,
  claims: claims$1,
  validate
};
const name$9 = "wave";
const vrm_spec = "1.0";
const format_version = 1;
const version = 1;
const changelog = [{ "v": 1, "catatan": "Emote VTuber VRM 1.0: melambaikan tangan kanan disertai senyum happy, kedipan sebelah mata, dan vokal sapaan." }];
const group = "emote";
const tags = ["vrm-1.0", "vtuber", "emote", "loop"];
const duration$9 = 1.6;
const loop = true;
const channels$9 = { "side_lean": [[0, 0], [0.4, -6, "inOutSine"], [1.2, 4, "inOutSine"], [1.6, 0, "inOutSine"]], "head_yaw": [[0, 0], [0.4, -8, "inOutSine"], [1.2, 6, "inOutSine"], [1.6, 0, "inOutSine"]], "head_pitch": [[0, 0], [0.4, -5, "inOutSine"], [1.2, 2, "inOutSine"], [1.6, 0, "inOutSine"]], "armR_elev": [[0, -75], [0.3, 35, "outQuad"], [1.3, 35, "inOutSine"], [1.6, -75, "inOutSine"]], "armR_azim": [[0, 0], [0.3, 30, "outQuad"], [0.55, 15, "inOutSine"], [0.8, 40, "inOutSine"], [1.05, 15, "inOutSine"], [1.3, 35, "inOutSine"], [1.6, 0, "inOutSine"]], "elbowR": [[0, 10], [0.3, 95, "outQuad"], [0.55, 60, "inOutSine"], [0.8, 105, "inOutSine"], [1.05, 60, "inOutSine"], [1.3, 95, "inOutSine"], [1.6, 10, "inOutSine"]], "armL_elev": [[0, -75], [0.8, -68, "inOutSine"], [1.6, -75, "inOutSine"]], "elbowL": [[0, 10], [0.8, 22, "inOutSine"], [1.6, 10, "inOutSine"]], "kneeL": [[0, 3], [1.6, 3]], "kneeR": [[0, 3], [1.6, 3]] };
const expressions$2 = { "happy": [[0, 0.2], [0.3, 0.95, "outQuad"], [1.3, 0.95, "hold"], [1.6, 0.2, "inOutSine"]], "aa": [[0, 0], [0.35, 0.75, "outQuad"], [0.7, 0.15, "inOutSine"], [1, 0.65, "outQuad"], [1.35, 0, "inQuad"], [1.6, 0]], "blinkLeft": [[0, 0], [0.4, 1, "outQuad"], [0.9, 1, "hold"], [1.1, 0, "inQuad"], [1.6, 0]] };
const events = [{ "t": 0.35, "type": "voice", "id": "halo_sapa" }];
const claims = { "duration": 1.6, "tolerance": 0.1 };
const wave = {
  name: name$9,
  vrm_spec,
  format_version,
  version,
  changelog,
  group,
  tags,
  duration: duration$9,
  loop,
  channels: channels$9,
  expressions: expressions$2,
  events,
  claims
};
const name$8 = "face_angry";
const part$8 = "face";
const description$8 = "Fierce combat facial expression";
const duration$8 = 0.1;
const channels$8 = { "jaw_open": [[0, 15]] };
const expressions$1 = { "angry": [[0, 1]], "blink": [[0, 0]] };
const face_angry = {
  name: name$8,
  part: part$8,
  description: description$8,
  duration: duration$8,
  channels: channels$8,
  expressions: expressions$1
};
const name$7 = "face_happy";
const part$7 = "face";
const description$7 = "Happy smiling facial expression";
const duration$7 = 0.1;
const channels$7 = { "jaw_open": [[0, 5]] };
const expressions = { "happy": [[0, 1]], "blink": [[0, 0]] };
const face_happy = {
  name: name$7,
  part: part$7,
  description: description$7,
  duration: duration$7,
  channels: channels$7,
  expressions
};
const name$6 = "fist_L";
const part$6 = "hands";
const description$6 = "Clenched left fist";
const duration$6 = 0.1;
const channels$6 = { "thumbL": [[0, 50]], "indexL": [[0, 90]], "middleL": [[0, 90]], "ringL": [[0, 90]], "littleL": [[0, 90]], "spreadL": [[0, 0]] };
const fist_L = {
  name: name$6,
  part: part$6,
  description: description$6,
  duration: duration$6,
  channels: channels$6
};
const name$5 = "fist_R";
const part$5 = "hands";
const description$5 = "Clenched right fist";
const duration$5 = 0.1;
const channels$5 = { "thumbR": [[0, 50]], "indexR": [[0, 90]], "middleR": [[0, 90]], "ringR": [[0, 90]], "littleR": [[0, 90]], "spreadR": [[0, 0]] };
const fist_R = {
  name: name$5,
  part: part$5,
  description: description$5,
  duration: duration$5,
  channels: channels$5
};
const name$4 = "guard_arms";
const part$4 = "arms";
const description$4 = "Defensive combat arm guard position";
const duration$4 = 0.1;
const channels$4 = { "armL_elev": [[0, 45]], "armL_azim": [[0, 20]], "elbowL": [[0, 95]], "armR_elev": [[0, 40]], "armR_azim": [[0, 25]], "elbowR": [[0, 100]] };
const guard_arms = {
  name: name$4,
  part: part$4,
  description: description$4,
  duration: duration$4,
  channels: channels$4
};
const name$3 = "open_hand_L";
const part$3 = "hands";
const description$3 = "Open relaxed left hand";
const duration$3 = 0.1;
const channels$3 = { "thumbL": [[0, 0]], "indexL": [[0, 10]], "middleL": [[0, 10]], "ringL": [[0, 10]], "littleL": [[0, 10]], "spreadL": [[0, 15]] };
const open_hand_L = {
  name: name$3,
  part: part$3,
  description: description$3,
  duration: duration$3,
  channels: channels$3
};
const name$2 = "open_hand_R";
const part$2 = "hands";
const description$2 = "Open relaxed right hand";
const duration$2 = 0.1;
const channels$2 = { "thumbR": [[0, 0]], "indexR": [[0, 10]], "middleR": [[0, 10]], "ringR": [[0, 10]], "littleR": [[0, 10]], "spreadR": [[0, 15]] };
const open_hand_R = {
  name: name$2,
  part: part$2,
  description: description$2,
  duration: duration$2,
  channels: channels$2
};
const name$1 = "punch_arm_R";
const part$1 = "arms";
const description$1 = "Extended right straight punch pose";
const duration$1 = 0.1;
const channels$1 = { "armR_elev": [[0, 75]], "armR_azim": [[0, 5]], "armR_roll": [[0, 15]], "elbowR": [[0, 10]] };
const punch_arm_R = {
  name: name$1,
  part: part$1,
  description: description$1,
  duration: duration$1,
  channels: channels$1
};
const name = "t_pose";
const part = "torso";
const description = "Standard neutral T-pose";
const duration = 0.1;
const channels = { "lean": [[0, 0]], "side_lean": [[0, 0]], "twist": [[0, 0]], "armL_elev": [[0, 0]], "armL_azim": [[0, 90]], "armR_elev": [[0, 0]], "armR_azim": [[0, 90]], "elbowL": [[0, 0]], "elbowR": [[0, 0]] };
const t_pose = {
  name,
  part,
  description,
  duration,
  channels
};
const defaultPoses = {
  face_angry,
  face_happy,
  fist_L,
  fist_R,
  guard_arms,
  open_hand_L,
  open_hand_R,
  punch_arm_R,
  t_pose
};
const defaultClips = {
  dodge,
  slash,
  parry,
  idle,
  walk,
  jump,
  wave,
  kick_front,
  kick_roundhouse,
  kick_side,
  kick_low,
  kick_axe,
  kick_back,
  hands_eyes_jaw
};
function computeClipMetrics(rig, ctx, limits, clip, style = "stylized") {
  if (!clip || typeof clip !== "object" || typeof clip.duration !== "number" || Number.isNaN(clip.duration) || clip.duration <= 0 || !clip.channels || typeof clip.channels !== "object") {
    return {
      name: clip?.name || "invalid",
      duration: 0,
      rootTravel: 0,
      airtime: 0,
      peakAngularSpeed: 0,
      peakJoint: "",
      jointSpeeds: {},
      issues: { fail: 0, warn: 0 }
    };
  }
  const dur = clip.duration;
  const frames = Math.max(1, Math.ceil(dur * FPS - 1e-9));
  const tAt = (f) => Math.min(f / FPS, dur);
  const poses = [];
  for (let f = 0; f <= frames; f++) {
    poses.push(evalPose(rig, ctx, clip, tAt(f)));
  }
  if (!poses.length || !poses[0] || !poses[frames]) {
    return {
      name: clip.name || "unnamed",
      duration: dur,
      rootTravel: 0,
      airtime: 0,
      peakAngularSpeed: 0,
      peakJoint: "",
      jointSpeeds: {},
      issues: { fail: 0, warn: 0 }
    };
  }
  const I = ctx.idx;
  const restPos = restPositions(ctx);
  const floorY2 = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);
  const p0 = poses[0].pos[I.Hips];
  const pEnd = poses[frames].pos[I.Hips];
  const rootTravel = Number(
    Math.hypot(pEnd[0] - p0[0], pEnd[1] - p0[1], pEnd[2] - p0[2]).toFixed(4)
  );
  let airFrames = 0;
  const footThreshold = floorY2 + 0.02;
  for (let f = 0; f <= frames; f++) {
    const lY = poses[f].pos[I.LeftToeBase][1];
    const rY = poses[f].pos[I.RightToeBase][1];
    if (lY > footThreshold && rY > footThreshold) {
      airFrames++;
    }
  }
  const airtime = Number((airFrames / (frames + 1) * dur).toFixed(4));
  let peakSpeed = 0;
  let peakJoint = "";
  const jointSpeeds = {};
  for (let i = 0; i < ctx.n; i++) {
    const jName = ctx.names[i];
    let jPeak = 0;
    for (let f = 1; f <= frames; f++) {
      const s = qangle(poses[f - 1].local[i], poses[f].local[i]) * R2D * FPS;
      if (s > jPeak) jPeak = s;
      if (s > peakSpeed) {
        peakSpeed = s;
        peakJoint = jName;
      }
    }
    jointSpeeds[jName] = Number(jPeak.toFixed(2));
  }
  const valResult = validate$7(rig, ctx, limits, clip, style);
  return {
    name: clip.name || "unnamed",
    duration: dur,
    rootTravel,
    airtime,
    peakAngularSpeed: Number(peakSpeed.toFixed(2)),
    peakJoint,
    jointSpeeds,
    issues: {
      fail: valResult.fail,
      warn: valResult.warn
    }
  };
}
function compareClips(rig, ctx, limits, clipA, clipB, style = "stylized") {
  const metricsA = computeClipMetrics(rig, ctx, limits, clipA, style);
  const metricsB = computeClipMetrics(rig, ctx, limits, clipB, style);
  const jointDiffs = {};
  for (const jName of ctx.names) {
    const spA = metricsA.jointSpeeds[jName] || 0;
    const spB = metricsB.jointSpeeds[jName] || 0;
    jointDiffs[jName] = Number((spB - spA).toFixed(2));
  }
  const diff = {
    duration: Number((metricsB.duration - metricsA.duration).toFixed(4)),
    rootTravel: Number((metricsB.rootTravel - metricsA.rootTravel).toFixed(4)),
    airtime: Number((metricsB.airtime - metricsA.airtime).toFixed(4)),
    peakAngularSpeed: Number((metricsB.peakAngularSpeed - metricsA.peakAngularSpeed).toFixed(2)),
    jointSpeeds: jointDiffs,
    failCount: metricsB.issues.fail - metricsA.issues.fail,
    warnCount: metricsB.issues.warn - metricsA.issues.warn
  };
  return {
    clipA: metricsA.name,
    clipB: metricsB.name,
    metricsA,
    metricsB,
    diff
  };
}
async function runCompare(args, options = {}) {
  const targetA = args[0];
  const targetB = args[1];
  if (!targetA || !targetB) {
    console.error('Error: "clipkit compare" requires two clips to compare.');
    console.error("Example: clipkit compare jump jump_v2.json --sheet ./out");
    return 2;
  }
  const { motus: motus2 } = loadRigs();
  const ctx = makeCtx(motus2);
  const style = options.style || "stylized";
  async function loadClip(target) {
    if (defaultClips[target]) {
      return JSON.parse(JSON.stringify(defaultClips[target]));
    }
    const raw = await readInput(target);
    return JSON.parse(raw);
  }
  let clipA, clipB;
  try {
    clipA = await loadClip(targetA);
  } catch (e) {
    console.error(`Error reading clip A (${targetA}): ${e.message}`);
    return 2;
  }
  try {
    clipB = await loadClip(targetB);
  } catch (e) {
    console.error(`Error reading clip B (${targetB}): ${e.message}`);
    return 2;
  }
  const comparison = compareClips(motus2, ctx, limitsData, clipA, clipB, style);
  let sheetPath = null;
  if (options.sheet) {
    const sheetResult = renderComparisonContactSheet(motus2, ctx, clipA, clipB, options);
    const nameA = clipA.name || "clipA";
    const nameB = clipB.name || "clipB";
    const svgFileName = `compare_${nameA}_vs_${nameB}.svg`;
    sheetPath = path.resolve(options.sheet, svgFileName);
    try {
      writeOutputFile(sheetPath, sheetResult.svg, options);
    } catch (e) {
      console.error(`Error writing comparison sheet: ${e.message}`);
      return 2;
    }
  }
  const outputData = {
    ...comparison,
    sheet: sheetPath
  };
  if (options.json) {
    console.log(formatDeterministicJson(outputData));
  } else {
    console.log(`
Comparison: [A] ${clipA.name || targetA} vs [B] ${clipB.name || targetB}`);
    console.log("=".repeat(60));
    console.log(
      `Duration:            ${comparison.metricsA.duration.toFixed(2)}s  ->  ${comparison.metricsB.duration.toFixed(2)}s  (${comparison.diff.duration >= 0 ? "+" : ""}${comparison.diff.duration}s)`
    );
    console.log(
      `Root Travel:         ${comparison.metricsA.rootTravel.toFixed(2)}m  ->  ${comparison.metricsB.rootTravel.toFixed(2)}m  (${comparison.diff.rootTravel >= 0 ? "+" : ""}${comparison.diff.rootTravel}m)`
    );
    console.log(
      `Airtime:             ${comparison.metricsA.airtime.toFixed(2)}s  ->  ${comparison.metricsB.airtime.toFixed(2)}s  (${comparison.diff.airtime >= 0 ? "+" : ""}${comparison.diff.airtime}s)`
    );
    console.log(
      `Peak Angular Speed:  ${comparison.metricsA.peakAngularSpeed.toFixed(0)}°/s (${comparison.metricsA.peakJoint})  ->  ${comparison.metricsB.peakAngularSpeed.toFixed(0)}°/s (${comparison.metricsB.peakJoint})`
    );
    console.log(
      `Issues (Fail/Warn):  ${comparison.metricsA.issues.fail}/${comparison.metricsA.issues.warn}  ->  ${comparison.metricsB.issues.fail}/${comparison.metricsB.issues.warn}`
    );
    if (sheetPath) {
      console.log(`
Comparison contact sheet saved to:
  ${sheetPath}`);
    }
    console.log("");
  }
  return 0;
}
async function runCompose(args, options = {}) {
  const target = args[0];
  if (!target) {
    console.error('Error: "clipkit compose" requires a clip path or clip name.');
    return 2;
  }
  let clip;
  if (defaultClips[target]) {
    clip = JSON.parse(JSON.stringify(defaultClips[target]));
  } else {
    try {
      const raw = await readInput(target);
      clip = JSON.parse(raw);
    } catch (e) {
      console.error(`Error reading clip '${target}': ${e.message}`);
      return 2;
    }
  }
  if (!clip.layers || !Array.isArray(clip.layers) || clip.layers.length === 0) {
    console.error(`Clip '${target}' has no layers to compose.`);
    if (options.output) {
      writeOutputFile(options.output, formatDeterministicJson(clip), options);
    } else {
      console.log(formatDeterministicJson(clip));
    }
    return 0;
  }
  const resolveRef = (ref) => {
    if (defaultPoses[ref]) return defaultPoses[ref];
    if (defaultClips[ref]) return defaultClips[ref];
    const candidatePath = path.resolve(process.cwd(), ref);
    if (fs.existsSync(candidatePath)) {
      return JSON.parse(fs.readFileSync(candidatePath, "utf8"));
    }
    return null;
  };
  const { clip: composed, warnings } = composeClips(clip, clip.layers, {
    resolveRef
  });
  delete composed.layers;
  if (warnings.length > 0) {
    for (const w of warnings) {
      console.warn(`[WARN] ${w.code}: ${w.message}`);
    }
    if (options.failOn === "warn") {
      return 1;
    }
  }
  const jsonStr = formatDeterministicJson(composed);
  if (options.output) {
    try {
      writeOutputFile(options.output, jsonStr, options);
      console.log(`Successfully composed and wrote clip to: ${options.output}`);
    } catch (e) {
      console.error(`Error writing output: ${e.message}`);
      return 2;
    }
  } else {
    console.log(jsonStr);
  }
  return 0;
}
const SWAP_LR_CHANNELS = [
  ["legL_swing", "legR_swing"],
  ["legL_abd", "legR_abd"],
  ["kneeL", "kneeR"],
  ["footL_pitch", "footR_pitch"],
  ["elbowL", "elbowR"],
  ["thumbL", "thumbR"],
  ["indexL", "indexR"],
  ["middleL", "middleR"],
  ["ringL", "ringR"],
  ["littleL", "littleR"],
  ["spreadL", "spreadR"],
  ["armL_elev", "armR_elev"],
  ["armL_azim", "armR_azim"],
  ["armL_roll", "armR_roll"]
];
const NEGATE_CHANNELS = /* @__PURE__ */ new Set([
  "side_lean",
  "twist",
  "hip_twist",
  "hip_roll",
  "head_yaw",
  "hip_x",
  "armL_roll",
  "armR_roll",
  "eye_yaw"
]);
const SWAP_EXPRESSIONS = [
  ["blinkLeft", "blinkRight"],
  ["lookLeft", "lookRight"]
];
function mirrorClip(clip) {
  const mirrored = JSON.parse(JSON.stringify(clip));
  const oldChannels = clip.channels || {};
  const newChannels = {};
  const swapMap = /* @__PURE__ */ new Map();
  for (const [l, r] of SWAP_LR_CHANNELS) {
    swapMap.set(l, r);
    swapMap.set(r, l);
  }
  for (const [ch, kfs] of Object.entries(oldChannels)) {
    const targetCh = swapMap.get(ch) || ch;
    const shouldNegate = NEGATE_CHANNELS.has(targetCh);
    newChannels[targetCh] = kfs.map((kf) => {
      const t = kf[0];
      const val = shouldNegate ? Object.is(kf[1], 0) || kf[1] === 0 ? 0 : -kf[1] : kf[1];
      const easing = kf[2];
      return easing ? [t, val, easing] : [t, val];
    });
  }
  mirrored.channels = newChannels;
  if (clip.expressions) {
    const oldExpr = clip.expressions;
    const newExpr = {};
    const exprSwap = /* @__PURE__ */ new Map();
    for (const [l, r] of SWAP_EXPRESSIONS) {
      exprSwap.set(l, r);
      exprSwap.set(r, l);
    }
    for (const [name2, kfs] of Object.entries(oldExpr)) {
      const targetName = exprSwap.get(name2) || name2;
      newExpr[targetName] = JSON.parse(JSON.stringify(kfs));
    }
    mirrored.expressions = newExpr;
  }
  if (clip.windows) {
    const wins = { ...clip.windows };
    if (wins.planted_L || wins.planted_R) {
      const l = wins.planted_L;
      const r = wins.planted_R;
      if (l) wins.planted_R = [...l];
      else delete wins.planted_R;
      if (r) wins.planted_L = [...r];
      else delete wins.planted_L;
    }
    mirrored.windows = wins;
  }
  if (clip.move && Array.isArray(clip.move)) {
    mirrored.move = [clip.move[0] === 0 ? 0 : -clip.move[0], clip.move[1], clip.move[2]];
  }
  if (mirrored.name) {
    mirrored.name = `${mirrored.name}_mirror`;
  }
  return mirrored;
}
function retimeClip(clip, timeScale) {
  if (timeScale <= 0) throw new Error("Time scale must be positive.");
  const retimed = JSON.parse(JSON.stringify(clip));
  retimed.duration = Number((clip.duration * timeScale).toFixed(4));
  if (retimed.channels) {
    for (const [ch, kfs] of Object.entries(retimed.channels)) {
      retimed.channels[ch] = kfs.map(([t, val, easing]) => {
        const newT = Number((t * timeScale).toFixed(4));
        return easing ? [newT, val, easing] : [newT, val];
      });
    }
  }
  if (retimed.expressions) {
    for (const [name2, kfs] of Object.entries(retimed.expressions)) {
      retimed.expressions[name2] = kfs.map(([t, val, easing]) => {
        const newT = Number((t * timeScale).toFixed(4));
        return easing ? [newT, val, easing] : [newT, val];
      });
    }
  }
  if (retimed.windows) {
    for (const [w, [start, end]] of Object.entries(retimed.windows)) {
      retimed.windows[w] = [
        Number((start * timeScale).toFixed(4)),
        Number((end * timeScale).toFixed(4))
      ];
    }
  }
  if (retimed.events) {
    retimed.events = retimed.events.map((ev) => ({
      ...ev,
      t: Number((ev.t * timeScale).toFixed(4))
    }));
  }
  return retimed;
}
function scaleAmplitude(clip, factor, channelFilter = null) {
  const scaled = JSON.parse(JSON.stringify(clip));
  const filterSet = channelFilter ? new Set(channelFilter) : null;
  if (scaled.channels) {
    for (const [ch, kfs] of Object.entries(scaled.channels)) {
      if (!filterSet || filterSet.has(ch)) {
        scaled.channels[ch] = kfs.map(([t, val, easing]) => {
          const newVal = Number((val * factor).toFixed(4));
          return easing ? [t, newVal, easing] : [t, newVal];
        });
      }
    }
  }
  return scaled;
}
function closeLoop(clip) {
  const looped = JSON.parse(JSON.stringify(clip));
  looped.loop = true;
  if (looped.channels) {
    for (const [ch, kfs] of Object.entries(looped.channels)) {
      if (kfs.length > 0) {
        const firstVal = kfs[0][1];
        const lastIdx = kfs.length - 1;
        const lastT = kfs[lastIdx][0];
        const lastEasing = kfs[lastIdx][2];
        looped.channels[ch][lastIdx] = lastEasing ? [lastT, firstVal, lastEasing] : [lastT, firstVal];
      }
    }
  }
  return looped;
}
async function runEdit(args, options = {}) {
  const operation = args[0];
  const target = args[1];
  if (!operation || !["mirror", "retime", "scale-amplitude", "close-loop", "overlap"].includes(operation)) {
    console.error(
      'Error: "clipkit edit" requires an operation: "mirror", "retime", "scale-amplitude", "close-loop", or "overlap".'
    );
    console.error(
      "Example: clipkit edit overlap slash.json --delay 0.03 --damping 12 --output slash_overlap.json"
    );
    return 2;
  }
  if (!target) {
    console.error(`Error: "clipkit edit ${operation}" requires a clip path or clip name.`);
    return 2;
  }
  let clip;
  if (defaultClips[target]) {
    clip = JSON.parse(JSON.stringify(defaultClips[target]));
  } else {
    try {
      const raw = await readInput(target);
      clip = JSON.parse(raw);
    } catch (e) {
      console.error(`Error reading clip '${target}': ${e.message}`);
      return 2;
    }
  }
  let result;
  if (operation === "mirror") {
    result = mirrorClip(clip);
  } else if (operation === "retime") {
    const scale2 = options.scale != null ? Number(options.scale) : null;
    if (!scale2 || Number.isNaN(scale2) || scale2 <= 0) {
      console.error('Error: "clipkit edit retime" requires "--scale <factor>" (e.g. --scale 1.5).');
      return 2;
    }
    result = retimeClip(clip, scale2);
  } else if (operation === "scale-amplitude") {
    const scale2 = options.scale != null ? Number(options.scale) : null;
    if (scale2 == null || Number.isNaN(scale2)) {
      console.error(
        'Error: "clipkit edit scale-amplitude" requires "--scale <factor>" (e.g. --scale 0.8).'
      );
      return 2;
    }
    const filter = options.channels ? options.channels.split(",").map((s) => s.trim()) : null;
    result = scaleAmplitude(clip, scale2, filter);
  } else if (operation === "close-loop") {
    result = closeLoop(clip);
  } else if (operation === "overlap") {
    const delayStep = options.delay != null ? Number(options.delay) : void 0;
    const damping = options.damping != null ? Number(options.damping) : void 0;
    const overshootScale = options.overshoot != null ? Number(options.overshoot) : void 0;
    const frequency = options.freq != null ? Number(options.freq) : void 0;
    result = applyOverlap(clip, {
      delayStep,
      damping,
      overshootScale,
      frequency
    });
  }
  const jsonStr = formatDeterministicJson(result);
  if (options.output) {
    try {
      writeOutputFile(options.output, jsonStr, options);
      console.log(`Successfully edited clip and wrote to: ${options.output}`);
    } catch (e) {
      console.error(`Error writing output: ${e.message}`);
      return 2;
    }
  } else {
    console.log(jsonStr);
  }
  return 0;
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
function runPoses(args, options = {}) {
  const sub = args[0];
  if (!sub || sub === "list") {
    const partFilter = options.part;
    const poses = Object.values(defaultPoses).filter((p) => !partFilter || p.part === partFilter).map((p) => ({
      name: p.name,
      part: p.part,
      description: p.description,
      channelCount: Object.keys(p.channels || {}).length,
      hasExpressions: !!p.expressions
    }));
    if (options.json) {
      console.log(formatDeterministicJson(poses));
    } else {
      console.log(`
ClipKit Pose Library (${poses.length} poses):
`);
      for (const p of poses) {
        console.log(`  - ${p.name.padEnd(16)} [${p.part}] ${p.description || ""}`);
      }
      console.log("");
    }
    return 0;
  }
  if (sub === "show") {
    const name2 = args[1];
    if (!name2) {
      console.error('Error: "poses show" requires a pose name, e.g. "clipkit poses show fist_L"');
      return 2;
    }
    const pose = defaultPoses[name2];
    if (!pose) {
      console.error(
        `Error: Unknown pose "${name2}". Use "clipkit poses list" to view available poses.`
      );
      return 1;
    }
    if (options.json) {
      console.log(formatDeterministicJson(pose));
    } else {
      console.log(`
Pose: ${pose.name} [part: ${pose.part}]`);
      if (pose.description) console.log(`Description: ${pose.description}`);
      console.log("\nChannels:");
      for (const [ch, kfs] of Object.entries(pose.channels || {})) {
        console.log(`  ${ch.padEnd(16)}: ${JSON.stringify(kfs)}`);
      }
      if (pose.expressions) {
        console.log("\nExpressions:");
        for (const [expr, kfs] of Object.entries(pose.expressions)) {
          console.log(`  ${expr.padEnd(16)}: ${JSON.stringify(kfs)}`);
        }
      }
      console.log("");
    }
    return 0;
  }
  console.error(`Error: Unknown poses subcommand "${sub}". Expected "list" or "show <name>".`);
  return 2;
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
  const res = validate$7(motus2, ctx, limitsData, clip, style, void 0, {
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
async function runVersion(args, options = {}) {
  const target = args[0];
  if (!target) {
    console.error('Error: "clipkit version" requires a clip file or clip name.');
    console.error('Example: clipkit version jump.json --parent 1 --note "Floatier apex"');
    return 2;
  }
  let clip;
  if (defaultClips[target]) {
    clip = JSON.parse(JSON.stringify(defaultClips[target]));
  } else {
    try {
      const raw = await readInput(target);
      clip = JSON.parse(raw);
    } catch (e) {
      console.error(`Error reading clip '${target}': ${e.message}`);
      return 2;
    }
  }
  const clipName = clip.name || "unnamed_clip";
  const versionNum = clip.version || 1;
  const parentVer = options.parent != null ? Number(options.parent) : versionNum > 1 ? versionNum - 1 : null;
  const note = options.note || (clip.changelog && clip.changelog.length ? clip.changelog[clip.changelog.length - 1].catatan : "Version snapshot");
  const destDir = options.dir ? path.resolve(process.cwd(), options.dir) : path.resolve(process.cwd(), "variants", clipName);
  const versionFileName = `v${versionNum}.json`;
  const versionFilePath = path.join(destDir, versionFileName);
  if (fs.existsSync(versionFilePath) && !options.force) {
    console.error(
      `Error: Version file '${versionFileName}' already exists in ${destDir}. Refusing to overwrite without --force.`
    );
    return 1;
  }
  const { motus: motus2 } = loadRigs();
  const ctx = makeCtx(motus2);
  const metrics = computeClipMetrics(motus2, ctx, limitsData, clip, options.style || "stylized");
  const manifestPath = path.join(destDir, "manifest.json");
  let manifest = {
    name: clipName,
    defaultVersion: versionNum,
    versions: {}
  };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (_e) {
    }
  }
  manifest.defaultVersion = versionNum;
  manifest.versions[String(versionNum)] = {
    version: versionNum,
    file: versionFileName,
    parent: parentVer,
    note,
    metrics: {
      duration: metrics.duration,
      rootTravel: metrics.rootTravel,
      airtime: metrics.airtime,
      peakAngularSpeed: metrics.peakAngularSpeed,
      issues: metrics.issues
    }
  };
  try {
    writeOutputFile(versionFilePath, formatDeterministicJson(clip), options);
    writeOutputFile(manifestPath, formatDeterministicJson(manifest), { ...options, force: true });
  } catch (e) {
    console.error(`Error saving version or manifest: ${e.message}`);
    return 2;
  }
  const result = {
    clip: clipName,
    version: versionNum,
    parent: parentVer,
    note,
    path: versionFilePath,
    manifest: manifestPath,
    metrics: manifest.versions[String(versionNum)].metrics
  };
  if (options.json) {
    console.log(formatDeterministicJson(result));
  } else {
    console.log(`
Created immutable version v${versionNum} for '${clipName}':`);
    console.log(`  File:     ${versionFilePath}`);
    console.log(`  Parent:   ${parentVer != null ? `v${parentVer}` : "None (root)"}`);
    console.log(`  Note:     ${note}`);
    console.log(`  Manifest: ${manifestPath}`);
    console.log(
      `  Metrics:  dur=${metrics.duration}s, travel=${metrics.rootTravel}m, air=${metrics.airtime}s, peakSpeed=${metrics.peakAngularSpeed}°/s`
    );
    console.log("");
  }
  return 0;
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
        "output",
        "frames",
        "view",
        "scale",
        "note",
        "parent",
        "channels",
        "delay",
        "damping",
        "overshoot",
        "freq",
        "template"
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
  if (command === "poses") {
    console.log(`clipkit poses <subcommand> [options]

Inspects and lists named single-keyframe poses from the ClipKit Pose Library.

Subcommands:
  list                     List all available poses (can filter by --part)
  show <name>              Show detailed channel and expression values for a pose

Options:
  --part <part>            Filter poses by body part (face | hands | arms | torso | legs)
  --json                   Output pose data as JSON

Example:
  clipkit poses list --part hands
  clipkit poses show fist_L --json
`);
    return;
  }
  if (command === "compose") {
    console.log(`clipkit compose <clip-file> [options]

Flattens layered animation clips into a regular standalone clip with merge semantics.

Options:
  --output <file>          Path to write the composed clip JSON
  --fail-on <level>        Fail on composition warnings ('warn')
  --json                   Output composed clip JSON to stdout
  --force                  Overwrite existing output file

Example:
  clipkit compose jump_with_punch.json --output ./composed_jump.json
`);
    return;
  }
  if (command === "edit") {
    console.log(`clipkit edit <operation> <clip-file> [options]

Performs deterministic editing operations on animation clips.

Operations:
  mirror                   Reflect motion across sagittal plane (X to -X, swap L/R)
  retime                   Scale timing and duration by a factor (--scale <f>)
  scale-amplitude          Scale channel rotation/displacement amplitudes (--scale <f>)
  close-loop               Close animation loop by matching end to start
  overlap                  Apply hierarchical propagation delay and damped overshoot

Options:
  --scale <factor>         Scaling factor for retime or scale-amplitude
  --channels <list>        Comma-separated channels to scale (for scale-amplitude)
  --delay <seconds>        Base propagation delay step per hierarchy level (default: 0.03)
  --damping <factor>       Damping decay coefficient for overshoot (default: 12)
  --overshoot <factor>     Overshoot amplitude factor (default: 0.08)
  --output <file>          Path to write the modified clip JSON
  --json                   Output modified clip JSON to stdout
  --force                  Overwrite existing output file

Example:
  clipkit edit mirror slash.json --output slash_mirrored.json
  clipkit edit retime jump.json --scale 1.2 --output jump_slow.json
  clipkit edit overlap slash.json --delay 0.03 --damping 12 --output slash_overlap.json

`);
    return;
  }
  if (command === "compare") {
    console.log(`clipkit compare <clipA> <clipB> [options]

Reports per-joint metric differences and renders side-by-side comparative contact sheets.

Options:
  --sheet <dir>            Render side-by-side comparison sheet SVG to directory
  --style <style>          Validation style: realistic | stylized (default) | exaggerated
  --json                   Output comparison metrics and diff as JSON
  --force                  Overwrite existing sheet file

Example:
  clipkit compare jump jump_floaty.json --sheet ./out --json
`);
    return;
  }
  if (command === "version") {
    console.log(`clipkit version <clip-file> [options]

Creates an immutable version in a clip variant folder with manifest.json tracking.

Options:
  --parent <version>       Parent version number (default: current - 1)
  --note <note>            Description of changes / intent for this version
  --dir <dir>              Custom directory for variants (default: ./variants/<clip>)
  --force                  Force overwrite if version file exists
  --json                   Output version metadata as JSON

Example:
  clipkit version jump.json --parent 1 --note "Floatier jump apex"
`);
    return;
  }
  console.log(`ClipKit Web Agent CLI v${CLI_VERSION}

Deterministic, machine-first command line interface for animation validation,
diagnostics, VRMA export, contact sheets, and modular composition.

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
  poses <subcommand>       Browse pose library (list | show <name>)
  compose <clip>           Flatten layer clip into a normal clip
  edit <op> <clip>         Deterministic edit operations (mirror | retime | scale-amplitude | close-loop)
  compare <a> <b>          Compare kinematics and render side-by-side contact sheet
  version <clip>           Create immutable variant version with manifest.json tracking

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
      case "poses":
        return await runPoses(commandArgs, options);
      case "compose":
        return await runCompose(commandArgs, options);
      case "edit":
        return await runEdit(commandArgs, options);
      case "compare":
        return await runCompare(commandArgs, options);
      case "version":
        return await runVersion(commandArgs, options);
      default:
        console.error(`Error: Unknown command '${command}'. Run 'clipkit --help' for usage.`);
        return 2;
    }
  } catch (err) {
    console.error(err.stack || `Error: ${err.message}`);
    return 3;
  }
}
const exitCode = await main(process.argv.slice(2));
if (typeof exitCode === "number" && exitCode !== 0) {
  process.exit(exitCode);
}

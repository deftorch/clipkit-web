import { r5, vlen, vlerp, vsub } from '../../domain/math/vec3.js';
import {
  MAP_M2V,
  REQUIRED_VRM_BONES
} from '../../domain/validation/vrm10/constants.js';
import { worldPositions } from './glb-parser.js';

export function buildRig(gltf, base, label) {
  const ext = gltf.extensions || {};
  if (!ext.VRMC_vrm) {
    if (ext.VRM) {
      throw new Error(
        'File ini VRM 0.x (ekstensi "VRM"). Halaman ini hanya mendukung VRM 1.0 (ekstensi "VRMC_vrm"). Konversi dulu ke VRM 1.0, misalnya dengan UniVRM.'
      );
    }
    throw new Error('Ekstensi VRMC_vrm tidak ditemukan. Ini bukan file VRM 1.0.');
  }
  const v = ext.VRMC_vrm,
    hb = v.humanoid && v.humanoid.humanBones;
  if (!hb) throw new Error('VRMC_vrm.humanoid.humanBones tidak ada.');
  const missingReq = REQUIRED_VRM_BONES.filter((k) => !hb[k]);
  if (missingReq.length) {
    throw new Error('Bone wajib VRM tidak ada: ' + missingReq.join(', '));
  }
  const WP = worldPositions(gltf),
    P = {},
    synth = [];
  for (const [ib, vk] of Object.entries(MAP_M2V)) {
    if (hb[vk] && WP[hb[vk].node]) P[ib] = WP[hb[vk].node];
  }
  const sc0 = P.Hips[1] / 0.9675; // Skala kasar terhadap MotusMan
  const need = (n, fn) => {
    if (!P[n]) {
      P[n] = fn();
      synth.push(MAP_M2V[n]);
    }
  };
  need('Neck', () => (P.Spine2 ? vlerp(P.Spine2, P.Head, 0.5) : vlerp(P.Spine, P.Head, 0.8)));
  need('Spine2', () => vlerp(P.Spine1 || P.Spine, P.Neck, P.Spine1 ? 0.5 : 0.66));
  need('Spine1', () => vlerp(P.Spine, P.Spine2, 0.5));
  for (const s of ['Left', 'Right']) {
    need(s + 'Shoulder', () => vlerp(P.Spine2, P[s + 'Arm'], 0.3));
    need(s + 'ToeBase', () => [
      P[s + 'Foot'][0],
      P[s + 'Foot'][1] * 0.18,
      P[s + 'Foot'][2] + 0.16 * sc0
    ]);
  }
  const names0 = base.animated_bones,
    parents0 = base.rest.parents;
  let extraPresent = 0;
  names0.forEach((n, i) => {
    if (i >= 22) {
      if (P[n]) extraPresent++;
      else
        P[n] = [0, 1, 2].map(
          (a) => P[names0[parents0[i]]][a] + base.rest.offsets[i][a] * sc0
        );
    }
  });
  const names = base.animated_bones,
    parents = base.rest.parents,
    offsets = names.map((n, i) =>
      parents[i] < 0 ? r5(P[n]) : r5(vsub(P[n], P[names[parents[i]]]))
    );

  // Pemeriksaan
  const warns = [];
  if (!(P.LeftUpLeg[0] > P.RightUpLeg[0] + 0.01)) {
    warns.push(
      'Kaki kiri tidak berada di +X. Model mungkin menghadap -Z (VRM 0.x) atau sumbu terbalik; klip akan tampil terbalik.'
    );
  }
  if (P.LeftToeBase[2] - P.LeftFoot[2] < 0.01 && !synth.includes('leftToes')) {
    warns.push(
      'Ujung kaki tidak berada di depan pergelangan (+Z). Arah hadap model diragukan.'
    );
  }
  const ua = vsub(P.LeftForeArm, P.LeftArm),
    droop =
      (Math.asin(Math.max(-1, Math.min(1, ua[1] / vlen(ua)))) * 180) / Math.PI;
  if (Math.abs(droop) > 12) {
    warns.push(
      `Lengan rest miring ${droop.toFixed(0)}° dari horizontal (bukan T-pose). Arah rest asli tetap dipakai, tetapi cek hasil lengan.`
    );
  }
  if (P.Hips[1] < 0.3 || P.Hips[1] > 2.5) {
    warns.push(
      `Tinggi pinggul ${P.Hips[1].toFixed(2)} m tidak lazim untuk satuan meter. Cek skala model.`
    );
  }
  const leg = (s) =>
    vlen(vsub(P[s + 'Leg'], P[s + 'UpLeg'])) +
    vlen(vsub(P[s + 'Foot'], P[s + 'Leg']));
  const legLen = (leg('Left') + leg('Right')) / 2;
  const MOTUS_LEG = 0.8183; // Pinggul->pergelangan MotusMan (0.4223 + 0.3960 pada rest)
  const rig = JSON.parse(JSON.stringify(base));
  rig.name =
    label || (v.meta && (v.meta.name || v.meta.avatarName)) || 'VRM 1.0';
  rig.kind = 'vrm1';
  rig.humanoid = MAP_M2V;
  rig.rest = { parents: parents.slice(), offsets };
  rig.scale = +(P.Hips[1] / 0.9675).toFixed(4);
  rig.pos_scale = +(legLen / MOTUS_LEG).toFixed(4);
  const info = {
    name: rig.name,
    spec: v.specVersion || '?',
    nodes: gltf.nodes.length,
    hipsY: P.Hips[1],
    legLen,
    scale: rig.scale,
    posScale: rig.pos_scale,
    synth,
    warns,
    height: Math.max(...Object.values(P).map((p) => p[1])),
    present: Object.values(MAP_M2V)
      .slice(0, 22)
      .filter((k) => hb[k]).length,
    total: 22,
    extraPresent,
    extraBones: Object.keys(hb).filter(
      (k) => !Object.values(MAP_M2V).includes(k)
    ).length,
    license: (v.meta && (v.meta.licenseUrl || v.meta.avatarPermission)) || null,
    droop
  };
  return { rig, info };
}

export const VrmRig = {
  buildRig,
  MAP: MAP_M2V,
  REQUIRED: REQUIRED_VRM_BONES,
  worldPositions
};

export default VrmRig;

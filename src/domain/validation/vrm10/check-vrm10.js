import { REQUIRED_VRM_BONES, VRM10_BONES, VRM10_EXPRESSIONS, vn } from './constants.js';

export function checkVrm10(rig, ctx, clip) {
  const out = [];

  // 1. Cek 15 bone wajib VRM 1.0 pada rig target (40 bone lainnya bersifat opsional)
  const rigBones = rig.animated_bones.map((b) => vn(rig, b));
  const missingReq = REQUIRED_VRM_BONES.filter((b) => !rigBones.includes(b));
  out.push(
    missingReq.length
      ? ['FAIL', `VRM 1.0 humanoid: bone wajib tidak lengkap di rig (${missingReq.join(', ')})`]
      : [
          'PASS',
          `VRM 1.0 humanoid: 15 bone wajib terpenuhi (${rigBones.length} total bone humanoid)`,
        ],
  );

  // 2. Cek bone yang dianimasikan oleh channel pada klip ini
  const clipChannels = Object.keys(clip.channels || {});
  const animatedBones = new Set();
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
      'FAIL',
      `VRM 1.0 humanoid: channel menganimasikan bone di luar standar VRM 1.0: ${invalidBones.join(', ')}`,
    ]);
  } else {
    out.push([
      'PASS',
      `VRM 1.0 humanoid: ${animatedBones.size} bone dianimasikan klip, semua sesuai standar VRM 1.0`,
    ]);
  }

  // 3. Cek translasi hanya di hips (VRMC_vrm_animation melarang translasi selain di hips)
  const nonHipsPos = clipChannels.filter((k) => {
    const chDef = rig.channels[k];
    return chDef?.type === 'pos' && vn(rig, chDef.bone) !== 'hips';
  });
  out.push(
    nonHipsPos.length
      ? [
          'FAIL',
          `VRMC_vrm_animation-1.0 melarang translasi selain di hips (${nonHipsPos.join(', ')})`,
        ]
      : ['PASS', 'VRMC_vrm_animation-1.0: translasi hanya pada hips'],
  );

  if (clip.vrm_spec != null && clip.vrm_spec !== '1.0') {
    out.push([
      'FAIL',
      'VRM 1.0 spesifikasi: vrm_spec "' + clip.vrm_spec + '" ditolak, harus "1.0"',
    ]);
  }

  const ex = clip.expressions || {},
    names = Object.keys(ex);
  if (names.length) {
    const bad = names.filter((n) => !VRM10_EXPRESSIONS.includes(n));
    if (bad.length) {
      out.push(['FAIL', 'VRM 1.0 ekspresi: nama preset tidak standar (' + bad.join(', ') + ')']);
    }
    const oor = names.some((n) => ex[n].some((k) => k[1] < -1e-4 || k[1] > 1.0001));
    if (oor) {
      out.push(['FAIL', 'VRM 1.0 ekspresi: bobot harus di rentang [0, 1]']);
    } else if (!bad.length) {
      out.push([
        'PASS',
        'VRM 1.0 ekspresi: ' +
          names.length +
          ' preset valid (' +
          names.join(', ') +
          ') dalam [0, 1]',
      ]);
    }
  }
  return out;
}

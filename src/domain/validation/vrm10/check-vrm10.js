import { VRM10_BONES, VRM10_EXPRESSIONS, vn } from './constants.js';

export function checkVrm10(rig, ctx, clip) {
  const out = [];
  const bones = rig.animated_bones.map((b) => vn(rig, b));
  const miss = VRM10_BONES.filter((b) => !bones.includes(b));

  out.push(
    miss.length
      ? ['FAIL', 'VRM 1.0 humanoid: bone wajib hilang (' + miss.join(', ') + ')']
      : [
          'PASS',
          'VRM 1.0 humanoid: 55 bone VRMC_vrm-1.0 terdefinisi (22 badan + 30 jari + 2 mata + 1 rahang), semua bone wajib lengkap',
        ],
  );

  const np = Object.keys(rig.channels).filter(
    (k) => rig.channels[k].type === 'pos' && vn(rig, rig.channels[k].bone) !== 'hips',
  );
  out.push(
    np.length
      ? ['FAIL', 'VRMC_vrm_animation-1.0 melarang translasi selain di hips (' + np.join(', ') + ')']
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

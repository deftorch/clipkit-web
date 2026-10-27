import { FORMAT_VERSION } from '../vrm10/constants.js';

export function versionIssues(version, changelog, fv = 1) {
  const out = [];
  if (fv > FORMAT_VERSION) {
    out.push([
      'FAIL',
      `format_version ${fv} lebih baru dari yang didukung (${FORMAT_VERSION})`
    ]);
  }
  if (!Array.isArray(changelog) || !changelog.length) {
    out.push(['WARN', `v${version} tanpa changelog`]);
    return out;
  }
  let ok = true;
  changelog.forEach((e, i) => {
    if (!e || +e.v !== i + 1 || !String(e.catatan || '').trim()) ok = false;
  });
  if (!ok) {
    out.push(['FAIL', 'changelog tidak valid (harus berurutan v1..vN, tiap entri punya catatan)']);
  } else if (changelog[changelog.length - 1].v !== version) {
    out.push([
      'FAIL',
      `version ${version} tetapi changelog berakhir di v${changelog[changelog.length - 1].v}`
    ]);
  } else {
    out.push([
      'PASS',
      `versi v${version}, format ${fv}, changelog ${changelog.length} entri konsisten`
    ]);
  }
  return out;
}

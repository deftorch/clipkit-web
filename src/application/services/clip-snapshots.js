import historyData from '../../data/history.json';
import keysData from '../../data/keys.json';

export const stable = (o) =>
  JSON.stringify(o, (k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.keys(v)
          .sort()
          .reduce((a, kk) => {
            a[kk] = v[kk];
            return a;
          }, {})
      : v,
  );

export function hashString(str) {
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

export function snapshotLines(clip, customHistory = historyData) {
  const out = [];
  const name = clip.name;
  const hist = customHistory[name];
  const ver = clip.version;
  const B = keysData.behaviorKeys;

  if (!Number.isInteger(ver) || ver < 1) {
    return [['FAIL', `version harus bilangan bulat >= 1, ditemukan ${JSON.stringify(ver)}`]];
  }
  if (clip.format_version == null) {
    out.push([
      'FAIL',
      `format_version belum ada (tambahkan "format_version": ${keysData.formatVersion})`,
    ]);
  }
  if (!hist) {
    out.push([
      'WARN',
      `v${ver} belum dirilis (tidak ada snapshot untuk "${name}" di riwayat contoh)`,
    ]);
    return out;
  }
  const vs = Object.keys(hist)
    .map(Number)
    .sort((a, b) => a - b);
  for (const v of vs) {
    if (v > ver) out.push(['FAIL', `snapshot v${v} ada tetapi version klip hanya ${ver}`]);
  }
  if (vs.includes(ver)) {
    const s = hist[ver];
    const diff = B.filter((k) => {
      if (s[k] === undefined && clip[k] === undefined) return false;
      if (typeof s[k] === 'string') {
        const currentHash = clip[k] === undefined ? '' : hashString(stable(clip[k]));
        return currentHash !== s[k];
      }
      return stable(clip[k]) !== stable(s[k]);
    });
    out.push(
      diff.length
        ? [
            'FAIL',
            `isi berubah dari snapshot v${ver} tanpa menaikkan version (beda: ${diff.join(', ')})`,
          ]
        : ['PASS', `isi sama dengan snapshot v${ver}`],
    );
  } else {
    out.push([
      'WARN',
      `v${ver} belum dirilis (snapshot tersimpan: ${vs.map((v) => 'v' + v).join(', ')})`,
    ]);
  }
  return out;
}

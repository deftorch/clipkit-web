import ClipKit from "../../domain/clipkit.js";
import limitsData from "../../data/limits.json";
import historyData from "../../data/history.json";
import keysData from "../../data/keys.json";
import { defaultClips } from "../../data/index.js";
import { rigState } from "./rig-store.js";

export const STORE_KEY = 'clipkit.web.v1';

export const clipState = {
  order: [],
  items: {},
  cur: null,
  counter: 0,
  style: 'stylized',
  tab: 'rig',
  selCh: null
};

const listeners = new Set();
export function onClipStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(clipState);
}

// Formatting JSON: 1 key per line, curves compact
export function fmtClip(c) {
  const J = JSON.stringify;
  const lines = [];
  const keys = Object.keys(c);
  keys.forEach((k, ki) => {
    const v = c[k];
    const comma = ki < keys.length - 1 ? ',' : '';
    if (v && typeof v === 'object' && !Array.isArray(v) && ['channels','windows','claims','move','validate','expressions'].includes(k) && k !== 'move') {
      const ks = Object.keys(v);
      lines.push(` ${J(k)}: {`);
      ks.forEach((kk, i) => lines.push(`  ${J(kk)}: ${J(v[kk])}${i < ks.length - 1 ? ',' : ''}`));
      lines.push(` }${comma}`);
    } else if (Array.isArray(v) && v.length && typeof v[0] === 'object' && !Array.isArray(v[0])) {
      lines.push(` ${J(k)}: [`);
      v.forEach((x, i) => lines.push(`  ${J(x)}${i < v.length - 1 ? ',' : ''}`));
      lines.push(` ]${comma}`);
    } else {
      lines.push(` ${J(k)}: ${J(v)}${comma}`);
    }
  });
  return '{\n' + lines.join('\n') + '\n}';
}

export const stable = (o) =>
  JSON.stringify(o, (k, v) =>
    (v && typeof v === 'object' && !Array.isArray(v))
      ? Object.keys(v).sort().reduce((a, kk) => { a[kk] = v[kk]; return a; }, {})
      : v
  );

export function newItem(id, base, text) {
  return { id, base, text, dirty: false, clip: null, err: null, res: null, lines: [], orig: null };
}

export function snapshotLines(clip) {
  const out = [];
  const name = clip.name;
  const hist = historyData[name];
  const ver = clip.version;
  const B = keysData.behaviorKeys;

  if (!Number.isInteger(ver) || ver < 1) {
    return [['FAIL', `version harus bilangan bulat >= 1, ditemukan ${JSON.stringify(ver)}`]];
  }
  if (clip.format_version == null) {
    out.push(['FAIL', `format_version belum ada (tambahkan "format_version": ${keysData.formatVersion})`]);
  }
  if (!hist) {
    out.push(['WARN', `v${ver} belum dirilis (tidak ada snapshot untuk "${name}" di riwayat contoh)`]);
    return out;
  }
  const vs = Object.keys(hist).map(Number).sort((a, b) => a - b);
  for (const v of vs) {
    if (v > ver) out.push(['FAIL', `snapshot v${v} ada tetapi version klip hanya ${ver}`]);
  }
  if (vs.includes(ver)) {
    const s = hist[ver];
    const diff = B.filter(k => stable(clip[k]) !== stable(s[k]));
    out.push(diff.length
      ? ['FAIL', `isi berubah dari snapshot v${ver} tanpa menaikkan version (beda: ${diff.join(', ')})`]
      : ['PASS', `isi sama dengan snapshot v${ver}`]);
  } else {
    out.push(['WARN', `v${ver} belum dirilis (snapshot tersimpan: ${vs.map(v => 'v' + v).join(', ')})`]);
  }
  return out;
}

export function rebuild(it, rig = rigState.rig, ctx = rigState.ctx, style = clipState.style) {
  it.clip = null;
  it.err = null;
  it.res = null;
  it.lines = [];
  let c;
  try {
    c = JSON.parse(it.text);
  } catch (e) {
    it.err = 'JSON tidak terbaca: ' + e.message;
    return;
  }
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    it.err = 'Klip harus berupa objek JSON.';
    return;
  }
  if (!(typeof c.duration === 'number' && c.duration > 0 && c.duration <= 30)) {
    it.err = 'duration harus angka antara 0 dan 30 detik.';
    return;
  }
  if (c.channels != null && (typeof c.channels !== 'object' || Array.isArray(c.channels))) {
    it.err = 'channels harus objek {nama: [[waktu, nilai, easing], ...]}.';
    return;
  }
  for (const k of Object.keys(c.channels || {})) {
    const a = c.channels[k];
    if (!Array.isArray(a) || !a.length || !a.every(p => Array.isArray(p) && p.length >= 2 && isFinite(p[0]) && isFinite(p[1]))) {
      it.err = `channel "${k}" harus daftar key [waktu, nilai, easing?] dengan angka.`;
      return;
    }
    for (let i = 1; i < a.length; i++) {
      if (a[i][0] < a[i - 1][0]) {
        it.err = `channel "${k}": waktu key harus naik (key ${i + 1} lebih awal dari key ${i}).`;
        return;
      }
    }
  }
  if (c.move) {
    const segs = Array.isArray(c.move) ? c.move : [c.move];
    for (const s of segs) {
      if (!s || !Array.isArray(s.dir) || s.dir.length !== 3 || !isFinite(s.distance)) {
        it.err = 'move butuh {dir:[x,y,z], distance, t0, t1, ease}.';
        return;
      }
    }
  }
  try {
    it.clip = c;
    it.res = ClipKit.validate(rig, ctx, limitsData, c, style);
    it.lines = it.res.lines.concat(ClipKit.checkVrm10(rig, ctx, c), snapshotLines(c));
  } catch (e) {
    it.err = 'Gagal membangun klip: ' + e.message;
    it.clip = null;
    it.res = null;
  }
}

export function rebuildAll(rig = rigState.rig, ctx = rigState.ctx) {
  for (const id of clipState.order) {
    const it = clipState.items[id];
    if (it) rebuild(it, rig, ctx, clipState.style);
  }
  notify();
}

export function curItem() {
  return clipState.items[clipState.cur];
}

export function persist() {
  try {
    const o = {};
    for (const id of clipState.order) {
      const it = clipState.items[id];
      if (it && it.dirty) {
        o[id] = { text: it.text, base: it.base };
      }
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(o));
  } catch (e) {}
}

export function addItem(id, base, text, dirty = false) {
  const it = newItem(id, base, text);
  it.dirty = !!dirty;
  rebuild(it);
  clipState.items[id] = it;
  if (!clipState.order.includes(id)) {
    clipState.order.push(id);
  }
  notify();
  return it;
}

export function selectClip(id) {
  clipState.cur = id;
  clipState.selCh = null;
  notify();
}

export function newClip() {
  let n;
  do {
    clipState.counter++;
    n = 'klip_baru_' + clipState.counter;
  } while (clipState.items[n]);

  const c = {
    name: n,
    format_version: 1,
    version: 1,
    changelog: [{ v: 1, catatan: 'Versi awal.' }],
    group: 'uji',
    tags: ['draft'],
    duration: 1.0,
    loop: false,
    channels: {
      lean: [[0, 0], [0.5, 25, 'inOutSine'], [1, 0, 'inOutSine']],
      armR_elev: [[0, -75], [0.5, 60, 'outQuad'], [1, -75, 'inOutSine']],
      armR_azim: [[0, 0], [0.5, 70, 'outQuad'], [1, 0, 'inOutSine']]
    },
    windows: { hitbox: [0.4, 0.6], cancel: [0.7, 1.0] },
    events: [{ t: 0.4, type: 'sfx', id: 'tes' }],
    claims: { duration: 1.0, tolerance: 0.1 },
    validate: { foot_slide: false }
  };
  const it = addItem(n, null, fmtClip(c), true);
  it.orig = null;
  persist();
  selectClip(n);
  return n;
}

export function initClips() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {};
  } catch (e) {
    saved = {};
  }

  for (const n of Object.keys(defaultClips)) {
    const sv0 = saved[n];
    const orig = fmtClip(defaultClips[n]);
    const it = addItem(n, n, sv0 && typeof sv0.text === 'string' ? sv0.text : orig, !!(sv0 && sv0.text && sv0.text !== orig));
    it.orig = orig;
  }
  for (const id of Object.keys(saved)) {
    if (!clipState.items[id] && saved[id] && typeof saved[id].text === 'string') {
      const it = addItem(id, saved[id].base, saved[id].text, true);
      it.orig = null;
    }
  }
  clipState.cur = clipState.order[0];
  notify();
}

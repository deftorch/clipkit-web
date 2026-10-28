import limitsData from '../../data/limits.json';
import { checkVrm10 } from '../../domain/validation/rules/vrm10.js';
import { validate } from '../../domain/validation/validator.js';
import { snapshotLines } from './clip-snapshots.js';

/**
 * Validates JSON schema, executes domain validation, VRM 1.0 humanoid check,
 * and version snapshot comparison on a clip item.
 */
export function rebuild(it, rig, ctx, style = 'stylized') {
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
  if (c.windows != null && (typeof c.windows !== 'object' || Array.isArray(c.windows))) {
    it.err = 'windows harus objek {nama: [mulai, akhir]}.';
    return;
  }
  if (c.events != null && !Array.isArray(c.events)) {
    it.err = 'events harus array [{t, type, id}, ...].';
    return;
  }
  if (c.claims != null && (typeof c.claims !== 'object' || Array.isArray(c.claims))) {
    it.err = 'claims harus objek {distance, duration, tolerance}.';
    return;
  }
  if (c.validate != null && (typeof c.validate !== 'object' || Array.isArray(c.validate))) {
    it.err = 'validate harus objek opsi validasi.';
    return;
  }
  if (
    c.expressions != null &&
    (typeof c.expressions !== 'object' || Array.isArray(c.expressions))
  ) {
    it.err = 'expressions harus objek {nama: [[waktu, nilai, easing], ...]}.';
    return;
  }
  if (c.vrm_spec != null && (typeof c.vrm_spec !== 'string' || !/^\d+\.\d+$/.test(c.vrm_spec))) {
    it.err = 'vrm_spec harus string versi mayor.minor (contoh "1.0").';
    return;
  }
  if (c.format_version != null && (!Number.isInteger(c.format_version) || c.format_version < 1)) {
    it.err = 'format_version harus bilangan bulat >= 1.';
    return;
  }
  it.clip = c;
  if (rig && ctx) {
    it.res = validate(rig, ctx, limitsData, c, style);
    it.lines = it.res.lines.concat(checkVrm10(rig, ctx, c), snapshotLines(c));
  } else {
    it.lines = [];
    it.res = null;
  }
}

export function rebuildAll(items, order, rig, ctx, style = 'stylized') {
  for (const id of order) {
    const it = items[id];
    if (it) rebuild(it, rig, ctx, style);
  }
}

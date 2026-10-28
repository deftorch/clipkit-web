import { defaultClips } from '../../data/index.js';
import {
  rebuild as pipelineRebuild,
  rebuildAll as pipelineRebuildAll,
} from '../services/clip-pipeline.js';
import { fmtClip } from '../services/clip-serializer.js';
import { snapshotLines, stable } from '../services/clip-snapshots.js';
import { rigState } from './rig-store.js';

export { fmtClip, snapshotLines, stable };

export const STORE_KEY = 'clipkit.web.v1';

export const clipState = {
  order: [],
  items: {},
  cur: null,
  counter: 0,
  style: 'stylized',
  tab: 'rig',
  selCh: null,
};

let clipRepo = null;

export function setClipRepository(repo) {
  clipRepo = repo;
}

export function getClipRepository() {
  return clipRepo;
}

const listeners = new Set();
export function onClipStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(clipState);
}

export function newItem(id, base, text) {
  return { id, base, text, dirty: false, clip: null, err: null, res: null, lines: [], orig: null };
}

export function rebuild(it, rig = rigState.rig, ctx = rigState.ctx, style = clipState.style) {
  pipelineRebuild(it, rig, ctx, style);
}

export function rebuildAll(rig = rigState.rig, ctx = rigState.ctx) {
  pipelineRebuildAll(clipState.items, clipState.order, rig, ctx, clipState.style);
  notify();
}

export function curItem() {
  return clipState.items[clipState.cur];
}

export function persist() {
  if (!clipRepo) return;
  const o = {};
  for (const id of clipState.order) {
    const it = clipState.items[id];
    if (it && it.dirty) {
      o[id] = { text: it.text, base: it.base };
    }
  }
  clipRepo.saveClips(o);
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
      lean: [
        [0, 0],
        [0.5, 25, 'inOutSine'],
        [1, 0, 'inOutSine'],
      ],
      armR_elev: [
        [0, -75],
        [0.5, 60, 'outQuad'],
        [1, -75, 'inOutSine'],
      ],
      armR_azim: [
        [0, 0],
        [0.5, 70, 'outQuad'],
        [1, 0, 'inOutSine'],
      ],
    },
    windows: { hitbox: [0.4, 0.6], cancel: [0.7, 1.0] },
    events: [{ t: 0.4, type: 'sfx', id: 'tes' }],
    claims: { duration: 1.0, tolerance: 0.1 },
    validate: { foot_slide: false },
  };
  const it = addItem(n, null, fmtClip(c), true);
  it.orig = null;
  persist();
  selectClip(n);
  return n;
}

export function initClips(repo = clipRepo) {
  if (repo) clipRepo = repo;
  const saved = clipRepo ? clipRepo.loadSavedClips() : {};

  for (const n of Object.keys(defaultClips)) {
    const sv0 = saved[n];
    const orig = fmtClip(defaultClips[n]);
    const it = addItem(
      n,
      n,
      sv0 && typeof sv0.text === 'string' ? sv0.text : orig,
      !!(sv0 && sv0.text && sv0.text !== orig),
    );
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

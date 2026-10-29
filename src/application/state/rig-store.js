import { loadRigs } from '../../data/load-rigs.js';
import ClipKit from '../../domain/clipkit.js';

const { motus, vrm_sample } = loadRigs();

export const baseMotusRig = motus;

export const RIGS = {
  motus,
  vrm_sample: vrm_sample.rig,
};

export const RIGINFO = {
  vrm_sample: vrm_sample.info,
};

let meshRenderer = null;
let rigLoader = null;

export function setMeshRenderer(renderer) {
  meshRenderer = renderer;
}

export function setRigLoader(loader) {
  rigLoader = loader;
}

export function getMeshRenderer() {
  return meshRenderer;
}

export function getRigLoader() {
  return rigLoader;
}

// Bound buffer cache to prevent memory leaks with multiple large VRMs
export const MESHBUF = {};
const MAX_MESH_BUFS = 3;
const meshBufKeys = [];

export function setMeshBuf(key, buffer) {
  if (meshBufKeys.length >= MAX_MESH_BUFS) {
    const oldest = meshBufKeys.shift();
    delete MESHBUF[oldest];
  }
  if (!meshBufKeys.includes(key)) {
    meshBufKeys.push(key);
  }
  MESHBUF[key] = buffer;
}

export const rigState = {
  rigKey: 'vrm_sample',
  rig: RIGS.vrm_sample,
  ctx: ClipKit.makeCtx(RIGS.vrm_sample),
  rigErr: null,
  meshMsg: null,
  glReady: false,
};

const listeners = new Set();
export function onRigChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(rigState);
}

export function rigLabel(k) {
  if (k === 'motus') return 'MotusMan (Tampilan Bone Saja)';
  if (k === 'deft') return 'VRM 1.0 · Deft (deft.vrm)';
  return 'VRM 1.0 · ' + (RIGS[k]?.name || k);
}

export async function loadDefaultModel(glCanvas, onLoaded) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return null;
  try {
    const res = await fetch('/models/deft.vrm');
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (!rigLoader) return null;
    const { rig: nr, info } = rigLoader.parseRigFile(buffer, 'deft.vrm', baseMotusRig);
    info.fileName = 'deft.vrm';
    info.size = buffer.byteLength;
    const key = 'deft';
    RIGS[key] = nr;
    RIGINFO[key] = info;
    setMeshBuf(key, buffer);
    setRig(key, onLoaded, glCanvas, onLoaded);
    return { rig: nr, info };
  } catch (err) {
    console.warn('Preload /models/deft.vrm:', err);
    return null;
  }
}

export function setRig(k, onAfterSet, glCanvas, onMeshLoaded) {
  if (!RIGS[k]) return;
  rigState.rigKey = k;
  rigState.rig = RIGS[k];
  rigState.ctx = ClipKit.makeCtx(rigState.rig);
  rigState.rigErr = null;
  rigState.meshMsg = null;

  if (MESHBUF[k]) {
    ensureMesh(k, glCanvas, onMeshLoaded);
  } else {
    if (meshRenderer) meshRenderer.unload();
  }

  notify();
  if (onAfterSet) onAfterSet(rigState);
}

export function ensureMesh(k, glCanvas, onMeshLoaded) {
  if (!meshRenderer) {
    rigState.meshMsg = 'Pustaka render tidak termuat.';
    notify();
    return;
  }
  try {
    if (!rigState.glReady && glCanvas) {
      meshRenderer.mount(glCanvas);
      rigState.glReady = true;
    }
  } catch (_e) {
    rigState.meshMsg = 'WebGL tidak tersedia di browser ini, jadi mesh tidak bisa dirender.';
    notify();
    return;
  }
  rigState.meshMsg = 'Memuat mesh...';
  notify();

  meshRenderer
    .load(k, MESHBUF[k])
    .then((inf) => {
      if (rigState.rigKey !== k) return;
      if (!RIGINFO[k]) RIGINFO[k] = {};
      RIGINFO[k].mesh = inf;
      rigState.meshMsg = null;
      notify();
      if (onMeshLoaded) onMeshLoaded(inf);
    })
    .catch((e) => {
      rigState.meshMsg = e.message;
      notify();
    });
}

export function loadVrmFile(f, glCanvas, onSuccess, onError, onMeshLoaded) {
  const r = new FileReader();
  r.onerror = () => {
    rigState.rigErr = 'File tidak bisa dibaca.';
    notify();
    if (onError) onError(rigState.rigErr);
  };
  r.onload = () => {
    try {
      if (!rigLoader) throw new Error('Rig loader is not configured');
      const { rig: nr, info } = rigLoader.parseRigFile(r.result, f.name, baseMotusRig);
      info.size = f.size;
      const key = 'file:' + f.name;
      RIGS[key] = nr;
      RIGINFO[key] = info;
      setMeshBuf(key, r.result);
      setRig(key, onSuccess, glCanvas, onMeshLoaded);
    } catch (e) {
      rigState.rigErr = e.message;
      notify();
      if (onError) onError(e.message);
    }
  };
  r.readAsArrayBuffer(f);
}

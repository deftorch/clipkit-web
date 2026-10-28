import { loadRigs } from '../../data/load-rigs.js';
import ClipKit from '../../domain/clipkit.js';
import VrmView from '../../infrastructure/three/three-mesh-renderer.js';
import { parseGlb } from '../../infrastructure/vrm/glb-parser.js';
import { buildRig } from '../../infrastructure/vrm/vrm-rig-builder.js';

const { motus, vrm_sample } = loadRigs();

export const baseMotusRig = motus;

export const RIGS = {
  motus,
  vrm_sample: vrm_sample.rig,
};

export const RIGINFO = {
  vrm_sample: vrm_sample.info,
};

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
  return k === 'motus' ? 'MotusMan (rig repo)' : 'VRM 1.0 · ' + (RIGS[k]?.name || k);
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
    if (VrmView) VrmView.unload();
  }

  notify();
  if (onAfterSet) onAfterSet(rigState);
}

export function ensureMesh(k, glCanvas, onMeshLoaded) {
  if (!VrmView) {
    rigState.meshMsg = 'Pustaka render tidak termuat.';
    notify();
    return;
  }
  try {
    if (!rigState.glReady && glCanvas) {
      VrmView.mount(glCanvas);
      rigState.glReady = true;
    }
  } catch (_e) {
    rigState.meshMsg = 'WebGL tidak tersedia di browser ini, jadi mesh tidak bisa dirender.';
    notify();
    return;
  }
  rigState.meshMsg = 'Memuat mesh...';
  notify();

  VrmView.load(k, MESHBUF[k])
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
      const parsed = parseGlb(r.result);
      const name = f.name.replace(/\.(vrm|glb)$/i, '');
      const { rig: nr, info } = buildRig(parsed, baseMotusRig, name);
      info.fileName = f.name;
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

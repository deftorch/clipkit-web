import { cameraState, setPresetView, VIEWS } from '../../application/state/camera-store.js';
import { playbackState } from '../../application/state/playback-store.js';
import { loadVrmFile, rigState } from '../../application/state/rig-store.js';

export function initViewportController({
  vpEl,
  viewsEl,
  glCanvas,
  hasMesh,
  onDirty,
  onSetTab,
  onRefreshAll,
  onMeshLoaded,
  onImportAnimation,
}) {
  const ptrs = new Map();
  let pinch = 0;

  vpEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    vpEl.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      pinch = Math.hypot(a[0] - b[0], a[1] - b[1]);
    }
  });

  vpEl.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return;
    const p = ptrs.get(e.pointerId);

    if (ptrs.size === 1) {
      cameraState.yaw -= (e.clientX - p[0]) * 0.008;
      cameraState.pitch = Math.min(
        1.5,
        Math.max(-0.25, cameraState.pitch + (e.clientY - p[1]) * 0.006),
      );
      setViewBtn(null);
    }
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);

    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) {
        cameraState.dist = Math.min(14, Math.max(1.2, (cameraState.dist * pinch) / d));
      }
      pinch = d;
    }
    onDirty();
  });

  const endP = (e) => {
    ptrs.delete(e.pointerId);
    pinch = 0;
  };
  vpEl.addEventListener('pointerup', endP);
  vpEl.addEventListener('pointercancel', endP);

  vpEl.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      cameraState.dist = Math.min(
        14,
        Math.max(1.2, cameraState.dist * Math.exp(e.deltaY * 0.0012)),
      );
      onDirty();
    },
    { passive: false },
  );

  function setViewBtn(k) {
    for (const b of viewsEl.children) {
      b.setAttribute('aria-pressed', String(b.dataset.v === k));
    }
  }

  function syncToggles() {
    const m = viewsEl.querySelector('[data-t=mesh]');
    const k = viewsEl.querySelector('[data-t=skel]');
    const ok = typeof hasMesh === 'function' ? hasMesh(rigState.rigKey) : false;
    if (m) {
      m.disabled = !ok;
      m.setAttribute('aria-pressed', String(playbackState.mesh && ok));
    }
    if (k) {
      k.setAttribute('aria-pressed', String(playbackState.skel || !ok));
    }
  }

  viewsEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.t) {
      const prop = b.dataset.t === 'mesh' ? 'mesh' : 'skel';
      playbackState[prop] = !playbackState[prop];
      if (!playbackState.mesh && !playbackState.skel) {
        playbackState.skel = true;
      }
      syncToggles();
      onDirty();
      return;
    }
    setPresetView(b.dataset.v);
    setViewBtn(b.dataset.v);
    onDirty();
  });

  vpEl.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  vpEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;

    if (/\.(vrma|bvh|json)$/i.test(f.name)) {
      if (onImportAnimation) onImportAnimation(f);
      return;
    }

    if (/\.vrm$/i.test(f.name)) {
      loadVrmFile(
        f,
        glCanvas,
        () => {
          onSetTab('rig');
          onRefreshAll();
        },
        () => {
          onSetTab('rig');
          onRefreshAll();
        },
        onMeshLoaded,
      );
      return;
    }

    if (/\.glb$/i.test(f.name)) {
      loadVrmFile(
        f,
        glCanvas,
        () => {
          onSetTab('rig');
          onRefreshAll();
        },
        () => {
          if (onImportAnimation) {
            onImportAnimation(f);
          } else {
            onSetTab('rig');
            onRefreshAll();
          }
        },
        onMeshLoaded,
      );
    }
  });

  setViewBtn('q');

  return {
    setViewBtn,
    syncToggles,
  };
}

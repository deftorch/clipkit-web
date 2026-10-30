import { createAgentApi } from './application/services/agent-api.js';
import { cameraState, fitCamera } from './application/state/camera-store.js';
import {
  clipState,
  curItem,
  initClips,
  rebuild,
  rebuildAll,
  selectClip,
} from './application/state/clip-store.js';
import { playbackState } from './application/state/playback-store.js';
import {
  loadDefaultModel,
  loadVrmFile,
  rigState,
  setMeshRenderer,
  setRig,
  setRigLoader,
} from './application/state/rig-store.js';
import { C, onThemeChange, winColor } from './application/theme.js';
import ClipKit from './domain/clipkit.js';
import { importBvhToClip } from './infrastructure/mocap/bvh-parser.js';
import { importFbxToClip } from './infrastructure/mocap/fbx-importer.js';
import { LocalStorageClipRepository } from './infrastructure/storage/local-storage-clip-repo.js';
import VrmView from './infrastructure/three/three-mesh-renderer.js';
import { parseGlb } from './infrastructure/vrm/glb-parser.js';
import VrmRig, { buildRig } from './infrastructure/vrm/vrm-rig-builder.js';
import { buildVrmaGlb } from './infrastructure/vrma/vrma-exporter.js';
import { importVrmaToClip } from './infrastructure/vrma/vrma-importer.js';
import { renderClipbar } from './presentation/components/clipbar.js';
import { renderPipe } from './presentation/components/pipeline-status.js';
import { initTransport, syncPlayBtn } from './presentation/components/transport.js';
import { PlaybackController } from './presentation/controllers/playback-controller.js';
import { $ } from './presentation/dom/h.js';
import { renderContactSheet } from './presentation/export/contact-sheet-renderer.js';
import { renderAbout } from './presentation/panels/about-panel.js';
import { renderCurves, updatePlayhead } from './presentation/panels/curves-panel.js';
import { renderEditor, syncEditor } from './presentation/panels/editor-panel.js';
import { PanelRegistry } from './presentation/panels/panel-registry.js';
import { renderRig } from './presentation/panels/rig-panel.js';
import { renderValid } from './presentation/panels/validation-panel.js';
import { renderVer } from './presentation/panels/versions-panel.js';
import { initTheme } from './presentation/theme/theme-observer.js';
import { initTimelineScrubber } from './presentation/timeline/scrubber.js';
import { drawTimeline } from './presentation/timeline/timeline-renderer.js';
import { drawScene } from './presentation/viewport/scene-renderer.js';
import { initViewportController } from './presentation/viewport/viewport-controller.js';

// 1. Dependency Inversion: Inject infrastructure implementations into application layer
setMeshRenderer(VrmView);
setRigLoader({
  parseRigFile: (buffer, fileName, baseRig) => {
    const parsed = parseGlb(buffer);
    const name = fileName.replace(/\.(vrm|glb)$/i, '');
    const { rig, info } = buildRig(parsed, baseRig, name);
    info.fileName = fileName;
    return { rig, info };
  },
});

// 2. Initialize storage repository and load default & saved clips
initClips(new LocalStorageClipRepository());

// 3. Initialize DOM theme listener
initTheme();
onThemeChange(() => dirtyAll());

// 4. Canvas & Host Elements
const vp = $('#vp');
const cv = $('#cv');
const g = cv.getContext('2d');
const glCanvas = $('#gl');

const tlHost = $('#tl');
const tlc = $('#tlc');
const tg = tlc.getContext('2d');

let W = 300,
  H = 200,
  DPR = 1;
let TW = 300,
  TH = 170;
let needDraw = true,
  tlDirty = true;

export function dirtyAll() {
  needDraw = true;
  tlDirty = true;
}

function sizeCanvas(c, host) {
  const r = host.getBoundingClientRect();
  const d = window.devicePixelRatio || 1;
  c.width = Math.max(1, Math.round(r.width * d));
  c.height = Math.max(1, Math.round(r.height * d));
  return { w: r.width, h: r.height, d };
}

// 5. Panel Registry setup
const panelRegistry = new PanelRegistry();

panelRegistry.register({
  id: 'rig',
  el: $('#p-rig'),
  render: () => renderRig($('#p-rig'), $('#vrmIn')),
});

panelRegistry.register({
  id: 'valid',
  el: $('#p-valid'),
  render: () => renderValid($('#p-valid')),
});

panelRegistry.register({
  id: 'edit',
  el: $('#p-edit'),
  render: ({ fromEditor = false }) => {
    if (fromEditor) syncEditor(false);
    else syncEditor(true);
  },
  onSelect: () => syncEditor(true),
});

panelRegistry.register({
  id: 'curves',
  el: $('#p-curves'),
  render: ({ fromEditor = false }) => {
    if (clipState.tab === 'curves' || !fromEditor) {
      renderCurves($('#p-curves'), dirtyAll, () => syncPlayBtn($('#bPlay')));
    }
  },
  onSelect: () => renderCurves($('#p-curves'), dirtyAll, () => syncPlayBtn($('#bPlay'))),
});

panelRegistry.register({
  id: 'ver',
  el: $('#p-ver'),
  render: () => renderVer($('#p-ver')),
});

panelRegistry.register({
  id: 'about',
  el: $('#p-about'),
  render: () => renderAbout($('#p-about')),
});

export function setTab(p) {
  clipState.tab = p;
  panelRegistry.setTab(p, $('#ptabs'));
}

$('#ptabs')?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && b.dataset.p) setTab(b.dataset.p);
});

export function refreshAll(fromEditor = false) {
  renderPipe($('#pipe'));
  renderClipbar({
    barEl: $('#clipbar'),
    vrmInputEl: $('#vrmIn'),
    glCanvas,
    onMeshLoaded: handleMeshLoaded,
    onSelectClip: (id) => handleSelectClip(id),
    onAfterRigChange: () => handleAfterRigChange(),
    onRefreshAll: () => refreshAll(),
  });
  panelRegistry.refreshAll({ fromEditor });
  dirtyAll();
}

function handleSelectClip(id) {
  selectClip(id);
  playbackState.t = 0;
  playbackState.playing = true;
  syncPlayBtn($('#bPlay'));
  fitCamera(curItem());
  refreshAll();
}

function handleAfterRigChange() {
  rebuildAll();
  playbackState.t = 0;
  playbackState.playing = true;
  syncPlayBtn($('#bPlay'));
  fitCamera(curItem());
  viewportCtrl.syncToggles();
  refreshAll();
}

function handleMeshLoaded(_inf) {
  playbackState.mesh = true;
  playbackState.skel = false;
  if (viewportCtrl) viewportCtrl.syncToggles();
  renderRig($('#p-rig'), $('#vrmIn'));
  dirtyAll();
}

export async function handleImportAnimationFile(file, options = {}) {
  const name = file.name || 'imported';
  const ext = name.split('.').pop().toLowerCase();
  let clip;
  let report;

  try {
    if (ext === 'vrma' || ext === 'glb') {
      const buffer = await file.arrayBuffer();
      const res = importVrmaToClip(buffer, {
        name: name.replace(/\.(vrma|glb)$/i, ''),
        ...options,
      });
      clip = res.clip;
      report = res.telemetry;
    } else if (ext === 'fbx') {
      const buffer = await file.arrayBuffer();
      const res = importFbxToClip(buffer, {
        name: name.replace(/\.fbx$/i, ''),
        ...options,
      });
      clip = res.clip;
      report = res.telemetry;
    } else if (ext === 'bvh') {
      const text = await file.text();
      const res = importBvhToClip(text, {
        name: name.replace(/\.bvh$/i, ''),
        ...options,
      });
      clip = res.clip;
      report = res.telemetry;
    } else if (ext === 'json') {
      const text = await file.text();
      clip = JSON.parse(text);
    } else {
      throw new Error(`Format file tidak didukung: .${ext}`);
    }

    let clipName = (clip.name || name.replace(/\.[^.]+$/, '')).replace(/[^\w-]/g, '_') || 'impor';
    while (clipState.items[clipName]) {
      clipName += '_2';
    }
    clip.name = clipName;

    const it = addItem(clipName, null, fmtClip(clip), true);
    it.orig = null;
    it.importTelemetry = report;
    rebuild(it, rigState.rig, rigState.ctx, clipState.style);
    persist();
    selectClip(clipName);
    setTab('edit');
    refreshAll();

    return { clip, report, item: it };
  } catch (err) {
    console.error('Import error:', err);
    const edstat = $('#edstat');
    if (edstat) {
      edstat.textContent = `Gagal mengimpor: ${err.message}`;
      edstat.className = 'edstat bad';
    }
    setTab('edit');
    throw err;
  }
}

// 6. Viewport and Scrubber Controllers
const viewportCtrl = initViewportController({
  vpEl: vp,
  viewsEl: $('#views'),
  glCanvas,
  hasMesh: (k) => VrmView.has(k),
  onDirty: dirtyAll,
  onSetTab: setTab,
  onRefreshAll: refreshAll,
  onMeshLoaded: handleMeshLoaded,
  onImportAnimation: handleImportAnimationFile,
});

initTimelineScrubber({
  tlHost,
  onDirty: dirtyAll,
  onSyncPlay: () => syncPlayBtn($('#bPlay')),
});

initTransport({
  bPlay: $('#bPlay'),
  bPrev: $('#bPrev'),
  bNext: $('#bNext'),
  bRestart: $('#bRestart'),
  speedSel: $('#speed'),
  cAuto: $('#cAuto'),
  cTrail: $('#cTrail'),
  cOnion: $('#cOnion'),
  cFollow: $('#cFollow'),
  bVrma: $('#bVrma'),
  bSheet: $('#bSheet'),
  sheetFramesSel: $('#sheetFrames'),
  onExportVrma: (it, rig, ctx) => {
    if (!it || !it.clip) return;
    const blob = buildVrmaGlb(rig, ctx, it.clip);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (it.clip.name || 'anim') + '.vrma';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  },
  onExportContactSheet: (it, rig, ctx, opts = {}) => {
    if (!it || !it.clip) return;
    const res = renderContactSheet(rig, ctx, it.clip, { frameCount: 8, ...opts });
    if (!res || !res.svg) return;
    const blob = new Blob([res.svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${it.clip.name || 'anim'}_sheet.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  },
  onDirty: dirtyAll,
  onSelectClip: handleSelectClip,
});

// File upload input for VRM
$('#vrmIn')?.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (f) {
    loadVrmFile(
      f,
      glCanvas,
      () => {
        setTab('rig');
        handleAfterRigChange();
      },
      () => {
        setTab('rig');
        renderRig($('#p-rig'), $('#vrmIn'));
      },
      handleMeshLoaded,
    );
  }
  e.target.value = '';
});

// Sizing and ResizeObserver
function resize() {
  const a = sizeCanvas(cv, vp);
  W = a.w;
  H = a.h;
  DPR = a.d;
  const b = sizeCanvas(tlc, tlHost);
  TW = b.w;
  TH = b.h;
  dirtyAll();
}

new ResizeObserver(resize).observe(vp);
new ResizeObserver(resize).observe(tlHost);

// 7. Playback Animation Controller
const playbackController = new PlaybackController({
  onTick: () => {
    needDraw = true;
    tlDirty = true;
  },
  onPause: () => {
    syncPlayBtn($('#bPlay'));
  },
  getClip: () => curItem()?.clip,
});

function renderFrame() {
  if (playbackState.follow) needDraw = true;
  if (needDraw) {
    needDraw = false;
    drawScene({
      ctx2d: g,
      glCanvas,
      width: W,
      height: H,
      dpr: DPR,
      meshRenderer: VrmView,
      onMeshError: (e) => {
        rigState.meshMsg = 'Render mesh gagal: ' + e.message;
        viewportCtrl.syncToggles();
        renderRig($('#p-rig'), $('#vrmIn'));
      },
    });
  }
  if (tlDirty) {
    tlDirty = false;
    const it = curItem();
    drawTimeline({
      tlc,
      tg,
      item: it,
      t: playbackState.t,
      colors: C,
      winColor,
      speedSeries: it?.res?.speedSeries,
      fps: ClipKit.FPS,
    });
    updatePlayhead();
  }
  requestAnimationFrame(renderFrame);
}

// Initial Presentation setup
renderAbout($('#p-about'));
renderEditor($('#p-edit'), refreshAll, setTab, handleImportAnimationFile);
setTab('rig');
viewportCtrl.syncToggles();
fitCamera(curItem());
refreshAll();
resize();
syncPlayBtn($('#bPlay'));
playbackController.start();
requestAnimationFrame(renderFrame);

// Load default 3D VRM model (deft.vrm) asynchronously on startup
loadDefaultModel(glCanvas, (inf) => {
  handleMeshLoaded(inf);
  handleAfterRigChange();
});

// 8. Canonical Single Agent API & Backward-compatibility Globals
const agentApi = createAgentApi({
  onExportVrma: (it, rig, ctx) => buildVrmaGlb(rig, ctx, it.clip),
  onImportVrma: (buffer, opts) => importVrmaToClip(buffer, opts),
  onImportBvh: (text, opts) => importBvhToClip(text, opts),
  onImportFbx: (buffer, opts) => importFbxToClip(buffer, opts),
  onRefreshAll: refreshAll,
  onRenderContactSheet: (rig, ctx, clip, opts) => renderContactSheet(rig, ctx, clip, opts),
});

window.clipkit = agentApi;

// Backward-compatibility aliases
window.ClipKit = ClipKit;
window.VrmRig = VrmRig;
window.VrmView = VrmView;
window.__clipkit = {
  S: {
    ...clipState,
    ...playbackState,
  },
  K: ClipKit,
  rebuild,
  curItem,
  refreshAll,
  rig: () => rigState.rig,
  ctx: () => rigState.ctx,
};

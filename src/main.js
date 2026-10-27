import ClipKit from "./domain/clipkit.js";
import VrmRig from "./infrastructure/vrm/vrm-rig-builder.js";
import VrmView from "./infrastructure/three/three-mesh-renderer.js";

import { $, fmt2 } from "./presentation/dom/h.js";
import { C, initTheme, onThemeChange, winColor } from "./application/theme.js";

import { rigState, setRig, loadVrmFile } from "./application/state/rig-store.js";
import {
  clipState,
  initClips,
  curItem,
  rebuild,
  selectClip,
  rebuildAll
} from "./application/state/clip-store.js";
import {
  playbackState,
  setTime,
  setPlaying
} from "./application/state/playback-store.js";
import {
  cameraState,
  camBasis,
  prj,
  fitCamera,
  lerpTarget
} from "./application/state/camera-store.js";

import { drawFigure, drawFloor, floorY } from "./presentation/viewport/skeleton-renderer.js";
import { drawTrails } from "./presentation/viewport/trail-renderer.js";
import { initViewportController } from "./presentation/viewport/viewport-controller.js";

import { drawTimeline } from "./presentation/timeline/timeline-renderer.js";
import { initTimelineScrubber } from "./presentation/timeline/scrubber.js";

import { renderPipe } from "./presentation/components/pipeline-status.js";
import { renderClipbar } from "./presentation/components/clipbar.js";
import { initTransport, syncPlayBtn } from "./presentation/components/transport.js";

import { renderRig } from "./presentation/panels/rig-panel.js";
import { renderValid } from "./presentation/panels/validation-panel.js";
import { renderEditor, syncEditor } from "./presentation/panels/editor-panel.js";
import { renderCurves, updatePlayhead } from "./presentation/panels/curves-panel.js";
import { renderVer } from "./presentation/panels/versions-panel.js";
import { renderAbout } from "./presentation/panels/about-panel.js";

// Expose modules on window for debugging & compatibility
window.ClipKit = ClipKit;
window.VrmRig = VrmRig;
window.VrmView = VrmView;

const FPS = ClipKit.FPS;

// Initialize theme tokens & listeners
initTheme();
onThemeChange(() => dirtyAll());

// Initialize default & saved clips
initClips();

// Canvas & Host Elements
const vp = $('#vp');
const cv = $('#cv');
const g = cv.getContext('2d');
const glCanvas = $('#gl');

const tlHost = $('#tl');
const tlc = $('#tlc');
const tg = tlc.getContext('2d');

let W = 300, H = 200, DPR = 1;
let TW = 300, TH = 170;
let needDraw = true, tlDirty = true;

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

function meshOn() {
  return playbackState.mesh && !!VrmView && VrmView.has(rigState.rigKey);
}

// 3D Scene Rendering
function drawScene() {
  const it = curItem();
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.fillStyle = C['--view'];
  g.fillRect(0, 0, W, H);

  if (!it || !it.clip) {
    g.fillStyle = C['--fail'];
    g.font = '14px ' + getComputedStyle(document.body).fontFamily;
    g.textAlign = 'center';
    g.fillText('Klip belum valid. Perbaiki di tab Editor JSON.', W / 2, H / 2);
    g.textAlign = 'left';
    return;
  }

  if (playbackState.follow) {
    lerpTarget(it, rigState.rig, rigState.ctx, playbackState.t);
  }

  const B = camBasis();
  const KF = (H / 2) / Math.tan((20 * Math.PI) / 180);
  const prjFn = (p) => prj(p, W, H, KF, B);

  const y = floorY(it);
  drawFloor(g, it, y, prjFn, C);

  const P = ClipKit.evalPose(rigState.rig, rigState.ctx, it.clip, playbackState.t);
  const rs = rigState.rig.scale || 1;

  // Bayangan di lantai
  const sh = prjFn([P.pos[0][0], y, P.pos[0][2]]);
  if (sh) {
    g.fillStyle = C['--ink'];
    g.globalAlpha = 0.14;
    g.beginPath();
    g.ellipse(
      sh[0],
      sh[1],
      (0.3 * rs * KF) / sh[2],
      ((0.3 * rs * KF) / sh[2]) * Math.max(0.12, Math.sin(Math.max(cameraState.pitch, 0.1))),
      0,
      0,
      7
    );
    g.fill();
    g.globalAlpha = 1;
  }

  // Panah arah hadap di lantai (+Z)
  const a0 = prjFn([P.root[0], y, P.root[2] + 0.25 * rs]);
  const a1 = prjFn([P.root[0], y, P.root[2] + 0.55 * rs]);
  if (a0 && a1) {
    g.strokeStyle = C['--muted'];
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(a0[0], a0[1]);
    g.lineTo(a1[0], a1[1]);
    g.stroke();
  }

  if (playbackState.trail) {
    drawTrails(g, it, playbackState.t, rigState.ctx, prjFn, C, winColor);
  }

  if (playbackState.onion) {
    for (let f = 0; f < it.res.poses.length; f += 3) {
      drawFigure(g, it.res.poses[f], rigState.ctx, rigState.rig, 0.2, true, prjFn, C, KF);
    }
  }

  if (playbackState.skel || !meshOn()) {
    drawFigure(g, P, rigState.ctx, rigState.rig, 1, false, prjFn, C, KF);
  }

  const mo = meshOn();
  glCanvas.hidden = !mo;
  if (mo) {
    try {
      VrmView.pose(P, rigState.rig);
      VrmView.render(W, H, DPR, B.eye, cameraState.target, 40);
    } catch (e) {
      playbackState.mesh = false;
      playbackState.skel = true;
      rigState.meshMsg = 'Render mesh gagal: ' + e.message;
      viewportCtrl.syncToggles();
      renderRig($('#p-rig'), $('#vrmIn'));
    }
  }

  // HUD
  const fr = Math.round(playbackState.t * FPS);
  const nf = it.res ? it.res.frames : 0;
  const hudTime = $('#hudTime');
  if (hudTime) {
    hudTime.textContent = `t ${fmt2(playbackState.t)} s · frame ${fr}/${nf} · ${it.clip.name || clipState.cur} v${it.clip.version ?? '?'} · rig ${rigState.rig.kind === 'vrm1' ? 'VRM 1.0' : 'MotusMan'}`;
    const ex = P.expr
      ? Object.entries(P.expr)
          .filter((e) => e[1] > 0.02)
          .map((e) => e[0] + ' ' + e[1].toFixed(2))
          .join(' · ')
      : '';
    if (ex) hudTime.textContent += ' · ekspresi: ' + ex;
  }

  const wins = it.clip.windows || {};
  const chips = $('#chips');
  if (chips) {
    for (const ch of chips.children) {
      const w = ch.dataset.w;
      let on = false;
      if (w === 'event') {
        on = (it.clip.events || []).some((e) => Math.abs(playbackState.t - e.t) <= 0.05);
      } else if (wins[w]) {
        on = playbackState.t >= wins[w][0] && playbackState.t <= wins[w][1];
      }
      ch.classList.toggle('on', on);
      if (w === 'event') {
        const evMatch = (it.clip.events || []).find((e) => Math.abs(playbackState.t - e.t) <= 0.05);
        ch.textContent = on && evMatch ? 'event: ' + (evMatch.id ?? evMatch.type) : 'event';
      }
    }
  }
}

// Tab Switching
export function setTab(p) {
  clipState.tab = p;
  const ptabs = $('#ptabs');
  if (ptabs) {
    for (const b of ptabs.children) {
      b.setAttribute('aria-selected', String(b.dataset.p === p));
    }
  }
  for (const id of ['rig', 'valid', 'edit', 'curves', 'ver', 'about']) {
    const elP = $('#p-' + id);
    if (elP) elP.hidden = id !== p;
  }
  if (p === 'edit') syncEditor(true);
  if (p === 'curves') renderCurves($('#p-curves'), dirtyAll, () => syncPlayBtn($('#bPlay')));
}

$('#ptabs')?.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && b.dataset.p) setTab(b.dataset.p);
});

// Refresh All UI Panels
export function refreshAll(fromEditor = false) {
  renderPipe($('#pipe'));
  renderClipbar({
    barEl: $('#clipbar'),
    vrmInputEl: $('#vrmIn'),
    onSelectClip: (id) => handleSelectClip(id),
    onAfterRigChange: () => handleAfterRigChange(),
    onRefreshAll: () => refreshAll()
  });
  renderRig($('#p-rig'), $('#vrmIn'));
  renderValid($('#p-valid'));
  renderVer($('#p-ver'));
  if (clipState.tab === 'curves' || !fromEditor) {
    renderCurves($('#p-curves'), dirtyAll, () => syncPlayBtn($('#bPlay')));
  }
  if (fromEditor) syncEditor(false);
  else syncEditor(true);
  dirtyAll();
}

function handleSelectClip(id) {
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

// Initialize Viewport and Timeline Controllers
const viewportCtrl = initViewportController({
  vpEl: vp,
  viewsEl: $('#views'),
  glCanvas,
  onDirty: dirtyAll,
  onSetTab: setTab,
  onRefreshAll: refreshAll
});

initTimelineScrubber({
  tlHost,
  onDirty: dirtyAll,
  onSyncPlay: () => syncPlayBtn($('#bPlay'))
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
  onDirty: dirtyAll,
  onSelectClip: handleSelectClip
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
      }
    );
  }
  e.target.value = '';
});

// Resize handler
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

// Main Animation Loop
let lastTime = performance.now();
function loop(ts) {
  const dt = Math.min(0.1, (ts - lastTime) / 1000);
  lastTime = ts;
  const it = curItem();

  if (playbackState.playing && it && it.clip) {
    playbackState.t += dt * playbackState.speed;
    if (playbackState.t >= it.clip.duration) {
      if (it.clip.loop || playbackState.auto) {
        playbackState.t = it.clip.loop ? playbackState.t % it.clip.duration : 0;
      } else {
        playbackState.t = it.clip.duration;
        playbackState.playing = false;
        syncPlayBtn($('#bPlay'));
      }
    }
    needDraw = true;
    tlDirty = true;
  }

  if (playbackState.follow) needDraw = true;
  if (needDraw) {
    needDraw = false;
    drawScene();
  }
  if (tlDirty) {
    tlDirty = false;
    drawTimeline({
      tg,
      it,
      TW,
      TH,
      DPR,
      C,
      winColorFn: winColor,
      style: clipState.style,
      t: playbackState.t
    });
    updatePlayhead();
  }
  requestAnimationFrame(loop);
}

// Initial Render setup
renderAbout($('#p-about'));
renderEditor($('#p-edit'), refreshAll, setTab);
setTab('rig');
viewportCtrl.syncToggles();
fitCamera(curItem());
refreshAll();
resize();
syncPlayBtn($('#bPlay'));
requestAnimationFrame(loop);

// Backward-compatibility and global inspection object
window.__clipkit = {
  S: {
    ...clipState,
    ...playbackState
  },
  K: ClipKit,
  rebuild,
  curItem,
  refreshAll,
  rig: () => rigState.rig,
  ctx: () => rigState.ctx
};

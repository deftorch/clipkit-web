import { camBasis, cameraState, lerpTarget, prj } from '../../application/state/camera-store.js';
import { clipState, curItem } from '../../application/state/clip-store.js';
import { playbackState } from '../../application/state/playback-store.js';
import { rigState } from '../../application/state/rig-store.js';
import { C, winColor } from '../../application/theme.js';
import { evalPose } from '../../domain/rig/pose-evaluator.js';
import { FPS } from '../../domain/validation/vrm10/constants.js';
import { fmt2 } from '../dom/h.js';
import { drawFigure, drawFloor, floorY } from './skeleton-renderer.js';
import { drawTrails } from './trail-renderer.js';

export function drawScene({
  ctx2d: g,
  glCanvas,
  width: W,
  height: H,
  dpr: DPR,
  meshRenderer,
  onMeshError,
}) {
  const it = curItem();
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.fillStyle = C['--view'];
  g.fillRect(0, 0, W, H);

  if (!it || !it.clip) {
    g.fillStyle = C['--fail'];
    g.font = '14px sans-serif';
    g.textAlign = 'center';
    g.fillText('Klip belum valid. Perbaiki di tab Editor JSON.', W / 2, H / 2);
    g.textAlign = 'left';
    return;
  }

  if (playbackState.follow) {
    lerpTarget(it, rigState.rig, rigState.ctx, playbackState.t);
  }

  const B = camBasis();
  const KF = H / 2 / Math.tan((20 * Math.PI) / 180);
  const prjFn = (p) => prj(p, W, H, KF, B);

  const y = floorY(it);
  drawFloor(g, it, y, prjFn, C);

  const P = evalPose(rigState.rig, rigState.ctx, it.clip, playbackState.t);
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
      7,
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

  if (playbackState.onion && it.res) {
    for (let f = 0; f < it.res.poses.length; f += 3) {
      drawFigure(g, it.res.poses[f], rigState.ctx, rigState.rig, 0.2, true, prjFn, C, KF);
    }
  }

  const hasMesh = meshRenderer && meshRenderer.has(rigState.rigKey);
  const mo = playbackState.mesh && hasMesh;

  if (playbackState.skel || !mo) {
    drawFigure(g, P, rigState.ctx, rigState.rig, 1, false, prjFn, C, KF);
  }

  if (playbackState.showOverlay && playbackState.overlayClip) {
    const overlayC = {
      ...C,
      '--fig': '#ff9e00',
      '--figL': '#ff7b00',
      '--figR': '#e85d04',
      '--joint': '#ffd166',
    };
    const durO = playbackState.overlayClip.duration || it.clip.duration;
    const tO = Math.min(playbackState.t, durO);
    const PO = evalPose(rigState.rig, rigState.ctx, playbackState.overlayClip, tO);
    drawFigure(g, PO, rigState.ctx, rigState.rig, 0.45, false, prjFn, overlayC, KF);
  }

  if (glCanvas) {
    glCanvas.hidden = !mo;
  }

  if (mo && meshRenderer) {
    try {
      meshRenderer.pose(P, rigState.rig);
      meshRenderer.render(W, H, DPR, B.eye, cameraState.target, 40);
    } catch (e) {
      playbackState.mesh = false;
      playbackState.skel = true;
      if (onMeshError) onMeshError(e);
    }
  }

  // HUD
  const fr = Math.round(playbackState.t * FPS);
  const nf = it.res ? it.res.frames : 0;
  const hudTime = document.getElementById('hudTime');
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
  const chips = document.getElementById('chips');
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

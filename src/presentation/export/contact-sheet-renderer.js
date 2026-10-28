import { DEFAULT_PALETTE, winColor } from '../../application/theme.js';
import { vcross, vdot, vlen, vnorm, vsub } from '../../domain/math/vec3.js';
import { evalPose } from '../../domain/rig/pose-evaluator.js';
import { drawFigure, floorY } from '../viewport/skeleton-renderer.js';
import { SvgContext2D } from './svg-context-2d.js';

function buildCamBasis(yaw, pitch, dist, target) {
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);

  const eye = [target[0] + dist * sy * cp, target[1] + dist * sp, target[2] + dist * cy * cp];

  const f = vnorm(vsub(target, eye));
  let r = vcross(f, [0, 1, 0]);
  if (vlen(r) < 1e-4) r = [1, 0, 0];
  r = vnorm(r);
  const u = vcross(r, f);

  return { eye, f, r, u };
}

function projectPoint(p, offsetX, offsetY, cellW, cellH, KF, B) {
  const d = vsub(p, B.eye);
  const z = vdot(d, B.f);
  if (z < 0.05) return null;
  return [
    offsetX + cellW / 2 + (vdot(d, B.r) / z) * KF,
    offsetY + cellH / 2 - (vdot(d, B.u) / z) * KF,
    z,
  ];
}

/**
 * Renders an annotated multi-frame contact sheet strip or grid with gameplay windows,
 * motion arcs, and camera framing, producing SVG text and a JSON metadata sidecar.
 */
export function renderContactSheet(rig, ctx, clip, options = {}) {
  const frameCount = Math.min(16, Math.max(4, options.frameCount || 8));
  const dur = clip.duration || 1.0;
  const silhouette = !!options.silhouette;
  const viewMode = options.view || 'perspective'; // 'perspective' | 'front' | 'side' | 'multi'

  const views =
    viewMode === 'multi'
      ? [
          { name: 'Front', yaw: 0, pitch: 0.05, dist: 4.2 },
          { name: '3/4 Perspective', yaw: 0.55, pitch: 0.15, dist: 4.2 },
          { name: 'Side', yaw: Math.PI / 2, pitch: 0.05, dist: 4.2 },
        ]
      : [
          {
            name: viewMode,
            yaw: viewMode === 'side' ? Math.PI / 2 : viewMode === 'front' ? 0 : 0.55,
            pitch: viewMode === 'perspective' ? 0.15 : 0.05,
            dist: 4.2,
          },
        ];

  const cellW = 180;
  const cellH = 260;
  const marginX = 24;
  const marginY = 32;
  const timelineH = 48;
  const titleH = 40;

  const totalW = marginX * 2 + frameCount * cellW;
  const totalH = marginY * 2 + titleH + views.length * cellH + timelineH;

  const g = options.ctx2d || new SvgContext2D(totalW, totalH);

  // Palette selection
  const C = { ...DEFAULT_PALETTE };
  if (silhouette) {
    C['--fig'] = '#00f0ff';
    C['--figL'] = '#00f0ff';
    C['--figR'] = '#00b4d8';
    C['--view'] = '#0d1117';
  }

  // Draw background
  g.fillStyle = C['--view'] || '#111318';
  g.fillRect(0, 0, totalW, totalH);

  // Title header
  g.fillStyle = C['--ink'] || '#e6edf3';
  g.font = 'bold 15px sans-serif';
  g.textAlign = 'left';
  const clipName = clip.name || 'Clip';
  g.fillText(
    `ClipKit Contact Sheet — ${clipName} (${dur.toFixed(2)}s, v${clip.version || 1})`,
    marginX,
    26,
  );
  g.font = '11px sans-serif';
  g.fillStyle = C['--muted'] || '#8b949e';
  g.fillText(
    `Frames: ${frameCount} | Silhouette: ${silhouette ? 'ON' : 'OFF'} | Mode: ${viewMode}`,
    marginX + 420,
    26,
  );

  // Sample poses across animation timeline
  const sampleTimes = [];
  const poses = [];
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1);
    sampleTimes.push(t);
    poses.push(evalPose(rig, ctx, clip, t * dur));
  }

  // Calculate bounding box and root travel
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  for (const P of poses) {
    for (const p of P.pos) {
      if (p[0] < minX) minX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[2] < minZ) minZ = p[2];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] > maxY) maxY = p[1];
      if (p[2] > maxZ) maxZ = p[2];
    }
  }

  const r0 = poses[0].root;
  const r1 = poses[poses.length - 1].root;
  const rootTravelVec = [r1[0] - r0[0], r1[1] - r0[1], r1[2] - r0[2]];
  const rootTravelDist = Math.hypot(rootTravelVec[0], rootTravelVec[2]);

  // Center target based on middle pose root
  const midP = poses[Math.floor(poses.length / 2)];
  const camTarget = [midP.root[0], 0.85, midP.root[2]];

  const I = ctx.idx;
  const yFloor = floorY({ res: { floorY: 0.03 } });

  // Render view rows
  for (let rowIdx = 0; rowIdx < views.length; rowIdx++) {
    const v = views[rowIdx];
    const rowY = marginY + titleH + rowIdx * cellH;
    const B = buildCamBasis(v.yaw, v.pitch, v.dist, camTarget);
    const KF = cellH / 2 / Math.tan((20 * Math.PI) / 180);

    // Label for view row
    g.fillStyle = C['--muted'] || '#8b949e';
    g.font = '10px sans-serif';
    g.textAlign = 'left';
    g.fillText(v.name.toUpperCase(), marginX, rowY + 14);

    // Motion Arcs: gather trajectory points for key distal joints
    const distalJoints = [
      { name: 'Head', idx: I.Head, color: '#f9e2af' },
      { name: 'LeftHand', idx: I.LeftHand, color: '#89b4fa' },
      { name: 'RightHand', idx: I.RightHand, color: '#fab387' },
      { name: 'LeftFoot', idx: I.LeftFoot, color: '#a6e3a1' },
      { name: 'RightFoot', idx: I.RightFoot, color: '#f38ba8' },
    ];

    for (let i = 0; i < frameCount; i++) {
      const colX = marginX + i * cellW;
      const t = sampleTimes[i];
      const P = poses[i];

      // Draw cell border
      g.strokeStyle = C['--grid'] || '#21262d';
      g.lineWidth = 1;
      g.strokeRect(colX, rowY, cellW, cellH);

      // Floor line in cell
      const prjFn = (p) => projectPoint(p, colX, rowY, cellW, cellH, KF, B);
      const fl0 = prjFn([-1.5 + midP.root[0], yFloor, midP.root[2]]);
      const fl1 = prjFn([1.5 + midP.root[0], yFloor, midP.root[2]]);
      if (fl0 && fl1) {
        g.strokeStyle = C['--grid2'] || '#30363d';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(fl0[0], fl0[1]);
        g.lineTo(fl1[0], fl1[1]);
        g.stroke();
      }

      // Draw character skeleton figure
      drawFigure(g, P, ctx, rig, 1, false, prjFn, C, KF);

      // Frame timestamp annotation (only on first row)
      if (rowIdx === 0) {
        g.fillStyle = C['--ink'] || '#e6edf3';
        g.font = 'bold 11px monospace';
        g.textAlign = 'left';
        g.fillText(`#${i}  ${(t * dur).toFixed(2)}s`, colX + 8, rowY + 20);

        // Active gameplay windows tags
        const activeWins = [];
        const tSec = t * dur;
        for (const [wn, wRange] of Object.entries(clip.windows || {})) {
          if (tSec >= wRange[0] - 1e-4 && tSec <= wRange[1] + 1e-4) {
            activeWins.push(wn);
          }
        }
        let tagY = rowY + 36;
        for (const tag of activeWins) {
          const col = winColor(tag);
          g.fillStyle = col;
          g.fillRect(colX + 8, tagY - 9, g.measureText(tag).width + 6, 12);
          g.fillStyle = '#000000';
          g.font = '9px monospace';
          g.fillText(tag.toUpperCase(), colX + 11, tagY);
          tagY += 15;
        }
      }
    }

    // Distal motion arcs overlay
    for (const dj of distalJoints) {
      if (dj.idx == null) continue;
      g.strokeStyle = dj.color;
      g.lineWidth = 1.6;
      g.setLineDash([3, 2]);
      g.beginPath();
      let hasStart = false;
      for (let i = 0; i < frameCount; i++) {
        const colX = marginX + i * cellW;
        const prjFn = (p) => projectPoint(p, colX, rowY, cellW, cellH, KF, B);
        const pt = prjFn(poses[i].pos[dj.idx]);
        if (pt) {
          if (hasStart) g.lineTo(pt[0], pt[1]);
          else {
            g.moveTo(pt[0], pt[1]);
            hasStart = true;
          }
        }
      }
      g.stroke();
      g.setLineDash([]);
    }
  }

  // Bottom Timeline Ribbon
  const tlY = totalH - marginY - timelineH + 6;
  const tlW = frameCount * cellW;
  g.fillStyle = '#161b22';
  g.fillRect(marginX, tlY, tlW, timelineH - 12);
  g.strokeStyle = C['--grid'] || '#30363d';
  g.strokeRect(marginX, tlY, tlW, timelineH - 12);

  // Render window bands on timeline
  for (const [wn, wRange] of Object.entries(clip.windows || {})) {
    const x0 = marginX + (wRange[0] / dur) * tlW;
    const x1 = marginX + (wRange[1] / dur) * tlW;
    const col = winColor(wn);
    g.fillStyle = col;
    g.globalAlpha = 0.35;
    g.fillRect(x0, tlY, Math.max(x1 - x0, 2), timelineH - 12);
    g.globalAlpha = 1;
    g.fillStyle = col;
    g.font = '9px monospace';
    g.textAlign = 'left';
    g.fillText(wn, x0 + 4, tlY + 16);
  }

  // Frame tick markers on timeline
  for (let i = 0; i < frameCount; i++) {
    const tx = marginX + (i / (frameCount - 1)) * tlW;
    g.strokeStyle = C['--ink'] || '#e6edf3';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(tx, tlY + timelineH - 18);
    g.lineTo(tx, tlY + timelineH - 12);
    g.stroke();
    g.fillStyle = C['--muted'] || '#8b949e';
    g.font = '9px monospace';
    g.textAlign = 'center';
    g.fillText(`#${i}`, tx, tlY + timelineH - 4);
  }

  // Generate metadata sidecar
  const metadata = {
    clip: clip.name || 'unnamed',
    duration: dur,
    frameCount,
    camera: {
      mode: viewMode,
      target: camTarget,
      views,
    },
    rootTravel: {
      vector: [
        Number(rootTravelVec[0].toFixed(4)),
        Number(rootTravelVec[1].toFixed(4)),
        Number(rootTravelVec[2].toFixed(4)),
      ],
      distance: Number(rootTravelDist.toFixed(4)),
    },
    bounds: {
      min: [Number(minX.toFixed(3)), Number(minY.toFixed(3)), Number(minZ.toFixed(3))],
      max: [Number(maxX.toFixed(3)), Number(maxY.toFixed(3)), Number(maxZ.toFixed(3))],
    },
    windows: clip.windows || {},
    frames: sampleTimes.map((t, idx) => {
      const tSec = Number((t * dur).toFixed(4));
      const activeWindows = [];
      for (const [wn, wRange] of Object.entries(clip.windows || {})) {
        if (tSec >= wRange[0] - 1e-4 && tSec <= wRange[1] + 1e-4) {
          activeWindows.push(wn);
        }
      }
      return {
        index: idx,
        t: Number(t.toFixed(4)),
        timeSec: tSec,
        root: [
          Number(poses[idx].root[0].toFixed(4)),
          Number(poses[idx].root[1].toFixed(4)),
          Number(poses[idx].root[2].toFixed(4)),
        ],
        activeWindows,
      };
    }),
  };

  const svg = g.toSvg ? g.toSvg() : null;

  return {
    svg,
    metadata,
    width: totalW,
    height: totalH,
  };
}

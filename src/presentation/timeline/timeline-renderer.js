import { FPS } from "../../domain/math/vec3.js";
import limitsData from "../../data/limits.json";

export const TL = { l: 54, r: 12, top: 6 };

export const xOf = (t, dur, TW) => TL.l + ((TW - TL.l - TL.r) * t) / dur;

export function drawTimeline({
  tg,
  it,
  TW,
  TH,
  DPR,
  C,
  winColorFn,
  style = 'stylized',
  t = 0
}) {
  tg.setTransform(DPR, 0, 0, DPR, 0, 0);
  tg.clearRect(0, 0, TW, TH);
  tg.font = '11px ' + (getComputedStyle(document.body).getPropertyValue('--font-mono') || 'monospace');

  if (!it || !it.clip) return;
  const dur = it.clip.duration;
  const wins = it.clip.windows || {};
  const names = Object.keys(wins);
  let y = TL.top;
  const laneH = 13;

  tg.textBaseline = 'middle';
  tg.textAlign = 'right';

  for (const w of names) {
    tg.fillStyle = C['--muted'];
    tg.fillText(w, TL.l - 5, y + laneH / 2);
    const a = wins[w];
    if (Array.isArray(a) && a.length === 2) {
      tg.fillStyle = winColorFn(w);
      tg.globalAlpha = 0.85;
      tg.fillRect(
        xOf(a[0], dur, TW),
        y + 1,
        Math.max(2, xOf(a[1], dur, TW) - xOf(a[0], dur, TW)),
        laneH - 2
      );
      tg.globalAlpha = 1;
    }
    y += laneH + 2;
  }

  // Event lane
  tg.fillStyle = C['--muted'];
  tg.fillText('event', TL.l - 5, y + 8);
  tg.textAlign = 'left';

  const evs = it.clip.events || [];
  let lastX = -99;
  let row = 0;
  for (const e of evs.slice().sort((a, b) => a.t - b.t)) {
    const x = xOf(e.t, dur, TW);
    tg.strokeStyle = C['--ink'];
    tg.lineWidth = 1;
    tg.beginPath();
    tg.moveTo(x, y);
    tg.lineTo(x, y + 16);
    tg.stroke();

    row = x - lastX < 56 ? (row + 1) % 2 : 0;
    lastX = x;
    tg.fillStyle = C['--ink'];
    tg.fillText(String(e.id ?? e.type), x + 3, y + 4 + row * 11);
  }
  y += 26;

  // Grafik kecepatan (dinormalisasi terhadap batas warn)
  const gy0 = y;
  const gh = TH - y - 18;
  const lim = limitsData.styles[style] || limitsData.styles.stylized;
  tg.fillStyle = C['--panel'];
  tg.fillRect(TL.l, gy0, TW - TL.l - TL.r, gh);

  const ymax = 2;
  const Y = (v) => gy0 + gh - (Math.min(v, ymax) / ymax) * gh;

  tg.strokeStyle = C['--line'];
  tg.lineWidth = 1;
  tg.strokeRect(TL.l + 0.5, gy0 + 0.5, TW - TL.l - TL.r - 1, gh - 1);

  tg.setLineDash([4, 3]);
  tg.strokeStyle = C['--warn'];
  tg.beginPath();
  tg.moveTo(TL.l, Y(1));
  tg.lineTo(TW - TL.r, Y(1));
  tg.stroke();

  tg.strokeStyle = C['--fail'];
  const yf = Y(lim.ang_speed_fail / lim.ang_speed_warn);
  tg.beginPath();
  tg.moveTo(TL.l, yf);
  tg.lineTo(TW - TL.r, yf);
  tg.stroke();
  tg.setLineDash([]);

  tg.textAlign = 'right';
  tg.fillStyle = C['--warn'];
  tg.fillText('warn', TL.l - 5, Y(1));
  tg.fillStyle = C['--muted'];
  tg.fillText('kec.', TL.l - 5, gy0 + gh - 20);
  tg.fillText('÷batas', TL.l - 5, gy0 + gh - 8);

  const res = it.res;
  if (res) {
    const nf = res.frames;
    const series = (arr, div, col, fill) => {
      tg.beginPath();
      for (let f = 0; f <= nf; f++) {
        const x = xOf(Math.min(f / FPS, dur), dur, TW);
        const yy = Y(arr[f] / div);
        if (f) tg.lineTo(x, yy);
        else tg.moveTo(x, yy);
      }
      if (fill) {
        tg.lineTo(xOf(dur, dur, TW), gy0 + gh);
        tg.lineTo(xOf(0, dur, TW), gy0 + gh);
        tg.closePath();
        tg.globalAlpha = 0.18;
        tg.fillStyle = col;
        tg.fill();
        tg.globalAlpha = 1;
      } else {
        tg.strokeStyle = col;
        tg.lineWidth = 1.6;
        tg.stroke();
      }
    };

    if (res.speedSeries) {
      series(res.speedSeries, lim.ang_speed_warn, C['--accent'], true);
      tg.beginPath();
      for (let f = 0; f <= nf; f++) {
        const x = xOf(Math.min(f / FPS, dur), dur, TW);
        const yy = Y(res.speedSeries[f] / lim.ang_speed_warn);
        if (f) tg.lineTo(x, yy);
        else tg.moveTo(x, yy);
      }
      tg.strokeStyle = C['--accent'];
      tg.lineWidth = 1.6;
      tg.stroke();
    }

    if (res.rootSpeed && res.rootSpeed.some((v) => v > 0.01)) {
      series(res.rootSpeed, lim.root_speed_warn, C['--t-head'], false);
    }
  }

  // Sumbu waktu
  tg.fillStyle = C['--muted'];
  tg.textAlign = 'center';
  tg.textBaseline = 'top';
  const step = dur > 2 ? 0.5 : 0.1;
  for (let tt = 0; tt <= dur + 1e-6; tt += step) {
    const x = xOf(tt, dur, TW);
    tg.strokeStyle = C['--line'];
    tg.beginPath();
    tg.moveTo(x, gy0 + gh);
    tg.lineTo(x, gy0 + gh + 3);
    tg.stroke();
    if (Math.round(tt * 10) % (dur > 2 ? 5 : 2) === 0) {
      tg.fillText(tt.toFixed(1), x, gy0 + gh + 4);
    }
  }

  tg.textAlign = 'left';
  tg.fillStyle = C['--accent'];
  tg.fillText('— sudut', TL.l + 4, gy0 + 3);
  tg.fillStyle = C['--t-head'];
  tg.fillText('— root', TL.l + 56, gy0 + 3);

  // Playhead
  const px = xOf(t, dur, TW);
  tg.strokeStyle = C['--ink'];
  tg.lineWidth = 1.5;
  tg.beginPath();
  tg.moveTo(px, TL.top);
  tg.lineTo(px, gy0 + gh);
  tg.stroke();

  tg.fillStyle = C['--ink'];
  tg.beginPath();
  tg.moveTo(px - 4, TL.top);
  tg.lineTo(px + 4, TL.top);
  tg.lineTo(px, TL.top + 6);
  tg.fill();
}

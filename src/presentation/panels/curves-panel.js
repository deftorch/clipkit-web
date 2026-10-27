import { el, sv, fmt2 } from "../dom/h.js";
import ClipKit from "../../domain/clipkit.js";
import { FPS } from "../../domain/math/vec3.js";
import { clipState, curItem } from "../../application/state/clip-store.js";
import { rigState } from "../../application/state/rig-store.js";
import { playbackState } from "../../application/state/playback-store.js";
import { winColor } from "../../application/theme.js";

const playheads = [];

export function chInfo(cn, rig = rigState.rig) {
  const rg = ClipKit.channelRange(rig, cn);
  const def = ClipKit.channelDefault(rig, cn);
  const c = rig.channels[cn];
  const unit = c ? c.unit : 'deg';
  return {
    rg: rg || [-1, 1],
    def,
    unit: unit === 'deg' ? '°' : ' m',
    desc: c ? c.desc : (rig.aims[cn.slice(0, cn.lastIndexOf('_'))]?.desc || '')
  };
}

export function curvePts(keys, dur, W2, H2, lo, hi) {
  let d = '';
  const n = Math.max(2, Math.ceil(dur * FPS));
  for (let f = 0; f <= n; f++) {
    const t = Math.min(f / FPS, dur);
    const v = ClipKit.sampleKeys(keys, t);
    const x = (t / dur) * W2;
    const y = H2 - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo || 1)) * H2;
    d += (f ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}

export function renderCurves(host, onDirty, onSyncPlay) {
  if (!host) return;
  const it = curItem();
  host.textContent = '';
  playheads.length = 0;
  if (!it || !it.clip) {
    host.append(el('p', { class: 'note', text: 'Klip belum valid.' }));
    return;
  }

  const rig = rigState.rig;
  const all = ClipKit.allChannelNames(rig);
  const cs = Object.keys(it.clip.channels || {}).sort(
    (a, b) => (all.indexOf(a) < 0 ? 999 : all.indexOf(a)) - (all.indexOf(b) < 0 ? 999 : all.indexOf(b))
  );

  if (!cs.length) {
    host.append(el('p', { class: 'note', text: 'Klip ini belum punya channel. Semua channel memakai default rig.' }));
    return;
  }

  if (!clipState.selCh || !cs.includes(clipState.selCh)) {
    clipState.selCh = cs[0];
  }

  const dur = it.clip.duration;
  const cn = clipState.selCh;
  const info = chInfo(cn, rig);
  const keys = it.clip.channels[cn];
  const [lo0, hi0] = info.rg;

  const big = el('div', { class: 'bigplot' });
  const vals = keys.map((k) => k[1]);
  const lo = Math.min(lo0, ...vals);
  const hi = Math.max(hi0, ...vals);

  big.append(
    el(
      'div',
      { class: 'cap' },
      el('span', { class: 'mono', text: cn + ' (' + info.unit.trim() + ')' }),
      el('span', { text: info.desc })
    )
  );

  const VW = 400;
  const VH = 170;
  const pad = 6;
  const svg = sv('svg', {
    viewBox: `0 0 ${VW} ${VH}`,
    preserveAspectRatio: 'none',
    role: 'img',
    'aria-label': 'Kurva channel ' + cn
  });

  const X = (t) => pad + (t / dur) * (VW - 2 * pad);
  const Y = (v) => VH - pad - ((v - lo) / (hi - lo || 1)) * (VH - 2 * pad);

  svg.append(
    sv('rect', {
      x: pad,
      y: Y(hi0),
      width: VW - 2 * pad,
      height: Math.max(0, Y(lo0) - Y(hi0)),
      fill: 'var(--pass)',
      opacity: 0.09
    })
  );

  svg.append(
    sv('line', {
      x1: pad,
      x2: VW - pad,
      y1: Y(info.def),
      y2: Y(info.def),
      stroke: 'var(--muted)',
      'stroke-dasharray': '3 3',
      'stroke-width': 1
    })
  );

  for (const w of Object.keys(it.clip.windows || {})) {
    const a = it.clip.windows[w];
    if (a?.length === 2) {
      svg.append(
        sv('rect', {
          x: X(a[0]),
          y: 0,
          width: Math.max(1, X(a[1]) - X(a[0])),
          height: VH,
          fill: winColor(w),
          opacity: 0.13
        })
      );
    }
  }

  let d = '';
  const n = Math.ceil(dur * FPS);
  for (let f = 0; f <= n; f++) {
    const t = Math.min(f / FPS, dur);
    d += (f ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(ClipKit.sampleKeys(keys, t)).toFixed(1);
  }
  svg.append(
    sv('path', {
      d,
      fill: 'none',
      stroke: 'var(--accent)',
      'stroke-width': 2,
      'vector-effect': 'non-scaling-stroke'
    })
  );

  for (const k of keys) {
    const c = sv('circle', {
      cx: X(k[0]),
      cy: Y(k[1]),
      r: 3.6,
      fill: 'var(--panel)',
      stroke: 'var(--accent)',
      'stroke-width': 1.6,
      'vector-effect': 'non-scaling-stroke'
    });
    c.append(sv('title'));
    c.firstChild.textContent = `t=${k[0]}  nilai=${k[1]}  easing=${k[2] || 'linear'}`;
    svg.append(c);
  }

  const ph = sv('line', {
    y1: 0,
    y2: VH,
    stroke: 'var(--ink)',
    'stroke-width': 1.5,
    'vector-effect': 'non-scaling-stroke'
  });
  svg.append(ph);
  playheads.push({ kind: 'big', el: ph, X, dur });

  const scrub = (e) => {
    const r = svg.getBoundingClientRect();
    playbackState.t =
      Math.round(Math.min(1, Math.max(0, ((e.clientX - r.left) / r.width) * VW / VW)) * dur * FPS) / FPS;
    playbackState.playing = false;
    if (onSyncPlay) onSyncPlay();
    if (onDirty) onDirty();
  };

  let drag = false;
  svg.addEventListener('pointerdown', (e) => {
    drag = true;
    svg.setPointerCapture(e.pointerId);
    scrub(e);
  });
  svg.addEventListener('pointermove', (e) => {
    if (drag) scrub(e);
  });
  svg.addEventListener('pointerup', () => {
    drag = false;
  });

  big.append(svg);
  big.append(
    el(
      'div',
      { class: 'cap' },
      el('span', { class: 'mono', text: `${fmt2(lo0, 0)}..${fmt2(hi0, 0)} range rig` }),
      el('span', { class: 'mono', id: 'bigval', text: '' })
    )
  );
  host.append(big);

  for (const c of cs) {
    const inf = chInfo(c, rig);
    const ks = it.clip.channels[c];
    const [a, b] = inf.rg;
    const out = ks.some((k) => k[1] < a - 1e-4 || k[1] > b + 1e-4);

    const row = el('div', {
      class: 'chrow',
      role: 'button',
      tabindex: '0',
      'aria-selected': String(c === cn)
    });
    const s = sv('svg', { viewBox: '0 0 160 26', preserveAspectRatio: 'none' });
    s.append(
      sv('path', {
        d: curvePts(ks, dur, 160, 26, a, b),
        fill: 'none',
        stroke: out ? 'var(--warn)' : 'var(--accent)',
        'stroke-width': 1.4,
        'vector-effect': 'non-scaling-stroke'
      })
    );

    const l = sv('line', {
      y1: 0,
      y2: 26,
      stroke: 'var(--ink)',
      'stroke-width': 1,
      'vector-effect': 'non-scaling-stroke'
    });
    s.append(l);
    playheads.push({ kind: 'mini', el: l, dur, W2: 160 });

    const v = el('span', { class: 'v', text: '' });
    playheads.push({ kind: 'val', el: v, c, unit: inf.unit });

    row.append(el('span', { class: 'n', title: c, text: c }), s, v);
    row.onclick = () => {
      clipState.selCh = c;
      renderCurves(host, onDirty, onSyncPlay);
    };
    row.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.onclick();
      }
    };
    host.append(row);
  }

  host.append(
    el('p', {
      class: 'note',
      text: 'Pita hijau di grafik besar adalah range anatomi dari rig; garis putus-putus adalah nilai default. Kurva oranye berarti ada key di luar range.'
    })
  );

  updatePlayhead();
}

export function updatePlayhead() {
  const it = curItem();
  if (!it || !it.clip || clipState.tab !== 'curves') return;
  const t = playbackState.t;

  for (const p of playheads) {
    if (p.kind === 'big') {
      const x = p.X(t);
      p.el.setAttribute('x1', x);
      p.el.setAttribute('x2', x);
    } else if (p.kind === 'mini') {
      const x = (t / p.dur) * p.W2;
      p.el.setAttribute('x1', x);
      p.el.setAttribute('x2', x);
    } else if (p.kind === 'val') {
      p.el.textContent = fmt2(ClipKit.sampleKeys(it.clip.channels[p.c], t), p.unit === ' m' ? 3 : 1) + p.unit;
    }
  }

  const bv = document.getElementById('bigval');
  if (bv && clipState.selCh && it.clip.channels[clipState.selCh]) {
    bv.textContent = 't=' + fmt2(t) + '  ' + fmt2(ClipKit.sampleKeys(it.clip.channels[clipState.selCh], t), 2);
  }
}

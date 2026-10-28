import {
  clipState,
  curItem,
  fmtClip,
  persist,
  rebuild,
  stable,
} from '../../application/state/clip-store.js';
import { playbackState, setOverlayClip } from '../../application/state/playback-store.js';
import { rigState } from '../../application/state/rig-store.js';
import historyData from '../../data/history.json';
import { defaultClips } from '../../data/index.js';
import keysData from '../../data/keys.json';
import limitsData from '../../data/limits.json';
import { compareClips } from '../../domain/animation/compare.js';
import { composeClips } from '../../domain/animation/compose.js';
import {
  applyOverlap,
  closeLoop,
  mirrorClip,
  retimeClip,
} from '../../domain/animation/edit-operations.js';
import ClipKit from '../../domain/clipkit.js';
import { FPS } from '../../domain/math/vec3.js';
import { el, fmt2 } from '../dom/h.js';

let diffV = null;
let compareTargetId = null;

export function renderVer(host) {
  if (!host) return;
  const it = curItem();
  host.textContent = '';
  if (!it || !it.clip) {
    host.append(el('p', { class: 'note', text: 'Klip belum valid.' }));
    return;
  }

  const c = it.clip;
  host.append(
    el('h3', { text: `${c.name} · versi ${c.version ?? '?'} · format ${c.format_version ?? '?'}` }),
  );

  const ul = el('ul', { class: 'cl' });
  for (const e of c.changelog || []) {
    ul.append(el('li', {}, el('b', { text: 'v' + e.v }), el('span', { text: e.catatan })));
  }
  if (!c.changelog?.length) {
    ul.append(el('li', {}, el('b', { text: '-' }), el('span', { text: 'Belum ada changelog.' })));
  }
  host.append(ul);

  // Variant & Edit Operations Section
  host.append(el('h3', { text: 'Operasi Varian & Edit Cepat' }));
  const applyEdit = (modifiedClip, note) => {
    it.text = fmtClip(modifiedClip);
    it.dirty = true;
    rebuild(it);
    persist();
    renderVer(host);
  };

  const btnMirror = el('button', { class: 'btn', text: 'Mirror Gerakan' });
  btnMirror.onclick = () => {
    const mirrored = mirrorClip(c);
    applyEdit(mirrored, 'Mirrored motion');
  };

  const btnRetimeFaster = el('button', { class: 'btn', text: 'Retime (x0.8 Cepat)' });
  btnRetimeFaster.onclick = () => {
    const retimed = retimeClip(c, 0.8);
    applyEdit(retimed, 'Sped up 20%');
  };

  const btnRetimeSlower = el('button', { class: 'btn', text: 'Retime (x1.2 Lambat)' });
  btnRetimeSlower.onclick = () => {
    const retimed = retimeClip(c, 1.2);
    applyEdit(retimed, 'Slowed down 20%');
  };

  const btnCloseLoop = el('button', { class: 'btn', text: 'Tutup Loop' });
  btnCloseLoop.onclick = () => {
    const looped = closeLoop(c);
    applyEdit(looped, 'Closed animation loop');
  };

  const btnOverlap = el('button', {
    class: 'btn',
    text: 'Overlap (Rantai Kinetik)',
  });
  btnOverlap.onclick = () => {
    const overlapped = applyOverlap(c);
    applyEdit(overlapped, 'Applied automated overlap and kinetic chain follow-through');
  };

  const editRow = el(
    'div',
    { class: 'btnrow' },
    btnMirror,
    btnRetimeFaster,
    btnRetimeSlower,
    btnCloseLoop,
    btnOverlap,
  );

  if (c.layers && c.layers.length > 0) {
    const btnCompose = el('button', { class: 'btn primary', text: 'Ratakan Layer (Compose)' });
    btnCompose.onclick = () => {
      const { clip: composed } = composeClips(c, c.layers);
      delete composed.layers;
      applyEdit(composed, 'Flattened layers');
    };
    editRow.append(btnCompose);
  }
  host.append(editRow);

  // 2. A/B Kinematic Comparison & 3D Ghost Figure Overlay
  host.append(el('h3', { text: 'Bandingkan Klip A/B (Kinematika & Overlay 3D)' }));

  const candidateClips = [];
  const baseDef = defaultClips[c.name];
  if (baseDef && baseDef !== c) {
    candidateClips.push({
      id: '__baseline__',
      label: `${c.name} (Baseline Default)`,
      clip: baseDef,
    });
  }
  for (const id of clipState.order || []) {
    const item = clipState.items[id];
    if (item?.clip && item.clip !== c) {
      candidateClips.push({
        id,
        label: `${item.clip.name || id} (Tab ${id})`,
        clip: item.clip,
      });
    }
  }

  if (candidateClips.length > 0) {
    if (!compareTargetId || !candidateClips.some((cand) => cand.id === compareTargetId)) {
      compareTargetId = candidateClips[0].id;
    }

    const selCompare = el('select', { id: 'compareSel', 'aria-label': 'Pilih Klip Pembanding' });
    for (const cand of candidateClips) {
      const opt = el('option', { value: cand.id, text: cand.label });
      if (cand.id === compareTargetId) opt.selected = true;
      selCompare.append(opt);
    }

    const targetCand =
      candidateClips.find((cand) => cand.id === compareTargetId) || candidateClips[0];
    const targetClip = targetCand.clip;

    const overlayActive = playbackState.showOverlay && playbackState.overlayClip;
    const overlayBtn = el('button', {
      class: 'btn' + (overlayActive ? ' primary' : ''),
      text: overlayActive ? 'A/B Overlay 3D: AKTIF (Oranye)' : 'A/B Overlay 3D: MATI',
    });
    overlayBtn.onclick = () => {
      const nextShow = !playbackState.showOverlay;
      setOverlayClip(targetClip, nextShow);
      renderVer(host);
    };

    selCompare.onchange = () => {
      compareTargetId = selCompare.value;
      const newTarget = candidateClips.find((cand) => cand.id === compareTargetId)?.clip;
      if (playbackState.showOverlay && newTarget) {
        setOverlayClip(newTarget, true);
      }
      renderVer(host);
    };

    host.append(
      el(
        'div',
        { class: 'btnrow' },
        selCompare,
        overlayBtn,
        el('span', {
          class: 'hint',
          text: `lawan: klip kerja di editor (${c.name} v${c.version})`,
        }),
      ),
    );

    if (targetClip) {
      const comp = compareClips(rigState.rig, rigState.ctx, limitsData, targetClip, c);
      const diffCard = el(
        'div',
        { class: 'diffcard' },
        el(
          'div',
          { class: 'diffrow' },
          `Durasi:       ${comp.metricsA.duration.toFixed(2)}s -> ${comp.metricsB.duration.toFixed(2)}s (${comp.diff.duration >= 0 ? '+' : ''}${comp.diff.duration}s)`,
        ),
        el(
          'div',
          { class: 'diffrow' },
          `Root Travel:  ${comp.metricsA.rootTravel.toFixed(2)}m -> ${comp.metricsB.rootTravel.toFixed(2)}m (${comp.diff.rootTravel >= 0 ? '+' : ''}${comp.diff.rootTravel}m)`,
        ),
        el(
          'div',
          { class: 'diffrow' },
          `Airtime:      ${comp.metricsA.airtime.toFixed(2)}s -> ${comp.metricsB.airtime.toFixed(2)}s (${comp.diff.airtime >= 0 ? '+' : ''}${comp.diff.airtime}s)`,
        ),
        el(
          'div',
          { class: 'diffrow' },
          `Kecepatan Sudut Maks: ${comp.metricsA.peakAngularSpeed.toFixed(0)}°/s -> ${comp.metricsB.peakAngularSpeed.toFixed(0)}°/s`,
        ),
      );
      host.append(diffCard);
    }
  } else {
    host.append(
      el('p', {
        class: 'note',
        text: 'Buka klip lain di tab atau buat varian baru untuk membandingkan A/B.',
      }),
    );
  }

  // 3. Release Snapshot Diff Section (history.json Hash Fingerprints)
  const hist = historyData[c.name];
  const vs = hist
    ? Object.keys(hist)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  host.append(el('h3', { text: 'Bandingkan dengan Snapshot Rilis (history.json)' }));
  if (!vs.length) {
    host.append(
      el('p', {
        class: 'note',
        text: 'Tidak ada snapshot rilis untuk klip ini di history.json.',
      }),
    );
    return;
  }

  if (!vs.includes(diffV)) {
    diffV = vs[vs.length - 1];
  }

  const sel = el('select', { id: 'diffSel', 'aria-label': 'Snapshot Rilis' });
  for (const v of vs) {
    const o = el('option', { value: v, text: `${c.name}@v${v}` });
    if (v === diffV) o.selected = true;
    sel.append(o);
  }
  sel.onchange = () => {
    diffV = +sel.value;
    renderVer(host);
  };

  host.append(
    el(
      'div',
      { class: 'btnrow' },
      sel,
      el('span', { class: 'hint', text: `fingerprint rilis lawan klip kerja (v${c.version})` }),
    ),
  );

  const s = hist[diffV];
  const dk = keysData.behaviorKeys.filter((k) => stable(c[k]) !== stable(s[k]));
  if (!dk.length) {
    host.append(
      el('p', {
        class: 'diffrow',
        text: 'Tidak ada beda pada isi yang memengaruhi gerak atau gameplay.',
      }),
    );
  }

  for (const k of dk) {
    const isGameplay = keysData.gameplayKeys.includes(k);
    host.append(
      el(
        'div',
        { class: 'diffrow' + (isGameplay ? ' g' : '') },
        (isGameplay ? '! ' : '  ') + k + ' berubah' + (isGameplay ? ' (memengaruhi gameplay)' : ''),
      ),
    );
  }

  for (const k of ['duration', 'loop']) {
    if (dk.includes(k)) {
      host.append(
        el(
          'div',
          { class: 'diffrow g' },
          `   ${k}: ${JSON.stringify(s[k])} -> ${JSON.stringify(c[k])}`,
        ),
      );
    }
  }

  for (const k of ['windows', 'move', 'events', 'claims']) {
    if (dk.includes(k)) {
      host.append(
        el('div', { class: 'diffrow' }, `   ${k} lama: ${JSON.stringify(s[k])}`),
        el('div', { class: 'diffrow' }, `   ${k} baru: ${JSON.stringify(c[k])}`),
      );
    }
  }

  if (dk.includes('channels') && s.channels && typeof s.channels === 'object') {
    const names = new Set([...Object.keys(s.channels || {}), ...Object.keys(c.channels || {})]);
    const rows = [];
    const dur = Math.max(s.duration || 0, c.duration || 0);
    const rig = rigState.rig;

    for (const n of names) {
      const A = s.channels?.[n];
      const Bk = c.channels?.[n];
      if (stable(A) === stable(Bk)) continue;
      let mx = 0,
        mt = 0;
      for (let f = 0; f <= Math.ceil(dur * FPS); f++) {
        const t = Math.min(f / FPS, dur);
        const a = A ? ClipKit.sampleKeys(A, t) : ClipKit.channelDefault(rig, n);
        const b = Bk ? ClipKit.sampleKeys(Bk, t) : ClipKit.channelDefault(rig, n);
        const dd = Math.abs(a - b);
        if (dd > mx) {
          mx = dd;
          mt = t;
        }
      }
      rows.push([n, mx, mt, !A ? 'baru' : !Bk ? 'dihapus' : 'diubah']);
    }
    rows.sort((a, b) => b[1] - a[1]);
    host.append(el('h3', { text: 'Selisih kurva per channel (30 fps)' }));
    for (const r of rows) {
      host.append(
        el(
          'div',
          { class: 'diffrow' },
          `${r[0].padEnd(14)} ${r[3].padEnd(8)} maks ${fmt2(r[1], 3)} di t=${fmt2(r[2])}s`,
        ),
      );
    }
  }

  host.append(
    el(
      'p',
      { class: 'note' },
      'Diff membandingkan data klip, bukan pose dunia hasil build. Tanda ! menandai perubahan yang memengaruhi gameplay.',
    ),
  );
}

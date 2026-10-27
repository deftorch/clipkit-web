import { el, fmt2 } from "../dom/h.js";
import ClipKit from "../../domain/clipkit.js";
import { FPS } from "../../domain/math/vec3.js";
import historyData from "../../data/history.json";
import keysData from "../../data/keys.json";
import { curItem, stable } from "../../application/state/clip-store.js";
import { rigState } from "../../application/state/rig-store.js";

let diffV = null;

export function renderVer(host) {
  if (!host) return;
  const it = curItem();
  host.textContent = '';
  if (!it || !it.clip) {
    host.append(el('p', { class: 'note', text: 'Klip belum valid.' }));
    return;
  }

  const c = it.clip;
  host.append(el('h3', { text: `${c.name} · versi ${c.version ?? '?'} · format ${c.format_version ?? '?'}` }));

  const ul = el('ul', { class: 'cl' });
  for (const e of c.changelog || []) {
    ul.append(el('li', {}, el('b', { text: 'v' + e.v }), el('span', { text: e.catatan })));
  }
  if (!c.changelog?.length) {
    ul.append(el('li', {}, el('b', { text: '-' }), el('span', { text: 'Belum ada changelog.' })));
  }
  host.append(ul);

  const hist = historyData[c.name];
  const vs = hist ? Object.keys(hist).map(Number).sort((a, b) => a - b) : [];

  host.append(el('h3', { text: 'Bandingkan dengan snapshot' }));
  if (!vs.length) {
    host.append(
      el('p', {
        class: 'note',
        text: 'Tidak ada snapshot untuk klip ini. Di repo, snapshot dibuat dengan clip_release.py release <nama>.'
      })
    );
    return;
  }

  if (!vs.includes(diffV)) {
    diffV = vs[vs.length - 1];
  }

  const sel = el('select', { id: 'diffSel', 'aria-label': 'Snapshot' });
  for (const v of vs) {
    const o = el('option', { value: v, text: `${c.name}@${v}` });
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
      el('span', { class: 'hint', text: `lawan: klip kerja di editor (v${c.version})` })
    )
  );

  const s = hist[diffV];
  const dk = keysData.behaviorKeys.filter((k) => stable(c[k]) !== stable(s[k]));
  if (!dk.length) {
    host.append(el('p', { class: 'diffrow', text: 'Tidak ada beda pada isi yang memengaruhi gerak atau gameplay.' }));
  }

  for (const k of dk) {
    const isGameplay = keysData.gameplayKeys.includes(k);
    host.append(
      el(
        'div',
        { class: 'diffrow' + (isGameplay ? ' g' : '') },
        (isGameplay ? '! ' : '  ') + k + ' berubah' + (isGameplay ? ' (memengaruhi gameplay)' : '')
      )
    );
  }

  for (const k of ['duration', 'loop']) {
    if (dk.includes(k)) {
      host.append(
        el('div', { class: 'diffrow g' }, `   ${k}: ${JSON.stringify(s[k])} -> ${JSON.stringify(c[k])}`)
      );
    }
  }

  for (const k of ['windows', 'move', 'events', 'claims']) {
    if (dk.includes(k)) {
      host.append(
        el('div', { class: 'diffrow' }, `   ${k} lama: ${JSON.stringify(s[k])}`),
        el('div', { class: 'diffrow' }, `   ${k} baru: ${JSON.stringify(c[k])}`)
      );
    }
  }

  if (dk.includes('channels')) {
    const names = new Set([...Object.keys(s.channels || {}), ...Object.keys(c.channels || {})]);
    const rows = [];
    const dur = Math.max(s.duration, c.duration);
    const rig = rigState.rig;

    for (const n of names) {
      const A = s.channels?.[n];
      const Bk = c.channels?.[n];
      if (stable(A) === stable(Bk)) continue;
      let mx = 0, mt = 0;
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
          `${r[0].padEnd(14)} ${r[3].padEnd(8)} maks ${fmt2(r[1], 3)} di t=${fmt2(r[2])}s`
        )
      );
    }
  }

  host.append(
    el(
      'p',
      { class: 'note' },
      'Diff membandingkan data klip, bukan pose dunia hasil build. Tanda ! menandai perubahan yang memengaruhi gameplay.'
    )
  );
}

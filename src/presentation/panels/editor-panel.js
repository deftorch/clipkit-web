import { el, copyText } from "../dom/h.js";
import { clipState, curItem, fmtClip, rebuild, persist, addItem, selectClip } from "../../application/state/clip-store.js";
import { playbackState } from "../../application/state/playback-store.js";

let edTimer = null;

export function renderEditor(host, onRefreshAll, onSelectTab) {
  if (!host) return;
  host.textContent = '';

  const ta = el('textarea', {
    id: 'ed',
    spellcheck: 'false',
    'aria-label': 'JSON klip',
    autocapitalize: 'off',
    autocomplete: 'off'
  });
  const stat = el('div', { class: 'edstat', id: 'edstat', role: 'status' });
  const row = el('div', { class: 'btnrow' });

  const mk = (t, fn, cls = '') => {
    const b = el('button', { class: 'btn sm ' + cls, type: 'button', text: t });
    b.onclick = () => fn(b);
    row.append(b);
    return b;
  };

  mk('Format rapi', () => {
    try {
      ta.value = fmtClip(JSON.parse(ta.value));
      onInput();
    } catch (e) {}
  });

  mk('Salin JSON', (b) => copyText(ta.value, b));

  mk('Duplikat', () => {
    try {
      const c = JSON.parse(ta.value);
      let n;
      do {
        clipState.counter++;
        n = (c.name || 'klip') + '_salinan' + clipState.counter;
      } while (clipState.items[n]);
      c.name = n;
      const it = addItem(n, curItem().base, fmtClip(c), true);
      it.orig = null;
      persist();
      selectClip(n);
      if (onSelectTab) onSelectTab('edit');
      if (onRefreshAll) onRefreshAll();
    } catch (e) {}
  });

  mk('Kembalikan contoh', () => {
    const it = curItem();
    if (!it || it.orig == null) return;
    it.text = it.orig;
    it.dirty = false;
    rebuild(it);
    persist();
    if (onRefreshAll) onRefreshAll();
  });

  const fi = el('input', { type: 'file', accept: '.json,application/json', id: 'fileIn', hidden: '' });
  fi.onchange = () => {
    const f = fi.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let n = f.name.replace(/\.json$/i, '').replace(/[^\w-]/g, '_') || 'impor';
      while (clipState.items[n]) n += '_2';
      const it = addItem(n, null, String(r.result), true);
      it.orig = null;
      persist();
      selectClip(n);
      if (onSelectTab) onSelectTab('edit');
      if (onRefreshAll) onRefreshAll();
    };
    r.readAsText(f);
    fi.value = '';
  };
  mk('Muat file .json', () => fi.click());
  row.append(fi);

  host.append(
    row,
    ta,
    stat,
    el('p', {
      class: 'note',
      text: 'Perubahan langsung dibangun ulang dan divalidasi. Draf tersimpan di browser ini saja. Untuk membawa hasilnya ke repo, salin JSON dan simpan sebagai clipkit/clips/<nama>.json, lalu naikkan version dan changelog.'
    })
  );

  ta.addEventListener('input', onInput);

  function onInput() {
    const it = curItem();
    if (!it) return;
    it.text = ta.value;
    it.dirty = it.orig == null ? true : it.text !== it.orig;
    clearTimeout(edTimer);
    edTimer = setTimeout(() => {
      rebuild(it);
      persist();
      const keepT = playbackState.t;
      if (it.clip) {
        playbackState.t = Math.min(keepT, it.clip.duration);
      }
      if (onRefreshAll) onRefreshAll(true);
    }, 250);
  }

  syncEditor(true);
}

export function syncEditor(force) {
  const ta = document.getElementById('ed');
  if (!ta) return;
  const it = curItem();
  if (!it) return;

  if (force || document.activeElement !== ta) {
    ta.value = it.text;
  }
  ta.classList.toggle('bad', !!it.err);

  const st = document.getElementById('edstat');
  if (st) {
    st.className = 'edstat ' + (it.err ? 'bad' : 'ok');
    st.textContent = it.err
      ? it.err
      : `OK · ${it.res ? it.res.frames + 1 : 0} frame · ${it.lines.filter((l) => l[0] === 'FAIL').length} FAIL · ${it.lines.filter((l) => l[0] === 'WARN').length} WARN`;
  }
}

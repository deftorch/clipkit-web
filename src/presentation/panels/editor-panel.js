import {
  addItem,
  clipState,
  curItem,
  fmtClip,
  persist,
  rebuild,
  selectClip,
} from '../../application/state/clip-store.js';
import { playbackState } from '../../application/state/playback-store.js';
import { defaultPoses } from '../../data/poses/index.js';
import { applyOverlap } from '../../domain/animation/overlap-processor.js';
import { copyText, el } from '../dom/h.js';

let edTimer = null;

export function renderEditor(host, onRefreshAll, onSelectTab, onImportFile) {
  if (!host) return;
  host.textContent = '';

  const ta = el('textarea', {
    id: 'ed',
    spellcheck: 'false',
    'aria-label': 'JSON klip',
    autocapitalize: 'off',
    autocomplete: 'off',
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

  const fi = el('input', {
    type: 'file',
    accept: '.json,application/json,.vrma,.glb,.bvh,.fbx',
    id: 'fileIn',
    hidden: '',
  });
  fi.onchange = () => {
    const f = fi.files[0];
    if (!f) return;
    if (onImportFile) {
      onImportFile(f);
    } else {
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
    }
    fi.value = '';
  };
  mk('Impor file (.json, .vrma, .bvh, .fbx)', () => fi.click());
  row.append(fi);

  // Pose Library Controls (Pustaka Pose Preset)
  const poseRow = el(
    'div',
    { class: 'btnrow', style: 'align-items: center; gap: 8px; margin-top: 6px;' },
    el('span', {
      class: 'hint',
      style: 'font-weight: 500;',
      text: 'Pustaka Pose:',
    }),
  );

  const poseSelect = el('select', { id: 'poseSelect', 'aria-label': 'Pilih Pose Preset' });
  const poseEntries = Object.entries(defaultPoses);
  for (const [key, p] of poseEntries) {
    const opt = el('option', { value: key, text: `${p.name} [${p.part}]` });
    poseSelect.append(opt);
  }

  const poseDesc = el('span', {
    class: 'hint',
    style: 'max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
    text: poseEntries[0]?.[1]?.description || '',
  });

  poseSelect.onchange = () => {
    const p = defaultPoses[poseSelect.value];
    if (p && p.description) {
      poseDesc.textContent = p.description;
    }
  };

  const btnApplyPose = el('button', {
    class: 'btn sm',
    type: 'button',
    text: 'Terapkan Pose',
    title: 'Gabungkan channel dan ekspresi pose ini langsung ke klip aktif',
  });
  btnApplyPose.onclick = () => {
    const it = curItem();
    if (!it || !it.clip) return;
    const pose = defaultPoses[poseSelect.value];
    if (!pose) return;

    const modified = JSON.parse(JSON.stringify(it.clip));
    const dur = modified.duration || 1.0;

    if (pose.channels) {
      modified.channels = modified.channels || {};
      for (const [ch, kfs] of Object.entries(pose.channels)) {
        if (kfs.length === 1) {
          const val = kfs[0][1];
          const easing = kfs[0][2] || 'linear';
          modified.channels[ch] = [
            [0, val],
            [dur, val, easing],
          ];
        } else {
          modified.channels[ch] = JSON.parse(JSON.stringify(kfs));
        }
      }
    }

    if (pose.expressions) {
      modified.expressions = modified.expressions || {};
      for (const [expr, kfs] of Object.entries(pose.expressions)) {
        if (kfs.length === 1) {
          const val = kfs[0][1];
          modified.expressions[expr] = [
            [0, val],
            [dur, val],
          ];
        } else {
          modified.expressions[expr] = JSON.parse(JSON.stringify(kfs));
        }
      }
    }

    it.text = fmtClip(modified);
    it.dirty = true;
    rebuild(it);
    persist();
    syncEditor(true);
    if (onRefreshAll) onRefreshAll(true);
  };

  const btnAddPoseLayer = el('button', {
    class: 'btn sm',
    type: 'button',
    text: 'Tambah Layer Pose',
    title: 'Tambahkan pose sebagai modular layer non-destruktif',
  });
  btnAddPoseLayer.onclick = () => {
    const it = curItem();
    if (!it || !it.clip) return;
    const poseKey = poseSelect.value;
    const modified = JSON.parse(JSON.stringify(it.clip));
    modified.layers = modified.layers || [];
    modified.layers.push({
      ref: `poses/${poseKey}.json`,
      mode: 'override',
    });

    it.text = fmtClip(modified);
    it.dirty = true;
    rebuild(it);
    persist();
    syncEditor(true);
    if (onRefreshAll) onRefreshAll(true);
  };

  poseRow.append(poseSelect, btnApplyPose, btnAddPoseLayer, poseDesc);

  // Overlap & Kinetic Chain Controls
  const overlapRow = el(
    'div',
    { class: 'btnrow', style: 'align-items: center; gap: 8px;' },
    el('span', {
      class: 'hint',
      style: 'font-weight: 500;',
      text: 'Overlap (Rantai Kinetik):',
    }),
  );

  const delayInput = el('input', {
    type: 'range',
    min: '10',
    max: '80',
    value: '30',
    step: '5',
    id: 'overlapDelay',
    style: 'width: 90px; vertical-align: middle;',
    'aria-label': 'Delay Propagasi',
  });
  const delayLabel = el('span', { class: 'hint', text: '30ms' });
  delayInput.oninput = () => {
    delayLabel.textContent = `${delayInput.value}ms`;
  };

  let isPreviewing = false;
  let preOverlapText = null;

  const btnPreviewOverlap = el('button', {
    class: 'btn sm',
    type: 'button',
    text: 'Pratinjau Overlap',
  });
  btnPreviewOverlap.onclick = () => {
    const it = curItem();
    if (!it || !it.clip) return;
    if (!isPreviewing) {
      preOverlapText = it.text;
      const delayed = applyOverlap(it.clip, {
        delayStep: Number(delayInput.value) / 1000,
      });
      it.text = fmtClip(delayed);
      rebuild(it);
      isPreviewing = true;
      btnPreviewOverlap.classList.add('primary');
      btnPreviewOverlap.textContent = 'Kembalikan Asli';
      syncEditor(true);
      if (onRefreshAll) onRefreshAll(true);
    } else {
      it.text = preOverlapText;
      rebuild(it);
      isPreviewing = false;
      btnPreviewOverlap.classList.remove('primary');
      btnPreviewOverlap.textContent = 'Pratinjau Overlap';
      syncEditor(true);
      if (onRefreshAll) onRefreshAll(true);
    }
  };

  const btnBakeOverlap = el('button', {
    class: 'btn sm',
    type: 'button',
    text: 'Bake Overlap',
  });
  btnBakeOverlap.onclick = () => {
    const it = curItem();
    if (!it || !it.clip) return;
    const baseToBake = isPreviewing && preOverlapText ? JSON.parse(preOverlapText) : it.clip;
    const baked = applyOverlap(baseToBake, {
      delayStep: Number(delayInput.value) / 1000,
    });
    it.text = fmtClip(baked);
    it.dirty = true;
    isPreviewing = false;
    btnPreviewOverlap.classList.remove('primary');
    btnPreviewOverlap.textContent = 'Pratinjau Overlap';
    rebuild(it);
    persist();
    syncEditor(true);
    if (onRefreshAll) onRefreshAll(true);
  };

  overlapRow.append(delayInput, delayLabel, btnPreviewOverlap, btnBakeOverlap);

  host.append(
    row,
    poseRow,
    overlapRow,
    ta,
    stat,
    el('p', {
      class: 'note',
      text: 'Perubahan langsung dibangun ulang dan divalidasi. Draf tersimpan di browser ini saja. Untuk membawa hasilnya ke repo, salin JSON dan simpan sebagai clipkit/clips/<nama>.json, lalu naikkan version dan changelog.',
    }),
  );

  ta.addEventListener('input', onInput);
  ta.addEventListener('dragover', (e) => e.preventDefault());
  ta.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && onImportFile) {
      onImportFile(f);
    }
  });

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
    let teleStr = '';
    if (it.importTelemetry) {
      const { reductionRatio, avgAngularError } = it.importTelemetry;
      teleStr = ` · Kompresi ${reductionRatio}% (error ${avgAngularError}°)`;
    }
    st.className = 'edstat ' + (it.err ? 'bad' : 'ok');
    st.textContent = it.err
      ? it.err
      : `OK · ${it.res ? it.res.frames + 1 : 0} frame · ${it.lines.filter((l) => l[0] === 'FAIL').length} FAIL · ${it.lines.filter((l) => l[0] === 'WARN').length} WARN${teleStr}`;
  }
}

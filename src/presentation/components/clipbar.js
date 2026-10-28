import { clipState, newClip, rebuildAll, selectClip } from '../../application/state/clip-store.js';
import { RIGS, rigLabel, rigState, setRig } from '../../application/state/rig-store.js';
import limitsData from '../../data/limits.json';
import { el } from '../dom/h.js';

export function renderClipbar({
  barEl,
  vrmInputEl,
  glCanvas,
  onMeshLoaded,
  onSelectClip,
  onAfterRigChange,
  onRefreshAll,
}) {
  if (!barEl) return;
  barEl.textContent = '';

  clipState.order.forEach((id, i) => {
    const it = clipState.items[id];
    const isSelected = id === clipState.cur;
    const label = (i < 9 ? i + 1 + ' ' : '') + (it.clip?.name || id) + (it.dirty ? ' •' : '');
    const b = el(
      'button',
      { class: 'tab', role: 'tab', type: 'button', 'aria-selected': String(isSelected) },
      label,
    );
    b.onclick = () => {
      selectClip(id);
      if (onSelectClip) onSelectClip(id);
    };
    barEl.append(b);
  });

  const nb = el('button', { class: 'btn sm', type: 'button', text: '+ Klip baru' });
  nb.onclick = () => {
    const id = newClip();
    if (onSelectClip) onSelectClip(id);
  };
  barEl.append(nb);

  barEl.append(el('span', { class: 'sp' }));

  const rl = el('label', { class: 'hint' }, 'Rig ');
  const rs = el('select', { id: 'rigSel', 'aria-label': 'Rig karakter' });
  for (const k of Object.keys(RIGS)) {
    const o = el('option', { value: k, text: rigLabel(k) });
    if (k === rigState.rigKey) o.selected = true;
    rs.append(o);
  }
  rs.onchange = () => {
    setRig(rs.value, onAfterRigChange, glCanvas, onMeshLoaded);
  };
  rl.append(rs);
  barEl.append(rl);

  const vb = el('button', { class: 'btn sm', type: 'button', text: 'Muat .vrm' });
  vb.onclick = () => {
    if (vrmInputEl) vrmInputEl.click();
  };
  barEl.append(vb);

  const sl = el('label', { class: 'hint' }, 'Gaya validator ');
  const sel = el('select', { id: 'style' });
  for (const s of Object.keys(limitsData.styles)) {
    const o = el('option', { value: s, text: s });
    if (s === clipState.style) o.selected = true;
    sel.append(o);
  }
  sel.onchange = () => {
    clipState.style = sel.value;
    rebuildAll();
    if (onRefreshAll) onRefreshAll();
  };
  sl.append(sel);
  barEl.append(sl);
}

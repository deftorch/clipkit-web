import { curItem } from '../../application/state/clip-store.js';
import { FPS } from '../../domain/math/vec3.js';
import { el } from '../dom/h.js';

export function renderPipe(p) {
  if (!p) return;
  const it = curItem();
  p.textContent = '';
  if (!it) return;

  const mk = (h, v, cls) =>
    el('div', { class: 'step ' + cls }, el('b', { text: h }), el('i', { text: v }));
  const steps = [];

  steps.push(
    mk(
      '1 Edit JSON',
      it.err ? 'galat' : it.dirty ? 'diubah' : 'contoh asli',
      it.err ? 'bad' : 'ok',
    ),
  );
  steps.push(
    mk(
      '2 Build',
      it.clip ? `${it.res.frames + 1} frame @${FPS} fps` : 'gagal',
      it.clip ? 'ok' : 'bad',
    ),
  );

  const f = it.res ? it.lines.filter((l) => l[0] === 'FAIL').length : 0;
  const w = it.res ? it.lines.filter((l) => l[0] === 'WARN').length : 0;
  steps.push(
    mk(
      '3 Validasi',
      it.res ? `${f} FAIL · ${w} WARN` : '-',
      !it.res ? 'bad' : f ? 'bad' : w ? 'warn' : 'ok',
    ),
  );
  steps.push(mk('4 Lihat', 'manusia menilai', 'ok'));
  steps.push(
    mk('5 Ekspor .vrma', it.clip ? (f ? 'ada FAIL' : 'siap') : '-', it.clip && !f ? 'ok' : 'warn'),
  );

  steps.forEach((s, i) => {
    if (i) p.append(el('span', { class: 'arrow', text: '→' }));
    p.append(s);
  });
}

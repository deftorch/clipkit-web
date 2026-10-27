import { clipState, curItem } from '../../application/state/clip-store.js';
import { copyText, el, fmt2 } from '../dom/h.js';

export const GROUPS = [
  ['Gerak dan anatomi', /^(kecepatan sudut|percepatan|loop|lutut|siku|leher|channel)/],
  ['Lantai', /^(lantai|foot)/],
  ['Root motion dan klaim', /^(root|kecepatan root|klaim)/],
  ['Jendela gameplay', /^(jendela|urutan|event)/],
  ['Kepatuhan VRM 1.0', /^VRM/],
];

export function groupOf(t) {
  for (const [n, re] of GROUPS) {
    if (re.test(t)) return n;
  }
  return 'Versi dan format';
}

export function renderValid(host) {
  if (!host) return;
  const it = curItem();
  host.textContent = '';
  if (!it) return;

  if (it.err) {
    host.append(
      el('div', { class: 'pill fail', text: 'Build gagal' }),
      el('p', { class: 'note', text: it.err }),
      el('p', {
        class: 'note',
        text: 'Buka tab Editor JSON untuk memperbaikinya, atau pakai Kembalikan contoh.',
      }),
    );
    return;
  }

  const f = it.lines.filter((l) => l[0] === 'FAIL').length;
  const w = it.lines.filter((l) => l[0] === 'WARN').length;
  const p = it.lines.filter((l) => l[0] === 'PASS').length;

  const sum = el(
    'div',
    { class: 'sumrow' },
    el('span', { class: 'pill fail', text: f + ' FAIL' }),
    el('span', { class: 'pill warn', text: w + ' WARN' }),
    el('span', { class: 'pill pass', text: p + ' PASS' }),
    el('span', { class: 'sp' }),
  );

  const cb = el('button', { class: 'btn sm', type: 'button', text: 'Salin laporan' });
  cb.onclick = () => {
    const header = `== ${it.clip.name} (${fmt2(it.clip.duration)}s, ${it.res.frames + 1} frame) gaya ${clipState.style}\n`;
    copyText(header + it.lines.map((l) => `[${l[0]}] ${l[1]}`).join('\n'), cb);
  };
  sum.append(cb);
  host.append(sum);

  const by = {};
  for (const l of it.lines) {
    const g = groupOf(l[1]);
    if (!by[g]) by[g] = [];
    by[g].push(l);
  }

  for (const [n] of [...GROUPS, ['Versi dan format']]) {
    if (!by[n]) continue;
    host.append(el('div', { class: 'grp', text: n }));
    const sortedLines = by[n].sort(
      (a, b) => ({ FAIL: 0, WARN: 1, PASS: 2 })[a[0]] - { FAIL: 0, WARN: 1, PASS: 2 }[b[0]],
    );
    for (const l of sortedLines) {
      host.append(
        el(
          'div',
          { class: 'row' },
          el('span', { class: 'badge ' + l[0], text: l[0] }),
          el('span', { class: 't', text: l[1] }),
        ),
      );
    }
  }

  host.append(
    el('p', {
      class: 'note',
      text: 'WARN adalah petunjuk, bukan vonis. Foot sliding memakai tinggi sendi toe, jadi ayunan kaki ikut terhitung. Validator mengukur angka; apakah geraknya enak dilihat tetap dinilai manusia.',
    }),
  );
}

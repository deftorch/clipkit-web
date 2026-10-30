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

let activeFilter = 'all';

export const PART_FILTERS = [
  { id: 'all', label: 'Semua' },
  {
    id: 'face',
    label: 'Wajah & Kepala',
    re: /(wajah|ekspresi|head|eye|jaw|angry|happy|blink|look)/i,
  },
  {
    id: 'hands',
    label: 'Tangan & Jari',
    re: /(tangan|finger|thumb|index|middle|ring|little|spread|wrist)/i,
  },
  { id: 'arms', label: 'Lengan & Siku', re: /(arm|elbow|bahu|shoulder|siku)/i },
  { id: 'legs', label: 'Kaki & Lutut', re: /(leg|knee|lutut|foot|toe|ankle|planted)/i },
  { id: 'torso', label: 'Torso & Spine', re: /(torso|spine|chest|lean|twist|hips|hip)/i },
  { id: 'floor', label: 'Lantai & Root', re: /(lantai|foot_slide|root|com|balance|travel)/i },
];

function findHint(lineText, issues = []) {
  if (!issues || !issues.length) return null;
  for (const iss of issues) {
    if (!iss.hint) continue;
    if (iss.channel && lineText.includes(iss.channel)) return iss.hint;
    if (iss.joint && lineText.includes(iss.joint)) return iss.hint;
    if (iss.rule && lineText.toLowerCase().includes(iss.rule.toLowerCase())) return iss.hint;
  }
  return null;
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

  // Filter Chips per Bagian Tubuh
  const filtersRow = el('div', {
    class: 'val-filters',
    role: 'group',
    'aria-label': 'Filter bagian tubuh',
  });
  for (const item of PART_FILTERS) {
    const btn = el('button', {
      type: 'button',
      class: 'val-filter-btn' + (activeFilter === item.id ? ' active' : ''),
      text: item.label,
    });
    btn.onclick = () => {
      activeFilter = item.id;
      renderValid(host);
    };
    filtersRow.append(btn);
  }
  host.append(filtersRow);

  const activeDef = PART_FILTERS.find((item) => item.id === activeFilter);
  const displayLines =
    activeDef && activeDef.re ? it.lines.filter((l) => activeDef.re.test(l[1])) : it.lines;

  if (activeFilter !== 'all' && displayLines.length === 0) {
    host.append(
      el('p', {
        class: 'note',
        text: `Tidak ada rule atau issue yang berkaitan dengan ${activeDef.label} pada klip ini.`,
      }),
    );
    return;
  }

  const by = {};
  for (const l of displayLines) {
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
      const hint = findHint(l[1], it.res?.issues);
      const valContent = el(
        'div',
        { class: 'val-content' },
        el('span', { class: 't', text: l[1] }),
      );
      if (hint && l[0] !== 'PASS') {
        valContent.append(el('div', { class: 'actionable-hint', text: `💡 Saran: ${hint}` }));
      }
      host.append(
        el('div', { class: 'row' }, el('span', { class: 'badge ' + l[0], text: l[0] }), valContent),
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

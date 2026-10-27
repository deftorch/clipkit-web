import { el } from '../dom/h.js';

export function renderAbout(host) {
  if (!host) return;
  host.textContent = '';

  host.append(el('h3', { text: 'Apa yang dipindahkan dari Godot ke web' }));
  const rows = [
    [
      'clip_lib.gd (easing, sampling, FK channel)',
      'clipkit.js, hasil sama dengan Godot: selisih posisi sendi maks 0.09 mm pada 3 klip contoh',
    ],
    [
      'clip_build.gd (JSON ke Animation)',
      'Dievaluasi langsung per frame 30 fps di browser; tidak ada file .res',
    ],
    [
      'clip_validate.gd',
      'Port penuh: kecepatan/percepatan sudut, loop, anatomi, lantai, foot sliding, root, klaim, jendela',
    ],
    [
      'clip_export_pose.gd + preview.py',
      'Tidak perlu: pose dihitung dan digambar langsung, termasuk lintasan dan bayangan',
    ],
    [
      'clipver.py + clip_diff.py',
      'Cek isi vs snapshot dan diff kurva per channel (snapshot contoh ikut tertanam)',
    ],
    [
      'scenes/clipkit_demo.tscn',
      'Pratinjau 3D, jeda, langkah per frame, kecepatan, kamera orbit, HUD jendela',
    ],
  ];
  const t = el(
    'table',
    { class: 'map' },
    el('thead', {}, el('tr', {}, el('th', { text: 'Di repo' }), el('th', { text: 'Di web' }))),
    el(
      'tbody',
      {},
      ...rows.map((r) => el('tr', {}, el('td', { text: r[0] }), el('td', { text: r[1] }))),
    ),
  );
  host.append(el('div', { class: 'scroll' }, t));

  host.append(el('h3', { text: 'Batasan' }));
  const ul = el('ul', { class: 'note', style: 'padding-left:18px;margin:0' });
  for (const s of [
    'Karakternya boneka garis dari 22 sendi, bukan mesh MotusMan. Cukup untuk menilai timing, tumpuan, kekakuan, dan lonjakan kecepatan; bobot dan gaya tetap perlu dilihat di Godot.',
    'Posisi rest tiap sendi diturunkan dari data pose yang diekspor Godot, karena file FBX tidak ada di arsip. Hasilnya diverifikasi pada 3 klip contoh.',
    'Hasil build .res untuk gameplay tetap dibuat oleh Godot (clip_build.gd). Web dipakai untuk menulis, mengukur, dan menilai cepat.',
    'Belum ada: IK, layer aditif, mirror, rig karakter kedua.',
  ]) {
    ul.append(el('li', { text: s }));
  }
  host.append(ul);

  host.append(
    el('h3', { text: 'Pintasan' }),
    el('p', {
      class: 'note mono',
      text: 'Spasi putar/jeda · , dan . satu frame · [ ] kecepatan · 1-9 pilih klip',
    }),
  );
}

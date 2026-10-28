export function check({ clip }) {
  const dur = clip.duration;
  const lines = [];

  const wins = clip.windows || {};
  for (const wn of Object.keys(wins)) {
    const w = wins[wn],
      ok = w.length === 2 && w[0] >= 0 && w[0] < w[1] && w[1] <= dur + 1e-4;
    lines.push([
      ok ? 'PASS' : 'FAIL',
      `jendela ${wn} [${w.join(', ')}] ${ok ? 'valid' : 'tidak valid (harus 0 <= mulai < akhir <= durasi)'}`,
    ]);
  }
  const hn = wins.hitbox ? 'hitbox' : wins.active ? 'active' : '';
  if (hn && wins.cancel) {
    const ok = wins.cancel[0] >= wins[hn][1] - 1e-4;
    lines.push([
      ok ? 'PASS' : 'FAIL',
      `urutan: cancel (${wins.cancel[0].toFixed(2)}) dimulai setelah ${hn} selesai (${wins[
        hn
      ][1].toFixed(2)})`,
    ]);
  }
  for (const ev of clip.events || []) {
    if (!(ev.t >= 0 && ev.t <= dur + 1e-4))
      lines.push(['FAIL', `event ${ev.id ?? '?'} di t=${ev.t} di luar durasi`]);
  }

  return { lines };
}

export const windowsRule = {
  name: 'windows',
  check,
};

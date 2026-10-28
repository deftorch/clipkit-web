import { createIssue, RULE_CODES } from './rule-codes.js';

export function check({ clip }) {
  const dur = clip.duration;
  const lines = [];
  const issues = [];

  const wins = clip.windows || {};
  for (const wn of Object.keys(wins)) {
    const w = wins[wn];
    const ok = w.length === 2 && w[0] >= 0 && w[0] < w[1] && w[1] <= dur + 1e-4;
    lines.push([
      ok ? 'PASS' : 'FAIL',
      `jendela ${wn} [${w.join(', ')}] ${ok ? 'valid' : 'tidak valid (harus 0 <= mulai < akhir <= durasi)'}`,
    ]);
    if (!ok) {
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.WINDOW_INVALID,
          channel: wn,
          hint: `Ensure window '${wn}' satisfies 0 <= start < end <= duration (${dur.toFixed(2)}s).`,
        }),
      );
    }
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
    if (!ok) {
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.WINDOW_SEQUENCE,
          hint: `Window 'cancel' (${wins.cancel[0].toFixed(2)}) must start after '${hn}' ends (${wins[hn][1].toFixed(2)}).`,
        }),
      );
    }
  }
  for (const ev of clip.events || []) {
    const ok = ev.t >= 0 && ev.t <= dur + 1e-4;
    if (!ok) {
      lines.push(['FAIL', `event ${ev.id ?? '?'} di t=${ev.t} di luar durasi`]);
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.EVENT_OUT_OF_BOUNDS,
          t: ev.t,
          hint: `Event '${ev.id ?? '?'}' timestamp t=${ev.t} is outside clip duration (${dur.toFixed(2)}s).`,
        }),
      );
    }
  }

  return { lines, issues };
}

export const windowsRule = {
  name: 'windows',
  check,
};

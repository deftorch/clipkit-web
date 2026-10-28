/**
 * Formats an animation clip object to structured indented JSON:
 * 1 key per line, compact array curves.
 */
export function fmtClip(c) {
  const J = JSON.stringify;
  const lines = [];
  const keys = Object.keys(c);
  keys.forEach((k, ki) => {
    const v = c[k];
    const comma = ki < keys.length - 1 ? ',' : '';
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      ['channels', 'windows', 'claims', 'move', 'validate', 'expressions'].includes(k) &&
      k !== 'move'
    ) {
      const ks = Object.keys(v);
      lines.push(` ${J(k)}: {`);
      ks.forEach((kk, i) => {
        lines.push(`  ${J(kk)}: ${J(v[kk])}${i < ks.length - 1 ? ',' : ''}`);
      });
      lines.push(` }${comma}`);
    } else if (Array.isArray(v) && v.length && typeof v[0] === 'object' && !Array.isArray(v[0])) {
      lines.push(` ${J(k)}: [`);
      v.forEach((x, i) => {
        lines.push(`  ${J(x)}${i < v.length - 1 ? ',' : ''}`);
      });
      lines.push(` ]${comma}`);
    } else {
      lines.push(` ${J(k)}: ${J(v)}${comma}`);
    }
  });
  return '{\n' + lines.join('\n') + '\n}';
}

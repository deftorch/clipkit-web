export const DEFAULT_PALETTE = {
  '--bg': '#0e1317',
  '--panel': '#161d23',
  '--panel2': '#1c252c',
  '--view': '#0a0f13',
  '--ink': '#e3eaef',
  '--muted': '#8c9dab',
  '--line': '#27323b',
  '--accent': '#6aa7ff',
  '--accent-ink': '#0b1722',
  '--fig': '#cfd9e0',
  '--figL': '#5aa2ff',
  '--figR': '#ff9a5c',
  '--grid': '#1f2a33',
  '--grid2': '#33424e',
  '--pass': '#1b7f47',
  '--warn': '#a96d08',
  '--fail': '#c22d2d',
  '--w-inv': '#0b8a84',
  '--w-hitbox': '#c22d2d',
  '--w-parry': '#a96d08',
  '--w-cancel': '#6446c4',
  '--t-handR': '#d65a1c',
  '--t-handL': '#1b6fe0',
  '--t-foot': '#6b7c8a',
  '--t-head': '#7a52c9',
};

export const C = { ...DEFAULT_PALETTE };

const listeners = new Set();

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setTheme(palette) {
  Object.assign(C, palette);
  for (const fn of listeners) fn(C);
  return C;
}

export function winColor(w) {
  return C['--w-' + (w === 'active' ? 'hitbox' : w)] || C['--accent'];
}

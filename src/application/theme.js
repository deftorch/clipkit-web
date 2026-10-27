export const C = {};

const THEME_KEYS = [
  '--view',
  '--ink',
  '--muted',
  '--line',
  '--panel',
  '--fig',
  '--figL',
  '--figR',
  '--grid',
  '--grid2',
  '--pass',
  '--warn',
  '--fail',
  '--w-inv',
  '--w-hitbox',
  '--w-parry',
  '--w-cancel',
  '--t-handR',
  '--t-handL',
  '--t-foot',
  '--t-head',
  '--accent',
  '--bg',
];

const listeners = new Set();

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function readTheme() {
  if (typeof document === 'undefined') return C;
  const cs = getComputedStyle(document.documentElement);
  const g = (n) => cs.getPropertyValue(n).trim();
  for (const n of THEME_KEYS) {
    C[n] = g(n);
  }
  for (const fn of listeners) fn(C);
  return C;
}

export function winColor(w) {
  return C['--w-' + (w === 'active' ? 'hitbox' : w)] || C['--accent'];
}

export function initTheme() {
  readTheme();
  if (typeof window === 'undefined') return;
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      readTheme();
    });
  }
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => {
      readTheme();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
}

import { C, setTheme } from '../../application/theme.js';

export const THEME_KEYS = [
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

export function readDomTheme() {
  if (typeof document === 'undefined') return C;
  const cs = getComputedStyle(document.documentElement);
  const updated = {};
  for (const n of THEME_KEYS) {
    const val = cs.getPropertyValue(n).trim();
    if (val) updated[n] = val;
  }
  return setTheme(updated);
}

export function initTheme() {
  readDomTheme();
  if (typeof window === 'undefined') return;
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      readDomTheme();
    });
  }
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    new MutationObserver(() => {
      readDomTheme();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
}

export const EASING_REGISTRY = new Map([
  ['linear', (u) => u],
  ['hold', (u) => (u < 1 ? 0 : 1)],
  ['inQuad', (u) => u * u],
  ['outQuad', (u) => 1 - (1 - u) * (1 - u)],
  ['inOutQuad', (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2)],
  ['inCubic', (u) => u * u * u],
  ['outCubic', (u) => 1 - (1 - u) ** 3],
  ['inOutCubic', (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)],
  ['inSine', (u) => 1 - Math.cos((u * Math.PI) / 2)],
  ['outSine', (u) => Math.sin((u * Math.PI) / 2)],
  ['inOutSine', (u) => -(Math.cos(Math.PI * u) - 1) / 2],
  [
    'outBack',
    (u) => {
      const c1 = 1.70158,
        c3 = c1 + 1;
      return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2;
    },
  ],
]);

export function registerEasing(name, fn) {
  EASING_REGISTRY.set(name, fn);
}

export function ease(name, u) {
  const clamped = Math.min(1, Math.max(0, u));
  const fn = EASING_REGISTRY.get(name);
  return fn ? fn(clamped) : clamped;
}

export const EASINGS = [
  'linear',
  'hold',
  'inQuad',
  'outQuad',
  'inOutQuad',
  'inCubic',
  'outCubic',
  'inOutCubic',
  'inSine',
  'outSine',
  'inOutSine',
  'outBack',
];

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

export function ease(name, u) {
  u = Math.min(1, Math.max(0, u));
  switch (name) {
    case 'linear':
      return u;
    case 'hold':
      return u < 1 ? 0 : 1;
    case 'inQuad':
      return u * u;
    case 'outQuad':
      return 1 - (1 - u) * (1 - u);
    case 'inOutQuad':
      return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
    case 'inCubic':
      return u * u * u;
    case 'outCubic':
      return 1 - (1 - u) ** 3;
    case 'inOutCubic':
      return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
    case 'inSine':
      return 1 - Math.cos((u * Math.PI) / 2);
    case 'outSine':
      return Math.sin((u * Math.PI) / 2);
    case 'inOutSine':
      return -(Math.cos(Math.PI * u) - 1) / 2;
    case 'outBack': {
      const c1 = 1.70158,
        c3 = c1 + 1;
      return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2;
    }
  }
  return u;
}

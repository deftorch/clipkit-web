import { checkVrm10 } from '../vrm10/check-vrm10.js';

export function check({ rig, ctx, clip }) {
  const lines = checkVrm10(rig, ctx, clip);
  return { lines };
}

export const vrm10Rule = {
  name: 'vrm10',
  check,
};

export { checkVrm10 };

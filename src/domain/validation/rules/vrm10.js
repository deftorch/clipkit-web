import { checkVrm10 } from '../vrm10/check-vrm10.js';
import { REQUIRED_VRM_BONES, VRM10_BONES, VRM10_EXPRESSIONS, vn } from '../vrm10/constants.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

export function check({ rig, ctx, clip }) {
  const lines = checkVrm10(rig, ctx, clip);
  const issues = [];

  // 1. Missing required bones
  const rigBones = rig.animated_bones.map((b) => vn(rig, b));
  const missingReq = REQUIRED_VRM_BONES.filter((b) => !rigBones.includes(b));
  if (missingReq.length) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.VRM10_REQUIRED_BONES,
        hint: `Ensure all 15 required VRM 1.0 humanoid bones are present in the rig (${missingReq.join(', ')}).`,
      }),
    );
  }

  // 2. Animated bones validity
  const clipChannels = Object.keys(clip.channels || {});
  for (const ch of clipChannels) {
    const chDef = rig.channels[ch];
    if (chDef && chDef.bone) {
      const vname = vn(rig, chDef.bone);
      if (vname && !VRM10_BONES.includes(vname)) {
        issues.push(
          createIssue({
            level: 'FAIL',
            rule: RULE_CODES.VRM10_INVALID_BONE,
            channel: ch,
            joint: chDef.bone,
            hint: `Channel '${ch}' animates bone '${vname}' which is outside the VRM 1.0 standard humanoid bones.`,
          }),
        );
      }
    }
  }

  // 3. Translations other than hips
  const nonHipsPos = clipChannels.filter((k) => {
    const chDef = rig.channels[k];
    return chDef?.type === 'pos' && vn(rig, chDef.bone) !== 'hips';
  });
  if (nonHipsPos.length) {
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.VRM10_NON_HIPS_POS,
        hint: `VRMC_vrm_animation-1.0 prohibits translation tracks on bones other than hips (${nonHipsPos.join(', ')}).`,
      }),
    );
  }

  // 4. Expressions
  const ex = clip.expressions || {};
  const names = Object.keys(ex);
  if (names.length) {
    const bad = names.filter((n) => !VRM10_EXPRESSIONS.includes(n));
    if (bad.length) {
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.VRM10_EXPRESSIONS,
          hint: `Use standard VRM 1.0 expression presets instead of: ${bad.join(', ')}.`,
        }),
      );
    }
    const oor = names.some((n) => ex[n].some((k) => k[1] < -1e-4 || k[1] > 1.0001));
    if (oor) {
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.VRM10_EXPRESSIONS,
          unit: '0..1',
          hint: 'Expression weights must be in the range [0, 1].',
        }),
      );
    }
  }

  return { lines, issues };
}

export const vrm10Rule = {
  name: 'vrm10',
  check,
};

export { checkVrm10 };

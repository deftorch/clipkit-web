/**
 * Stable, language-neutral rule codes for machine diagnostics.
 * These codes are part of the public API contract for agents and CLI tooling.
 */
export const RULE_CODES = {
  SPEED_LIMIT: 'SPEED_LIMIT',
  ACCEL_LIMIT: 'ACCEL_LIMIT',
  ANATOMY_KNEE: 'ANATOMY_KNEE',
  ANATOMY_ELBOW: 'ANATOMY_ELBOW',
  ANATOMY_NECK: 'ANATOMY_NECK',
  FLOOR_PENETRATION: 'FLOOR_PENETRATION',
  FOOT_FLOATING: 'FOOT_FLOATING',
  FOOT_SLIDE: 'FOOT_SLIDE',
  ROOT_MOTION_SPEED: 'ROOT_MOTION_SPEED',
  ROOT_MOTION_CLAIM_DIST: 'ROOT_MOTION_CLAIM_DIST',
  ROOT_MOTION_CLAIM_DUR: 'ROOT_MOTION_CLAIM_DUR',
  LOOP_MISMATCH: 'LOOP_MISMATCH',
  WINDOW_INVALID: 'WINDOW_INVALID',
  WINDOW_SEQUENCE: 'WINDOW_SEQUENCE',
  EVENT_OUT_OF_BOUNDS: 'EVENT_OUT_OF_BOUNDS',
  CHANNEL_UNKNOWN: 'CHANNEL_UNKNOWN',
  CHANNEL_RANGE_EXCEEDED: 'CHANNEL_RANGE_EXCEEDED',
  VRM10_REQUIRED_BONES: 'VRM10_REQUIRED_BONES',
  VRM10_INVALID_BONE: 'VRM10_INVALID_BONE',
  VRM10_NON_HIPS_POS: 'VRM10_NON_HIPS_POS',
  VRM10_EXPRESSIONS: 'VRM10_EXPRESSIONS',
  VERSION_FORMAT: 'VERSION_FORMAT',
  CHANGELOG_INVALID: 'CHANGELOG_INVALID',
  CHANGELOG_VERSION_MISMATCH: 'CHANGELOG_VERSION_MISMATCH',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  LAYER_NOT_FOUND: 'LAYER_NOT_FOUND',
  LAYER_DURATION_CLIPPED: 'LAYER_DURATION_CLIPPED',
  AIM_ADDITIVE_APPROX: 'AIM_ADDITIVE_APPROX',
  CHANNEL_COLLISION: 'CHANNEL_COLLISION',
  TORSO_OVERRIDE_CONFLICT: 'TORSO_OVERRIDE_CONFLICT',
  WINDOW_COLLISION: 'WINDOW_COLLISION',
  MOVE_COLLISION: 'MOVE_COLLISION',
  COM_BALANCE_UNSTABLE: 'COM_BALANCE_UNSTABLE',
};

/**
 * Creates a structured issue adhering to the CLI/agent diagnostic schema:
 * { level, rule, channel, joint, t, value, limit, unit, keys, hint }
 */
export function createIssue({
  level = 'FAIL', // 'FAIL' | 'WARN' | 'INFO'
  rule,
  channel = null,
  joint = null,
  t = null,
  value = null,
  limit = null,
  unit = null,
  keys = null,
  hint = null,
}) {
  return {
    level,
    rule,
    channel,
    joint,
    t: t != null ? Number(Number(t).toFixed(4)) : null,
    value: value != null ? Number(Number(value).toFixed(4)) : null,
    limit: limit != null ? Number(Number(limit).toFixed(4)) : null,
    unit,
    keys,
    hint,
  };
}

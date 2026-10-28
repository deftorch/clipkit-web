import limitsData from '../../data/limits.json';
import { defaultRuleRegistry } from '../../domain/validation/rule-registry.js';
import { RULE_CODES } from '../../domain/validation/rules/rule-codes.js';
import { formatDeterministicJson } from '../io.js';

export function runRules(_args, options = {}) {
  const registered = defaultRuleRegistry.getRules();
  const ruleDescriptions = {
    'angular-speed': 'Evaluates peak angular velocity (°/s) and angular acceleration (°/s²).',
    anatomy: 'Checks anatomical limits on knee, elbow, and neck flexion.',
    floor: 'Checks foot ground penetration and foot sliding during ground contact.',
    'root-motion': 'Validates root displacement velocity and consistency with claims.',
    windows: 'Verifies interval bounds and ordering of gameplay windows (hitbox, cancel).',
    loop: 'Asserts initial and final poses match within tolerance for looping clips.',
    'channel-ranges': 'Validates channel values stay within anatomical min/max limits.',
    vrm10: 'Enforces VRM 1.0 humanoid specification (15 required bones, translation on hips only).',
    version: 'Checks format_version and sequential changelog versioning.',
  };

  const results = registered.map((r) => ({
    name: r.name,
    description: ruleDescriptions[r.name] || 'Custom validation rule',
  }));

  if (options.json) {
    console.log(
      formatDeterministicJson({
        rules: results,
        ruleCodes: RULE_CODES,
        limits: limitsData,
      }),
    );
  } else {
    console.log(`Validation Rules (${results.length}):`);
    for (const r of results) {
      console.log(`  - ${r.name.padEnd(16)} : ${r.description}`);
    }
    console.log('\nConfigurable Style Limits:');
    for (const [st, lims] of Object.entries(limitsData.styles)) {
      console.log(
        `  * ${st}: speed_warn=${lims.ang_speed_warn}°/s, speed_fail=${lims.ang_speed_fail}°/s, loop_tol=${lims.loop_pose_diff_deg}°`,
      );
    }
  }

  return 0;
}

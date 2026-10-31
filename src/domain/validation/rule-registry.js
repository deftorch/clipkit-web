import { anatomyRule } from './rules/anatomy.js';
import { angularSpeedRule } from './rules/angular-speed.js';
import { channelRangesRule } from './rules/channel-ranges.js';
import { comBalanceRule } from './rules/com-balance.js';
import { floorRule } from './rules/floor.js';
import { handContactRule } from './rules/hand-contact.js';
import { loopRule } from './rules/loop.js';
import { rootMotionRule } from './rules/root-motion.js';
import { versionRule } from './rules/version.js';
import { windowsRule } from './rules/windows.js';

export class RuleRegistry {
  constructor() {
    this.rules = new Map();
  }

  register(rule) {
    if (!rule || !rule.name || typeof rule.check !== 'function') {
      throw new Error('Invalid rule: must have name and check function');
    }
    this.rules.set(rule.name, rule);
    return this;
  }

  unregister(name) {
    this.rules.delete(name);
    return this;
  }

  get(name) {
    return this.rules.get(name);
  }

  getRules() {
    return Array.from(this.rules.values());
  }
}

export function createDefaultRuleRegistry() {
  const registry = new RuleRegistry();
  // Register in exact execution order to match baseline line outputs:
  // 1. Angular speed & acceleration
  registry.register(angularSpeedRule);
  // 2. Loop
  registry.register(loopRule);
  // 3. Anatomy
  registry.register(anatomyRule);
  // 4. Floor
  registry.register(floorRule);
  // 5. Root motion
  registry.register(rootMotionRule);
  // 6. Windows
  registry.register(windowsRule);
  // 7. Version
  registry.register(versionRule);
  // 8. Channel ranges
  registry.register(channelRangesRule);
  // 9. Center of Mass balance projection
  registry.register(comBalanceRule);
  // 10. Hand environmental contact validation
  registry.register(handContactRule);
  return registry;
}

export const defaultRuleRegistry = createDefaultRuleRegistry();

import { sampleKeys } from '../../animation/keyframes.js';
import { allChannelNames, channelRange } from '../../rig/rig-context.js';
import { findClosestChannel } from '../schema-validator.js';
import { FPS } from '../vrm10/constants.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

export function checkChannelRanges(rig, clip) {
  const w = [];
  const issues = [];
  const valid = allChannelNames(rig);
  const chs = clip.channels || {};

  for (const c of Object.keys(chs)) {
    if (!valid.includes(c)) {
      w.push(['FAIL', `channel tidak dikenal: ${c}`]);
      const suggestion = findClosestChannel(c, valid);
      issues.push(
        createIssue({
          level: 'FAIL',
          rule: RULE_CODES.CHANNEL_UNKNOWN,
          channel: c,
          hint: suggestion
            ? `Unknown channel '${c}', did you mean '${suggestion}'?`
            : `Unknown channel '${c}'.`,
        }),
      );
      continue;
    }
    const rg = channelRange(rig, c);
    if (!rg) {
      continue;
    }
    let worst = 0;
    let wt = 0;
    let valAtWorst = 0;
    for (let f = 0; f <= Math.ceil(clip.duration * FPS); f++) {
      const t = Math.min(f / FPS, clip.duration);
      const v = sampleKeys(chs[c], t);
      const over = Math.max(rg[0] - v, v - rg[1]);
      if (over > 1e-4 && over > worst) {
        worst = over;
        wt = t;
        valAtWorst = v;
      }
    }
    if (worst > 0) {
      w.push([
        'WARN',
        `channel ${c} keluar range [${rg[0]}, ${rg[1]}]: nilai ${valAtWorst.toFixed(1)} (selisih ${worst.toFixed(1)}) di t=${wt.toFixed(2)}s`,
      ]);
      const limit = valAtWorst > rg[1] ? rg[1] : rg[0];
      issues.push(
        createIssue({
          level: 'WARN',
          rule: RULE_CODES.CHANNEL_RANGE_EXCEEDED,
          channel: c,
          t: wt,
          value: valAtWorst,
          limit,
          unit: 'deg',
          hint: `Clamp channel '${c}' between [${rg[0]}, ${rg[1]}]; current value ${valAtWorst.toFixed(1)} exceeds limit by ${worst.toFixed(1)}.`,
        }),
      );
    }
  }
  return { lines: w, issues };
}

export function check({ rig, clip }) {
  const result = checkChannelRanges(rig, clip);
  const lines = result.lines.map((item) => (Array.isArray(item) ? item : ['WARN', item]));
  return { lines, issues: result.issues };
}

export const channelRangesRule = {
  name: 'channel-ranges',
  check,
};

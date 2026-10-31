import { loadRigs } from '../../data/load-rigs.js';
import partsData from '../../data/parts.json';
import { formatDeterministicJson } from '../io.js';

export function runChannels(_args, options = {}) {
  const { motus } = loadRigs();
  const partFilter = options.part;

  if (partFilter && !partsData[partFilter]) {
    console.error(
      `Error: Unknown part '${partFilter}'. Supported parts: ${Object.keys(partsData).join(', ')}`,
    );
    return 2;
  }

  const results = [];
  for (const [name, def] of Object.entries(motus.channels)) {
    let part = 'torso';
    for (const [pName, pDef] of Object.entries(partsData)) {
      if (pDef.channels && pDef.channels.includes(name)) {
        part = pName;
        break;
      }
    }

    if (partFilter && part !== partFilter) {
      continue;
    }

    let min = null;
    let max = null;
    if (def.range !== undefined && def.range !== null) {
      min = def.range[0];
      max = def.range[1];
    } else if (def.min != null || def.max != null) {
      min = def.min ?? -180;
      max = def.max ?? 180;
    }
    const bone = def.bone || (def.bones ? Object.keys(def.bones).join(', ') : null);
    results.push({
      name,
      part,
      bone,
      type: def.type || 'rot',
      min,
      max,
      default: def.default ?? 0,
    });
  }

  // Also include aims and expressions if applicable
  if (!partFilter || partFilter === 'arms') {
    for (const [a, aimDef] of Object.entries(motus.aims || {})) {
      for (const k of ['elev', 'azim', 'roll']) {
        const aimRange = aimDef.range?.[k] || [-180, 180];
        const defaultVal = aimDef.default?.[k] ?? 0;
        results.push({
          name: `${a}_${k}`,
          part: 'arms',
          bone: a,
          type: 'aim',
          min: aimRange[0],
          max: aimRange[1],
          default: defaultVal,
        });
      }
    }
  }

  if (options.json) {
    console.log(formatDeterministicJson(results));
  } else {
    console.log(`Channels (${results.length}${partFilter ? ` for part '${partFilter}'` : ''}):`);
    for (const ch of results) {
      const typeStr = ch.type === 'pos' ? 'pos (m)' : 'rot (deg)';
      const rangeStr = ch.min != null && ch.max != null ? `[${ch.min}, ${ch.max}]` : 'unbounded';
      console.log(
        `  ${ch.name.padEnd(16)} [${ch.part.padEnd(5)}] ${(ch.bone || '').padEnd(14)} range: ${rangeStr.padEnd(12)} ${typeStr}`,
      );
    }
  }

  return 0;
}

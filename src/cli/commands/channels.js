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

    results.push({
      name,
      part,
      bone: def.bone || null,
      type: def.type || 'rot',
      min: def.min ?? -180,
      max: def.max ?? 180,
      default: def.default ?? 0,
    });
  }

  // Also include aims and expressions if applicable
  if (!partFilter || partFilter === 'arms') {
    for (const a of Object.keys(motus.aims || {})) {
      for (const k of ['elev', 'azim', 'roll']) {
        results.push({
          name: `${a}_${k}`,
          part: 'arms',
          bone: a,
          type: 'aim',
          min: -180,
          max: 180,
          default: 0,
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
      console.log(
        `  ${ch.name.padEnd(16)} [${ch.part.padEnd(5)}] ${ch.bone?.padEnd(14) || ''} range: [${ch.min}, ${ch.max}] ${typeStr}`,
      );
    }
  }

  return 0;
}

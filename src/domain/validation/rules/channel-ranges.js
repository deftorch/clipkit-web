import { FPS } from '../vrm10/constants.js';
import { sampleKeys } from '../../animation/keyframes.js';
import { allChannelNames, channelRange } from '../../rig/rig-context.js';

export function checkChannelRanges(rig, clip) {
  const w = [];
  const valid = allChannelNames(rig);
  const chs = clip.channels || {};

  for (const c of Object.keys(chs)) {
    if (!valid.includes(c)) {
      w.push(`channel tidak dikenal: ${c}`);
      continue;
    }
    const rg = channelRange(rig, c);
    let worst = 0,
      wt = 0;
    for (let f = 0; f <= Math.ceil(clip.duration * FPS); f++) {
      const t = Math.min(f / FPS, clip.duration),
        v = sampleKeys(chs[c], t);
      const over = Math.max(rg[0] - v, v - rg[1]);
      if (over > 1e-4 && over > worst) {
        worst = over;
        wt = t;
      }
    }
    if (worst > 0) {
      w.push(
        `channel ${c} keluar range [${rg[0]}, ${rg[1]}] maks ${worst.toFixed(1)} di t=${wt.toFixed(2)}s`
      );
    }
  }
  return w;
}

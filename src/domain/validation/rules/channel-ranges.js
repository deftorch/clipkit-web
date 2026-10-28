import { sampleKeys } from '../../animation/keyframes.js';
import { allChannelNames, channelRange } from '../../rig/rig-context.js';
import { FPS } from '../vrm10/constants.js';

export function checkChannelRanges(rig, clip) {
  const w = [];
  const valid = allChannelNames(rig);
  const chs = clip.channels || {};

  for (const c of Object.keys(chs)) {
    if (!valid.includes(c)) {
      w.push(['FAIL', `channel tidak dikenal: ${c}`]);
      continue;
    }
    const rg = channelRange(rig, c);
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
    }
  }
  return w;
}

import { curItem } from '../../application/state/clip-store.js';
import { playbackState, setPlaying } from '../../application/state/playback-store.js';
import { FPS } from '../../domain/math/vec3.js';
import { TL } from './timeline-renderer.js';

export function initTimelineScrubber({ tlHost, onDirty, onSyncPlay }) {
  let scrubbing = false;

  function scrubFrom(ev) {
    const it = curItem();
    if (!it || !it.clip) return;
    const r = tlHost.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const dur = it.clip.duration;
    let t = Math.min(dur, Math.max(0, ((x - TL.l) / (r.width - TL.l - TL.r)) * dur));
    t = Math.round(t * FPS) / FPS;
    playbackState.t = Math.min(t, dur);
    onDirty();
  }

  tlHost.addEventListener('pointerdown', (e) => {
    scrubbing = true;
    tlHost.setPointerCapture(e.pointerId);
    setPlaying(false);
    onSyncPlay();
    scrubFrom(e);
  });

  tlHost.addEventListener('pointermove', (e) => {
    if (scrubbing) scrubFrom(e);
  });

  const stopScrub = () => {
    scrubbing = false;
  };
  tlHost.addEventListener('pointerup', stopScrub);
  tlHost.addEventListener('pointercancel', stopScrub);

  return {
    isScrubbing: () => scrubbing,
  };
}

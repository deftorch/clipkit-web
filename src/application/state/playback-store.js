import { FPS } from '../../domain/math/vec3.js';

export const playbackState = {
  t: 0,
  playing: true,
  speed: 1,
  auto: true,
  trail: true,
  onion: false,
  follow: false,
  mesh: false,
  skel: true,
};

const listeners = new Set();
export function onPlaybackChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(playbackState);
}

export function setTime(t, clip) {
  if (clip) {
    playbackState.t = Math.min(clip.duration, Math.max(0, t));
  } else {
    playbackState.t = Math.max(0, t);
  }
  notify();
}

export function togglePlay(clip) {
  if (clip && !playbackState.playing && playbackState.t >= clip.duration - 1e-6) {
    playbackState.t = 0;
  }
  playbackState.playing = !playbackState.playing;
  notify();
}

export function setPlaying(val) {
  playbackState.playing = !!val;
  notify();
}

export function restart() {
  playbackState.t = 0;
  playbackState.playing = true;
  notify();
}

export function stepFrame(n, curItem) {
  if (!curItem || !curItem.clip || !curItem.res) return;
  playbackState.playing = false;
  const nf = curItem.res.frames;
  let f = Math.round(playbackState.t * FPS) + n;
  f = Math.max(0, Math.min(nf, f));
  playbackState.t = Math.min(f / FPS, curItem.clip.duration);
  notify();
}

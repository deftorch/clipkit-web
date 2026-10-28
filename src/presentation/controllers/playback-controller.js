import { curItem } from '../../application/state/clip-store.js';
import { playbackState } from '../../application/state/playback-store.js';

/**
 * PlaybackController manages animation frame timing and playhead progression.
 */
export class PlaybackController {
  constructor({ onTick, onPause, getClip = () => curItem()?.clip }) {
    this.onTick = onTick;
    this.onPause = onPause;
    this.getClip = getClip;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : 0;
    this.running = false;
    this.rafId = null;
    this._loop = this._loop.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : 0;
    this.rafId = requestAnimationFrame(this._loop);
  }

  stop() {
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    const clip = this.getClip();
    if (playbackState.playing && clip) {
      playbackState.t += dt * playbackState.speed;
      if (clip.duration > 0) {
        if (clip.loop) {
          playbackState.t %= clip.duration;
        } else if (playbackState.t >= clip.duration) {
          playbackState.t = clip.duration;
          playbackState.playing = false;
          if (this.onPause) this.onPause();
        }
      }
      if (this.onTick) this.onTick(dt);
    }

    this.rafId = requestAnimationFrame(this._loop);
  }
}

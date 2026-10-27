import { fitCamera } from '../../application/state/camera-store.js';
import { clipState, curItem } from '../../application/state/clip-store.js';
import {
  playbackState,
  restart,
  setPlaying,
  stepFrame,
  togglePlay,
} from '../../application/state/playback-store.js';
import { rigState } from '../../application/state/rig-store.js';
import ClipKit from '../../domain/clipkit.js';

export function syncPlayBtn(bPlay) {
  if (bPlay) {
    bPlay.textContent = playbackState.playing ? 'Jeda' : 'Putar';
  }
}

export function exportVrma(it = curItem(), rig = rigState.rig, ctx = rigState.ctx) {
  if (!it || !it.clip) return;
  const blob = ClipKit.buildVrmaGlb(rig, ctx, it.clip);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (it.clip.name || 'anim') + '.vrma';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

export function initTransport({
  bPlay,
  bPrev,
  bNext,
  bRestart,
  speedSel,
  cAuto,
  cTrail,
  cOnion,
  cFollow,
  bVrma,
  onDirty,
  onSelectClip,
}) {
  const sync = () => syncPlayBtn(bPlay);

  if (bPlay) {
    bPlay.onclick = () => {
      const it = curItem();
      togglePlay(it?.clip);
      sync();
    };
  }

  if (bPrev) {
    bPrev.onclick = () => {
      stepFrame(-1, curItem());
      sync();
      onDirty();
    };
  }

  if (bNext) {
    bNext.onclick = () => {
      stepFrame(1, curItem());
      sync();
      onDirty();
    };
  }

  if (bRestart) {
    bRestart.onclick = () => {
      restart();
      sync();
      onDirty();
    };
  }

  if (speedSel) {
    speedSel.onchange = (e) => {
      playbackState.speed = +e.target.value;
    };
  }

  if (cAuto) {
    cAuto.onchange = (e) => {
      playbackState.auto = e.target.checked;
    };
  }

  if (cTrail) {
    cTrail.onchange = (e) => {
      playbackState.trail = e.target.checked;
      onDirty();
    };
  }

  if (cOnion) {
    cOnion.onchange = (e) => {
      playbackState.onion = e.target.checked;
      onDirty();
    };
  }

  if (cFollow) {
    cFollow.onchange = (e) => {
      playbackState.follow = e.target.checked;
      if (!playbackState.follow) {
        fitCamera(curItem());
      }
      onDirty();
    };
  }

  if (bVrma) {
    bVrma.onclick = () => {
      exportVrma(curItem(), rigState.rig, rigState.ctx);
    };
  }

  window.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (bPlay) bPlay.click();
    } else if (e.key === ',') {
      stepFrame(-1, curItem());
      sync();
      onDirty();
    } else if (e.key === '.') {
      stepFrame(1, curItem());
      sync();
      onDirty();
    } else if (e.key === '[' || e.key === ']') {
      if (speedSel) {
        const i = Math.max(
          0,
          Math.min(speedSel.options.length - 1, speedSel.selectedIndex + (e.key === ']' ? 1 : -1)),
        );
        speedSel.selectedIndex = i;
        playbackState.speed = +speedSel.value;
      }
    } else if (/^[1-9]$/.test(e.key)) {
      const idx = +e.key - 1;
      if (clipState.order[idx] && onSelectClip) {
        onSelectClip(clipState.order[idx]);
      }
    }
  });

  sync();
  return {
    syncPlay: sync,
  };
}

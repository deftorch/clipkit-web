import limitsData from '../../data/limits.json';
import { evalPose } from '../../domain/rig/pose-evaluator.js';
import { validate } from '../../domain/validation/validator.js';
import { addItem, clipState, curItem, fmtClip, rebuild, selectClip } from '../state/clip-store.js';
import {
  playbackState,
  restart,
  setPlaying,
  setTime,
  stepFrame,
  togglePlay,
} from '../state/playback-store.js';
import { getMeshRenderer, getRigLoader, rigState } from '../state/rig-store.js';

/**
 * Creates the single, unified agent API for programmatic and headless testing.
 */
export function createAgentApi(options = {}) {
  const { onExportVrma, onRefreshAll } = options;

  return {
    getRig: () => rigState.rig,
    getCtx: () => rigState.ctx,
    getState: () => ({
      clip: { ...clipState },
      playback: { ...playbackState },
    }),
    curItem: () => curItem(),
    getClips: () => clipState.order.map((id) => clipState.items[id]),
    getClip: (id) => clipState.items[id] || null,

    setClip: (id, content) => {
      const text = typeof content === 'string' ? content : fmtClip(content);
      const it = addItem(id, null, text, true);
      selectClip(id);
      if (onRefreshAll) onRefreshAll();
      return it;
    },
    selectClip: (id) => {
      selectClip(id);
      if (onRefreshAll) onRefreshAll();
    },
    validate: (clip, style = clipState.style, rig = rigState.rig, ctx = rigState.ctx) => {
      const c = typeof clip === 'string' ? JSON.parse(clip) : clip;
      return validate(rig, ctx, limitsData, c, style);
    },
    evalPose: (clip, t, rig = rigState.rig, ctx = rigState.ctx) => {
      const c = typeof clip === 'string' ? JSON.parse(clip) : clip;
      return evalPose(rig, ctx, c, t);
    },
    rebuild: (it = curItem()) => {
      if (!it) return;
      rebuild(it, rigState.rig, rigState.ctx, clipState.style);
      if (onRefreshAll) onRefreshAll();
    },

    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    togglePlay: () => togglePlay(curItem()?.clip),
    seek: (t) => setTime(t),
    stepFrame: (frames = 1) => stepFrame(frames, curItem()),
    restart: () => restart(),

    exportVrma: (clip = curItem()?.clip, rig = rigState.rig, ctx = rigState.ctx) => {
      if (!clip) throw new Error('No clip specified for export');
      if (typeof onExportVrma !== 'function') throw new Error('VRMA exporter not configured');
      return onExportVrma({ clip }, rig, ctx);
    },

    refresh: () => {
      if (onRefreshAll) onRefreshAll();
    },
    meshRenderer: () => getMeshRenderer(),
    rigLoader: () => getRigLoader(),
  };
}

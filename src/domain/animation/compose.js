import { sampleKeys } from './keyframes.js';

/**
 * Matches a channel name against a pattern (supports exact name, '*' wildcard, or prefix 'armR_*').
 */
export function matchChannelPattern(channelName, pattern) {
  if (pattern === '*' || pattern === channelName) return true;
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return channelName.startsWith(prefix);
  }
  return false;
}

/**
 * Checks if a channel matches any pattern in a list of patterns.
 */
export function matchesAnyPattern(channelName, patterns) {
  if (!patterns || !patterns.length) return true;
  return patterns.some((pat) => matchChannelPattern(channelName, pat));
}

/**
 * Pure domain composition function: merges multiple layer clips onto a base clip.
 * Implements ROADMAP Phase C2.2 merge semantics.
 */
export function composeClips(baseClip, layers = [], options = {}) {
  const warnings = [];
  const addWarn = (code, message, extra = {}) => {
    warnings.push({ code, message, ...extra });
  };

  const dur = baseClip.duration || 1.0;
  const FPS = options.FPS || 30;
  const frames = Math.ceil(dur * FPS);

  // Initialize composite clip copying metadata from base
  const composite = {
    name: baseClip.name ? `${baseClip.name}_composite` : 'composite',
    duration: dur,
    loop: !!baseClip.loop,
    format_version: baseClip.format_version || 1,
    channels: JSON.parse(JSON.stringify(baseClip.channels || {})),
    expressions: JSON.parse(JSON.stringify(baseClip.expressions || {})),
    windows: JSON.parse(JSON.stringify(baseClip.windows || {})),
    events: JSON.parse(JSON.stringify(baseClip.events || [])),
    claims: baseClip.claims ? JSON.parse(JSON.stringify(baseClip.claims)) : undefined,
    validate: baseClip.validate ? JSON.parse(JSON.stringify(baseClip.validate)) : undefined,
    move: baseClip.move ? [...baseClip.move] : undefined,
  };

  const channelOwners = new Map();
  for (const ch of Object.keys(composite.channels)) {
    channelOwners.set(ch, 'base');
  }

  // Torso channels requiring additive mode when shared
  const TORSO_CHANNELS = new Set([
    'lean',
    'side_lean',
    'twist',
    'hip_pitch',
    'hip_twist',
    'hip_roll',
    'head_pitch',
    'head_yaw',
  ]);

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    let layerClip = layer.clip;

    if (!layerClip && layer.ref && options.resolveRef) {
      layerClip = options.resolveRef(layer.ref);
    }

    if (!layerClip) {
      addWarn(
        'LAYER_NOT_FOUND',
        `Layer [${layerIdx}] reference '${layer.ref}' could not be resolved.`,
      );
      continue;
    }

    const layerDur = layerClip.duration || dur;
    const offset = layer.offset || 0;
    const mode = layer.mode || 'override'; // 'override' | 'additive'
    const channelPatterns = layer.channels || ['*'];

    // Duration clipping warning
    if (layerDur + offset > dur + 1e-4) {
      addWarn(
        'LAYER_DURATION_CLIPPED',
        `Layer [${layerIdx}] duration (${layerDur}s + ${offset}s offset) exceeds base clip duration (${dur}s) and was clipped.`,
      );
    }

    // 1. Merge Channels
    const layerChannels = layerClip.channels || {};
    for (const [chName, layerKfs] of Object.entries(layerChannels)) {
      if (!matchesAnyPattern(chName, channelPatterns)) {
        continue;
      }

      // Check aim channels
      const isAim =
        chName.includes('_elev') || chName.includes('_azim') || chName.includes('_roll');
      if (isAim && mode === 'additive') {
        addWarn(
          'AIM_ADDITIVE_APPROX',
          `Additive composition on aim channel '${chName}' in layer [${layerIdx}] is an angular approximation. 'override' is recommended.`,
          { channel: chName },
        );
      }

      // Check shared channel collisions
      if (channelOwners.has(chName) && channelOwners.get(chName) !== 'base') {
        addWarn(
          'CHANNEL_COLLISION',
          `Multiple layers write to channel '${chName}' (layer [${layerIdx}] and ${channelOwners.get(chName)}).`,
          { channel: chName },
        );
      }

      // Torso channels check
      if (TORSO_CHANNELS.has(chName) && channelOwners.has(chName) && mode !== 'additive') {
        addWarn(
          'TORSO_OVERRIDE_CONFLICT',
          `Shared torso channel '${chName}' in layer [${layerIdx}] uses 'override' mode instead of 'additive', which may distort balance.`,
          { channel: chName },
        );
      }

      channelOwners.set(chName, `layer_${layerIdx}`);

      if (mode === 'override') {
        // Shift keyframe times by offset
        composite.channels[chName] = layerKfs
          .map(([t, val, easing]) => {
            const newT = Number((t + offset).toFixed(4));
            return easing ? [newT, val, easing] : [newT, val];
          })
          .filter(([t]) => t >= 0 && t <= dur + 1e-4);
      } else if (mode === 'additive') {
        // Resample base and layer across frame samples and additively combine
        const baseKfs = composite.channels[chName] || [
          [0, 0],
          [dur, 0],
        ];
        const combinedKfs = [];
        for (let f = 0; f <= frames; f++) {
          const t = Math.min(f / FPS, dur);
          const baseVal = sampleKeys(baseKfs, t);
          const layerT = t - offset;
          let layerVal = 0;
          if (layerT >= 0 && layerT <= layerDur) {
            layerVal = sampleKeys(layerKfs, layerT);
          } else if (layerT > layerDur && !layerClip.loop) {
            layerVal = sampleKeys(layerKfs, layerDur);
          }
          combinedKfs.push([Number(t.toFixed(4)), Number((baseVal + layerVal).toFixed(4))]);
        }
        composite.channels[chName] = combinedKfs;
      }
    }

    // 2. Merge Expressions
    if (layerClip.expressions) {
      for (const [exprName, layerKfs] of Object.entries(layerClip.expressions)) {
        if (mode === 'additive' && composite.expressions[exprName]) {
          const baseKfs = composite.expressions[exprName];
          const combinedKfs = [];
          for (let f = 0; f <= frames; f++) {
            const t = Math.min(f / FPS, dur);
            const baseVal = sampleKeys(baseKfs, t);
            const layerT = t - offset;
            const layerVal = layerT >= 0 ? sampleKeys(layerKfs, layerT) : 0;
            const clamped = Math.max(0, Math.min(1, baseVal + layerVal));
            combinedKfs.push([Number(t.toFixed(4)), Number(clamped.toFixed(4))]);
          }
          composite.expressions[exprName] = combinedKfs;
        } else {
          composite.expressions[exprName] = layerKfs.map(([t, val, easing]) => {
            const newT = Number((t + offset).toFixed(4));
            const clamped = Math.max(0, Math.min(1, val));
            return easing ? [newT, clamped, easing] : [newT, clamped];
          });
        }
      }
    }

    // 3. Merge Windows
    if (layerClip.windows) {
      for (const [wn, [start, end]] of Object.entries(layerClip.windows)) {
        if (composite.windows[wn]) {
          addWarn(
            'WINDOW_COLLISION',
            `Window '${wn}' defined in both base and layer [${layerIdx}]. Base window retained.`,
          );
        } else {
          composite.windows[wn] = [
            Number(Math.max(0, start + offset).toFixed(4)),
            Number(Math.min(dur, end + offset).toFixed(4)),
          ];
        }
      }
    }

    // 4. Merge Events
    if (layerClip.events) {
      for (const ev of layerClip.events) {
        const shiftedT = Number((ev.t + offset).toFixed(4));
        if (shiftedT >= 0 && shiftedT <= dur + 1e-4) {
          composite.events.push({
            ...ev,
            t: shiftedT,
          });
        }
      }
    }

    // 5. Root motion ownership
    if (layerClip.move) {
      if (composite.move) {
        addWarn(
          'MOVE_COLLISION',
          `Multiple sources define root motion 'move'. Base motion retained; layer [${layerIdx}] move ignored.`,
        );
      } else {
        composite.move = [...layerClip.move];
      }
    }
  }

  // Sort events by timestamp
  composite.events.sort((a, b) => a.t - b.t);

  return {
    clip: composite,
    warnings,
  };
}

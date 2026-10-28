import { allChannelNames } from '../rig/rig-context.js';
import { createIssue, RULE_CODES } from './rules/rule-codes.js';
import { VRM10_EXPRESSIONS } from './vrm10/constants.js';

export const KNOWN_ALIASES = {
  neck_pitch: 'head_pitch',
  neck_yaw: 'head_yaw',
  legL_flex: 'legL_swing',
  legR_flex: 'legR_swing',
  knee_flex_L: 'kneeL',
  knee_flex_R: 'kneeR',
  invulnerable: 'inv',
};

/**
 * Computes Levenshtein distance between two strings.
 */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

/**
 * Finds the closest matching channel name from a list of valid names.
 */
export function findClosestChannel(name, validChannels) {
  if (KNOWN_ALIASES[name] && validChannels.includes(KNOWN_ALIASES[name])) {
    return KNOWN_ALIASES[name];
  }

  let best = null;
  let bestDist = Infinity;

  for (const candidate of validChannels) {
    const dist = levenshtein(name.toLowerCase(), candidate.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  // Suggest only if distance is small relative to string length
  if (best && bestDist <= Math.max(3, Math.floor(name.length / 2))) {
    return best;
  }
  return null;
}

/**
 * Validates a clip JSON against structural schema rules.
 * Runs before kinematics/physics evaluation.
 */
export function validateSchema(clip, rig = null) {
  const errors = [];

  const addError = (path, message, hint = null, code = RULE_CODES.SCHEMA_ERROR, extra = {}) => {
    errors.push({
      path,
      message,
      hint,
      code,
      issue: createIssue({
        level: 'FAIL',
        rule: code,
        hint,
        ...extra,
      }),
    });
  };

  if (!clip || typeof clip !== 'object' || Array.isArray(clip)) {
    addError('$', 'Clip must be a valid JSON object.');
    return { valid: false, errors };
  }

  if (typeof clip.duration !== 'number' || clip.duration <= 0 || clip.duration > 30) {
    addError(
      'duration',
      `Duration must be a number between 0 and 30 seconds (received: ${clip.duration}).`,
      'Set duration to a positive number in seconds, e.g. 1.2',
    );
  }

  const validChannels = rig ? allChannelNames(rig) : [];

  if (clip.channels != null) {
    if (typeof clip.channels !== 'object' || Array.isArray(clip.channels)) {
      addError('channels', 'Channels must be an object of keyframe arrays.');
    } else {
      for (const [chName, kfs] of Object.entries(clip.channels)) {
        if (validChannels.length && !validChannels.includes(chName)) {
          const suggestion = findClosestChannel(chName, validChannels);
          const hint = suggestion
            ? `Unknown channel '${chName}', did you mean '${suggestion}'?`
            : `Channel '${chName}' is not defined in target rig.`;
          addError(`channels.${chName}`, hint, hint, RULE_CODES.CHANNEL_UNKNOWN, {
            channel: chName,
          });
        }

        if (!Array.isArray(kfs)) {
          addError(
            `channels.${chName}`,
            `Channel '${chName}' keyframes must be an array of [time, value, easing?].`,
            'Format as [[0, 0, "linear"], [0.5, 45, "easeInOutQuad"]]',
          );
        } else {
          let prevT = -1;
          for (let i = 0; i < kfs.length; i++) {
            const kf = kfs[i];
            if (!Array.isArray(kf) || kf.length < 2) {
              addError(
                `channels.${chName}[${i}]`,
                `Keyframe at index ${i} must have at least [time, value].`,
              );
              continue;
            }
            const [t, val, easing] = kf;
            if (typeof t !== 'number' || t < 0 || (clip.duration && t > clip.duration + 1e-4)) {
              addError(
                `channels.${chName}[${i}][0]`,
                `Keyframe time must be between 0 and clip duration (${clip.duration}s).`,
                'Ensure 0 <= t <= duration',
              );
            } else if (t < prevT - 1e-4) {
              addError(
                `channels.${chName}[${i}][0]`,
                `Keyframe timestamps must be non-decreasing (at index ${i}, t=${t} < prev=${prevT}).`,
                'Sort keyframes chronologically by time',
              );
            }
            prevT = t;

            if (typeof val !== 'number') {
              addError(`channels.${chName}[${i}][1]`, 'Keyframe value must be a number.');
            }
            if (easing != null && typeof easing !== 'string') {
              addError(`channels.${chName}[${i}][2]`, 'Easing name must be a string.');
            }
          }
        }
      }
    }
  }

  if (clip.windows != null) {
    if (typeof clip.windows !== 'object' || Array.isArray(clip.windows)) {
      addError('windows', 'Windows must be an object { window_name: [start, end] }.');
    } else {
      for (const [wName, win] of Object.entries(clip.windows)) {
        if (!Array.isArray(win) || win.length !== 2) {
          addError(
            `windows.${wName}`,
            `Window '${wName}' must be a 2-element array [start, end].`,
            RULE_CODES.WINDOW_INVALID,
          );
        } else if (
          typeof win[0] !== 'number' ||
          typeof win[1] !== 'number' ||
          win[0] < 0 ||
          win[0] >= win[1] ||
          (clip.duration && win[1] > clip.duration + 1e-4)
        ) {
          addError(
            `windows.${wName}`,
            `Window '${wName}' bounds [${win.join(', ')}] are invalid. Must satisfy 0 <= start < end <= duration.`,
            `Adjust window bounds so 0 <= ${win[0]} < ${win[1]} <= ${clip.duration}`,
            RULE_CODES.WINDOW_INVALID,
          );
        }
      }
    }
  }

  if (clip.events != null) {
    if (!Array.isArray(clip.events)) {
      addError('events', 'Events must be an array of event objects [{ t, id, ... }].');
    } else {
      for (let i = 0; i < clip.events.length; i++) {
        const ev = clip.events[i];
        if (!ev || typeof ev !== 'object') {
          addError(`events[${i}]`, 'Event must be an object.');
        } else if (
          typeof ev.t !== 'number' ||
          ev.t < 0 ||
          (clip.duration && ev.t > clip.duration + 1e-4)
        ) {
          addError(
            `events[${i}].t`,
            `Event time must be within clip duration (received t=${ev.t}).`,
            'Ensure event timestamp satisfies 0 <= t <= duration',
            RULE_CODES.EVENT_OUT_OF_BOUNDS,
          );
        }
      }
    }
  }

  if (clip.expressions != null) {
    if (typeof clip.expressions !== 'object' || Array.isArray(clip.expressions)) {
      addError('expressions', 'Expressions must be an object of keyframe arrays.');
    } else {
      for (const [exprName, kfs] of Object.entries(clip.expressions)) {
        if (!VRM10_EXPRESSIONS.includes(exprName)) {
          addError(
            `expressions.${exprName}`,
            `Expression '${exprName}' is not a standard VRM 1.0 expression preset.`,
            `Use standard VRM 1.0 presets: ${VRM10_EXPRESSIONS.slice(0, 8).join(', ')}...`,
            RULE_CODES.VRM10_EXPRESSIONS,
          );
        }
        if (!Array.isArray(kfs)) {
          addError(
            `expressions.${exprName}`,
            `Expression '${exprName}' keyframes must be an array of [time, weight, easing?].`,
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

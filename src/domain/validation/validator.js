import { evalPose } from '../rig/pose-evaluator.js';
import { restPositions } from '../rig/rig-context.js';
import { defaultRuleRegistry } from './rule-registry.js';
import { FPS } from './vrm10/constants.js';

export function validate(
  rig,
  ctx,
  limits,
  clip,
  style = 'stylized',
  registry = defaultRuleRegistry,
) {
  const dur = clip.duration,
    frames = Math.ceil(dur * FPS - 1e-9);
  const tAt = (f) => Math.min(f / FPS, dur);
  const poses = [];
  for (let f = 0; f <= frames; f++) poses.push(evalPose(rig, ctx, clip, tAt(f)));
  const I = ctx.idx,
    restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  const ruleContext = {
    rig,
    ctx,
    limits,
    clip,
    style,
    poses,
    floorY,
    frames,
    tAt,
    FPS,
  };

  const lines = [];
  let speedSeries = null;
  let rootSpeed = null;

  for (const rule of registry.getRules()) {
    const result = rule.check(ruleContext);
    if (!result) continue;
    const ruleLines = Array.isArray(result) ? result : result.lines || [];
    for (const line of ruleLines) {
      lines.push(line);
    }
    if (result.speedSeries) speedSeries = result.speedSeries;
    if (result.rootSpeed) rootSpeed = result.rootSpeed;
  }

  const fail = lines.filter((l) => l[0] === 'FAIL').length,
    warn = lines.filter((l) => l[0] === 'WARN').length;
  return { lines, fail, warn, poses, floorY, speedSeries, rootSpeed, frames };
}

import { composeClips } from '../animation/compose.js';
import { evalPose } from '../rig/pose-evaluator.js';
import { restPositions } from '../rig/rig-context.js';
import { defaultRuleRegistry } from './rule-registry.js';
import { createIssue, RULE_CODES } from './rules/rule-codes.js';
import { FPS } from './vrm10/constants.js';

export function validate(
  rig,
  ctx,
  limits,
  clip,
  style = 'stylized',
  registry = defaultRuleRegistry,
  options = {},
) {
  let targetClip = clip;
  const compIssues = [];
  const compLines = [];
  const layerReports = [];

  if (clip.layers && Array.isArray(clip.layers) && clip.layers.length > 0 && !options.isLayerPass) {
    // 1. Validate each layer with only its relevant rules
    for (let i = 0; i < clip.layers.length; i++) {
      const layer = clip.layers[i];
      let layerClip = layer.clip;
      if (!layerClip && layer.ref && options.resolveRef) {
        layerClip = options.resolveRef(layer.ref);
      }
      if (layerClip) {
        let layerPart = layer.part;
        if (!layerPart && options.parts && layerClip.channels) {
          const lChannels = Object.keys(layerClip.channels);
          for (const [pName, pDef] of Object.entries(options.parts)) {
            const set = new Set(pDef.channels || []);
            if (lChannels.some((ch) => set.has(ch))) {
              layerPart = pName;
              break;
            }
          }
        }
        const layerRes = validate(rig, ctx, limits, layerClip, style, registry, {
          ...options,
          part: layerPart,
          isLayerPass: true,
        });
        layerReports.push({ layerIdx: i, part: layerPart, report: layerRes });
      }
    }

    // 2. Compose clips
    const { clip: composed, warnings } = composeClips(clip, clip.layers, options);
    targetClip = composed;

    for (const w of warnings) {
      compLines.push(['WARN', `[${w.code}] ${w.message}`]);
      compIssues.push(
        createIssue({
          level: 'WARN',
          rule: RULE_CODES[w.code] || w.code,
          channel: w.channel || null,
          hint: w.message,
        }),
      );
    }
  }

  const dur = targetClip.duration,
    frames = Math.ceil(dur * FPS - 1e-9);
  const tAt = (f) => Math.min(f / FPS, dur);
  const poses = [];
  for (let f = 0; f <= frames; f++) poses.push(evalPose(rig, ctx, targetClip, tAt(f)));
  const I = ctx.idx,
    restPos = restPositions(ctx);
  const floorY = Math.min(restPos[I.LeftToeBase][1], restPos[I.RightToeBase][1]);

  const ruleContext = {
    rig,
    ctx,
    limits,
    clip: targetClip,
    style,
    poses,
    floorY,
    frames,
    tAt,
    FPS,
  };

  const lines = [...compLines];
  const issues = [...compIssues];
  let speedSeries = null;
  let rootSpeed = null;

  for (const rule of registry.getRules()) {
    const result = rule.check(ruleContext);
    if (!result) continue;
    const ruleLines = Array.isArray(result) ? result : result.lines || [];
    for (const line of ruleLines) {
      lines.push(line);
    }
    if (result.issues && Array.isArray(result.issues)) {
      for (const issue of result.issues) {
        issues.push(issue);
      }
    }
    if (result.speedSeries) speedSeries = result.speedSeries;
    if (result.rootSpeed) rootSpeed = result.rootSpeed;
  }

  let filteredIssues = issues;
  if (options.part && options.parts && options.parts[options.part]) {
    const partDef = options.parts[options.part];
    const chSet = new Set(partDef.channels || []);
    const jtSet = new Set(partDef.joints || []);
    filteredIssues = issues.filter((iss) => {
      if (iss.channel && chSet.has(iss.channel)) return true;
      if (iss.joint && jtSet.has(iss.joint)) return true;
      return false;
    });
  }

  const fail = lines.filter((l) => l[0] === 'FAIL').length;
  const warn = lines.filter((l) => l[0] === 'WARN').length;
  return {
    lines,
    fail,
    warn,
    poses,
    floorY,
    speedSeries,
    rootSpeed,
    frames,
    issues: filteredIssues,
    compositeClip: targetClip,
    layerReports,
  };
}

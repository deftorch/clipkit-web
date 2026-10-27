import { describe, expect, it } from 'vitest';
import motusRig from '../src/data/rigs/motus.json';
import limits from '../src/data/limits.json';
import { loadRigs } from '../src/data/load-rigs.js';
import { defaultClips } from '../src/data/index.js';
import { makeCtx, restPositions } from '../src/domain/rig/rig-context.js';
import { evalPose } from '../src/domain/rig/pose-evaluator.js';
import { validate } from '../src/domain/validation/validator.js';
import { checkVrm10 } from '../src/domain/validation/vrm10/check-vrm10.js';
import { buildVrmaGlb } from '../src/domain/validation/vrm10/vrma-exporter.js';

describe('ClipKit ES Modules - Golden Tests', () => {
  const { motus, vrm_sample } = loadRigs();
  const ctxMotus = makeCtx(motus);
  const ctxVrm = makeCtx(vrm_sample.rig);

  it('makeCtx creates valid rig context', () => {
    expect(ctxMotus.names.length).toBe(55);
    expect(ctxMotus.parents.length).toBe(55);
    expect(ctxMotus.offsets.length).toBe(55);
    expect(ctxMotus.posScale).toBe(1);
    expect(ctxVrm.names.length).toBe(55);
    expect(ctxVrm.posScale).toBe(0.9391);
  });

  it('restPositions calculates accurate root and limb positions', () => {
    const pos = restPositions(ctxMotus);
    expect(pos.length).toBe(55);
    expect(pos[0][1]).toBeCloseTo(0.9675, 4); // Hips Y
  });

  it('evalPose computes pose consistently across key clips', () => {
    const clipsToTest = ['dodge', 'slash', 'idle', 'walk', 'jump'];
    for (const name of clipsToTest) {
      const clip = defaultClips[name];
      expect(clip).toBeDefined();

      const pose0 = evalPose(motus, ctxMotus, clip, 0);
      expect(pose0.pos.length).toBe(55);
      expect(pose0.local.length).toBe(55);
      expect(pose0.delta.length).toBe(55);

      const poseMid = evalPose(motus, ctxMotus, clip, clip.duration * 0.5);
      expect(poseMid.pos.length).toBe(55);

      const poseEnd = evalPose(motus, ctxMotus, clip, clip.duration);
      expect(poseEnd.pos.length).toBe(55);
    }
  });

  it('validate produces valid reports for all default clips', () => {
    for (const [name, clip] of Object.entries(defaultClips)) {
      const res = validate(motus, ctxMotus, limits, clip, 'stylized');
      expect(res.lines.length).toBeGreaterThan(0);
      expect(res.poses.length).toBeGreaterThan(0);
      expect(typeof res.fail).toBe('number');
      expect(typeof res.warn).toBe('number');
    }
  });

  it('checkVrm10 verifies VRM 1.0 conformance', () => {
    const dodgeClip = defaultClips.dodge;
    const report = checkVrm10(vrm_sample.rig, ctxVrm, dodgeClip);
    expect(report.length).toBeGreaterThanOrEqual(3);
    const fails = report.filter((r) => r[0] === 'FAIL');
    expect(fails.length).toBe(0);
  });

  it('buildVrmaGlb builds valid GLB binary blob', () => {
    const walkClip = defaultClips.walk;
    const blob = buildVrmaGlb(vrm_sample.rig, ctxVrm, walkClip);
    expect(blob).toBeDefined();
    expect(blob.type).toBe('model/gltf-binary');
    expect(blob.size).toBeGreaterThan(1000);
  });
});

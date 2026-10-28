import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import limits from '../src/data/limits.json';
import { loadRigs } from '../src/data/load-rigs.js';
import { evalPose } from '../src/domain/rig/pose-evaluator.js';
import { makeCtx, restPositions } from '../src/domain/rig/rig-context.js';
import { validate } from '../src/domain/validation/validator.js';
import { checkVrm10 } from '../src/domain/validation/vrm10/check-vrm10.js';
import { parseGlbChunks } from '../src/infrastructure/vrm/glb-parser.js';
import { buildVrmaGlb } from '../src/infrastructure/vrma/vrma-exporter.js';

describe('ClipKit ES Modules - Golden Tests', () => {
  const { motus, vrm_sample } = loadRigs();
  const ctxMotus = makeCtx(motus);
  const ctxVrm = makeCtx(vrm_sample.rig);

  // Helper to assert 3D coordinates within tolerance (0.09 mm = 0.00009 m)
  function assertCoords(actual, expected, tol = 0.00009) {
    expect(Math.abs(actual[0] - expected[0])).toBeLessThanOrEqual(tol);
    expect(Math.abs(actual[1] - expected[1])).toBeLessThanOrEqual(tol);
    expect(Math.abs(actual[2] - expected[2])).toBeLessThanOrEqual(tol);
  }

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

  it('evalPose matches exact ground truth joint coordinates within 0.09 mm tolerance', () => {
    const I = ctxMotus.idx;

    // Ground truth for dodge
    const dodge0 = evalPose(motus, ctxMotus, defaultClips.dodge, 0);
    assertCoords(dodge0.pos[I.Hips], [0, 0.9675, -0.01057]);
    assertCoords(dodge0.pos[I.Head], [0, 1.65516, -0.0398]);
    assertCoords(dodge0.pos[I.LeftHand], [0.32429, 0.94563, -0.05029]);
    assertCoords(dodge0.pos[I.RightHand], [-0.3243, 0.94563, -0.05029]);
    assertCoords(dodge0.pos[I.LeftFoot], [0.1708, 0.13848, -0.10137]);
    assertCoords(dodge0.pos[I.RightFoot], [-0.17079, 0.13847, -0.10136]);

    const dodgeMid = evalPose(
      motus,
      ctxMotus,
      defaultClips.dodge,
      defaultClips.dodge.duration * 0.5,
    );
    assertCoords(dodgeMid.pos[I.Hips], [0, 1.10387, -1.90668]);
    assertCoords(dodgeMid.pos[I.Head], [0, 1.78446, -1.81693]);
    assertCoords(dodgeMid.pos[I.LeftHand], [0.47303, 1.33637, -1.61703]);
    assertCoords(dodgeMid.pos[I.RightHand], [-0.47304, 1.33638, -1.61703]);
    assertCoords(dodgeMid.pos[I.LeftFoot], [0.1708, 0.49057, -1.89407]);
    assertCoords(dodgeMid.pos[I.RightFoot], [-0.17079, 0.49056, -1.89405]);

    // Ground truth for slash
    const slashMid = evalPose(
      motus,
      ctxMotus,
      defaultClips.slash,
      defaultClips.slash.duration * 0.5,
    );
    assertCoords(slashMid.pos[I.Hips], [0, 0.8555, 0.40343]);
    assertCoords(slashMid.pos[I.Head], [0.10021, 1.52695, 0.48739]);
    assertCoords(slashMid.pos[I.LeftHand], [0.17146, 0.99572, 0.00533]);
    assertCoords(slashMid.pos[I.RightHand], [0.37927, 1.09888, 0.79603]);
    assertCoords(slashMid.pos[I.LeftFoot], [0.13899, 0.1555, 0.30354]);
    assertCoords(slashMid.pos[I.RightFoot], [-0.39348, 0.17, 0.09602]);

    // Ground truth for parry
    const parryMid = evalPose(
      motus,
      ctxMotus,
      defaultClips.parry,
      defaultClips.parry.duration * 0.5,
    );
    assertCoords(parryMid.pos[I.Hips], [0, 0.93746, -0.04292]);
    assertCoords(parryMid.pos[I.Head], [-0.00562, 1.62017, -0.11969]);
    assertCoords(parryMid.pos[I.LeftHand], [0.36249, 1.31615, 0.24564]);
    assertCoords(parryMid.pos[I.RightHand], [-0.08691, 1.47404, 0.23522]);
    assertCoords(parryMid.pos[I.LeftFoot], [0.1708, 0.13872, -0.08299]);
    assertCoords(parryMid.pos[I.RightFoot], [-0.17079, 0.13871, -0.08298]);
  });

  it('validate produces valid reports for all default clips and enriches messages', () => {
    for (const [_name, clip] of Object.entries(defaultClips)) {
      const res = validate(motus, ctxMotus, limits, clip, 'stylized');
      expect(res.lines.length).toBeGreaterThan(0);
      expect(res.poses.length).toBeGreaterThan(0);
      expect(typeof res.fail).toBe('number');
      expect(typeof res.warn).toBe('number');

      // Check enriched knee flexion line includes joint side and timestamp
      const kneeLine = res.lines.find((l) => l[1].startsWith('lutut: fleksi'));
      expect(kneeLine).toBeDefined();
      expect(kneeLine[1]).toMatch(/@\d+\.\d+s/);
      expect(kneeLine[1]).toMatch(/(kiri|kanan)/);
    }
  });

  it('validator rejects unknown AI hallucinated channels with FAIL', () => {
    const hallucinatedClip = {
      ...defaultClips.idle,
      channels: {
        ...defaultClips.idle.channels,
        neck_pitch: [
          [0, 10],
          [1, 10],
        ],
        legL_flex: [
          [0, 20],
          [1, 20],
        ],
      },
    };
    const res = validate(motus, ctxMotus, limits, hallucinatedClip, 'stylized');
    const fails = res.lines.filter((l) => l[0] === 'FAIL');
    expect(fails.length).toBeGreaterThanOrEqual(2);
    expect(fails.some((f) => f[1].includes('channel tidak dikenal: neck_pitch'))).toBe(true);
    expect(fails.some((f) => f[1].includes('channel tidak dikenal: legL_flex'))).toBe(true);
  });

  it('checkVrm10 verifies VRM 1.0 conformance and required humanoid bones', () => {
    const dodgeClip = defaultClips.dodge;
    const report = checkVrm10(vrm_sample.rig, ctxVrm, dodgeClip);
    expect(report.length).toBeGreaterThanOrEqual(3);
    const fails = report.filter((r) => r[0] === 'FAIL');
    expect(fails.length).toBe(0);

    const boneReport = report.find((r) => r[1].includes('15 bone wajib terpenuhi'));
    expect(boneReport).toBeDefined();
    expect(boneReport[0]).toBe('PASS');
  });

  it('buildVrmaGlb round-trip matches source animation samplers within 0.05 deg error', async () => {
    const clipsToVerify = ['slash', 'dodge', 'walk'];

    for (const name of clipsToVerify) {
      const clip = defaultClips[name];
      const blob = buildVrmaGlb(vrm_sample.rig, ctxVrm, clip);
      expect(blob).toBeDefined();
      expect(blob.type).toBe('model/gltf-binary');

      const arrayBuffer = await blob.arrayBuffer();
      const { json, binary } = parseGlbChunks(arrayBuffer);

      expect(json.extensionsUsed).toContain('VRMC_vrm_animation');
      expect(json.extensions?.VRMC_vrm_animation?.specVersion).toBe('1.0');

      const anim = json.animations[0];
      const timeAcc = json.accessors[anim.samplers[0].input];
      const timeBv = json.bufferViews[timeAcc.bufferView];
      const times = new Float32Array(
        binary.buffer,
        binary.byteOffset + timeBv.byteOffset,
        timeAcc.count,
      );

      let maxAngleDeg = 0;
      for (const ch of anim.channels) {
        if (ch.target.path !== 'rotation') continue;
        const nodeIdx = ch.target.node;
        const sampler = anim.samplers[ch.sampler];
        const rotAcc = json.accessors[sampler.output];
        const rotBv = json.bufferViews[rotAcc.bufferView];
        const rots = new Float32Array(
          binary.buffer,
          binary.byteOffset + rotBv.byteOffset,
          rotAcc.count * 4,
        );

        for (let f = 0; f < times.length; f++) {
          const t = times[f];
          const pose = evalPose(vrm_sample.rig, ctxVrm, clip, t);
          const expectedQ = pose.local[nodeIdx];
          const actualQ = [rots[f * 4], rots[f * 4 + 1], rots[f * 4 + 2], rots[f * 4 + 3]];

          const dot = Math.abs(
            expectedQ[0] * actualQ[0] +
              expectedQ[1] * actualQ[1] +
              expectedQ[2] * actualQ[2] +
              expectedQ[3] * actualQ[3],
          );
          const angleDeg = 2 * Math.acos(Math.min(1, dot)) * (180 / Math.PI);
          if (angleDeg > maxAngleDeg) maxAngleDeg = angleDeg;
        }
      }

      // Assert angular error is strictly less than 0.05 degrees across all joints and frames
      expect(maxAngleDeg).toBeLessThan(0.05);
    }
  });
});

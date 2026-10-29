import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import { loadRigs } from '../src/data/load-rigs.js';
import { qangle, R2D } from '../src/domain/math/quat.js';
import { evalPose } from '../src/domain/rig/pose-evaluator.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import { buildVrmaGlb } from '../src/infrastructure/vrma/vrma-exporter.js';
import {
  importVrmaToClip,
  parseVrmaTracks,
  VRM_TO_MOTUS_BONES,
} from '../src/infrastructure/vrma/vrma-importer.js';

describe('Native VRMA & GLB Importer (Phase 3)', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('VRM_TO_MOTUS_BONES maps standard humanoid names correctly', () => {
    expect(VRM_TO_MOTUS_BONES.hips).toBe('Hips');
    expect(VRM_TO_MOTUS_BONES.leftUpperArm).toBe('LeftArm');
    expect(VRM_TO_MOTUS_BONES.rightLowerArm).toBe('RightForeArm');
    expect(VRM_TO_MOTUS_BONES.spine).toBe('Spine');
  });

  it('parseVrmaTracks parses binary GLB containing VRMC_vrm_animation', async () => {
    const slash = defaultClips.slash;
    const blob = buildVrmaGlb(motus, ctx, slash);
    const arrayBuffer = await blob.arrayBuffer();

    const tracks = parseVrmaTracks(arrayBuffer);

    expect(tracks).toBeDefined();
    expect(tracks.duration).toBeCloseTo(slash.duration, 2);
    expect(tracks.times.length).toBeGreaterThan(10);
    expect(tracks.boneRotations.RightArm).toBeDefined();
    expect(tracks.boneRotations.Spine).toBeDefined();
    expect(tracks.hipsTranslation.length).toBe(tracks.times.length);
  });

  it('importVrmaToClip decompiles VRMA into an editable ClipKit clip', async () => {
    const slash = defaultClips.slash;
    const blob = buildVrmaGlb(motus, ctx, slash);
    const arrayBuffer = await blob.arrayBuffer();

    const { clip, telemetry } = importVrmaToClip(arrayBuffer, {
      epsilon: 0.5,
    });

    expect(clip).toBeDefined();
    expect(clip.channels).toBeDefined();
    expect(clip.channels.armR_elev).toBeDefined();
    expect(clip.channels.elbowR).toBeDefined();

    // Verify keyframe reduction
    expect(telemetry.totalCompressedKeys).toBeLessThan(telemetry.totalRawKeys);
    expect(telemetry.reductionRatio).toBeGreaterThan(50);
  });

  it('Round-Trip Fidelity Benchmark: joint error within 1.0 deg tolerance', async () => {
    const slash = defaultClips.slash;
    const blob = buildVrmaGlb(motus, ctx, slash);
    const arrayBuffer = await blob.arrayBuffer();

    // Use tight epsilon to test reconstruction precision
    const { clip: importedClip } = importVrmaToClip(arrayBuffer, {
      epsilon: 0.1,
      filterJitter: false,
    });

    const frames = 15;
    let totalAngleDiff = 0;
    let sampleCount = 0;
    let maxAngleDiff = 0;

    for (let f = 0; f <= frames; f++) {
      const t = (f / frames) * slash.duration;
      const poseOrig = evalPose(motus, ctx, slash, t);
      const poseImported = evalPose(motus, ctx, importedClip, t);

      for (let i = 0; i < ctx.n; i++) {
        const diffDeg = qangle(poseOrig.local[i], poseImported.local[i]) * R2D;
        totalAngleDiff += diffDeg;
        sampleCount++;
        if (diffDeg > maxAngleDiff) {
          maxAngleDiff = diffDeg;
        }
      }
    }

    const avgAngleDiff = totalAngleDiff / sampleCount;

    // Benchmark requirement: average joint angle error under 1.0 deg and peak under 2.5 deg
    expect(avgAngleDiff).toBeLessThan(1.0);
    expect(maxAngleDiff).toBeLessThan(2.5);
  });
});

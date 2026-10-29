import { describe, expect, it } from 'vitest';
import {
  detectFootPlantedWindows,
  extractBvhSamples,
  importBvhToClip,
  parseBvhRaw,
  resolveBoneAlias,
} from '../src/infrastructure/mocap/bvh-parser.js';

const SAMPLE_BVH = `HIERARCHY
ROOT Hips
{
  OFFSET 0.00 0.00 0.00
  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
  JOINT Spine
  {
    OFFSET 0.00 12.00 0.00
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT RightArm
    {
      OFFSET -18.00 14.00 0.00
      CHANNELS 3 Zrotation Xrotation Yrotation
      End Site
      {
        OFFSET -20.00 0.00 0.00
      }
    }
  }
}
MOTION
Frames: 4
Frame Time: 0.0333333
0.0 90.0 0.0 0.0 0.0 0.0 0.0 5.0 0.0 0.0 -10.0 0.0
0.0 90.0 5.0 0.0 0.0 0.0 0.0 10.0 0.0 0.0 -30.0 0.0
0.0 90.0 10.0 0.0 0.0 0.0 0.0 15.0 0.0 0.0 -60.0 0.0
0.0 90.0 15.0 0.0 0.0 0.0 0.0 5.0 0.0 0.0 -10.0 0.0
`;

describe('BVH Mocap Ingestion & Bone Mapping (Phase 5)', () => {
  it('resolveBoneAlias maps Mixamo and Biped naming conventions', () => {
    expect(resolveBoneAlias('mixamorig:Hips')).toBe('Hips');
    expect(resolveBoneAlias('mixamorig:RightArm')).toBe('RightArm');
    expect(resolveBoneAlias('Bip01_Pelvis')).toBe('Hips');
    expect(resolveBoneAlias('Bip01_L_Thigh')).toBe('LeftUpLeg');
    expect(resolveBoneAlias('Bip01_R_Calf')).toBe('RightLeg');
  });

  it('parseBvhRaw parses hierarchy and motion channels', () => {
    const parsed = parseBvhRaw(SAMPLE_BVH);

    expect(parsed).toBeDefined();
    expect(parsed.frameCount).toBe(4);
    expect(parsed.frameTime).toBeCloseTo(0.0333333, 5);
    expect(parsed.bones.length).toBe(3);
    expect(parsed.bones[0].canonicalName).toBe('Hips');
    expect(parsed.bones[1].canonicalName).toBe('Spine');
    expect(parsed.bones[2].canonicalName).toBe('RightArm');
  });

  it('extractBvhSamples transforms BVH data into rotations and root motion', () => {
    const parsed = parseBvhRaw(SAMPLE_BVH);
    const samples = extractBvhSamples(parsed);

    expect(samples.times.length).toBe(4);
    expect(samples.hipsTranslation.length).toBe(4);
    expect(samples.boneRotations.RightArm).toBeDefined();
    expect(samples.boneRotations.RightArm.length).toBe(4);
  });

  it('detectFootPlantedWindows identifies contact intervals', () => {
    const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    const heights = [0.01, 0.02, 0.01, 0.15, 0.2, 0.3]; // Planted between 0 and 0.2

    const win = detectFootPlantedWindows(times, heights, 0.05);
    expect(win).toBeDefined();
    expect(win[0]).toBe(0);
    expect(win[1]).toBeCloseTo(0.2, 2);
  });

  it('importBvhToClip decompiles BVH text into a valid ClipKit clip', () => {
    const { clip, telemetry } = importBvhToClip(SAMPLE_BVH);

    expect(clip).toBeDefined();
    expect(clip.channels).toBeDefined();
    expect(clip.channels.hip_y).toBeDefined();
    expect(telemetry.totalCompressedKeys).toBeGreaterThan(0);
  });
});

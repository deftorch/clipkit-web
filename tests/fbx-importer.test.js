import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { importFbxToClip, parseFbxTracks } from '../src/infrastructure/mocap/fbx-importer.js';

const MOTORICA_SAMPLE =
  '/home/deftorch/Documents/AI/Motion Matching/Motorica MM Dataset v1/v1/idle/idle_loop/Idle_Loop.fbx';

describe('FBX Mocap Ingestion & Bone Mapping (Motorica MM Dataset)', () => {
  const hasSample = fs.existsSync(MOTORICA_SAMPLE);

  it.skipIf(!hasSample)(
    'parseFbxTracks extracts rotations, normalized root motion, and times from FBX',
    () => {
      const buf = fs.readFileSync(MOTORICA_SAMPLE);
      const parsed = parseFbxTracks(buf);

      expect(parsed).toBeDefined();
      expect(parsed.duration).toBeGreaterThan(0);
      expect(parsed.times.length).toBeGreaterThan(10);
      expect(parsed.boneRotations.Hips).toBeDefined();
      expect(parsed.boneRotations.LeftArm).toBeDefined();
      expect(parsed.boneRotations.RightArm).toBeDefined();
      expect(parsed.boneRotations.LeftUpLeg).toBeDefined();
      expect(parsed.boneRotations.RightUpLeg).toBeDefined();
    },
  );

  it.skipIf(!hasSample)(
    'importFbxToClip decompiles Motorica FBX into valid ClipKit channels with curve compression',
    () => {
      const buf = fs.readFileSync(MOTORICA_SAMPLE);
      const { clip, telemetry } = importFbxToClip(buf, { epsilon: 0.8 });

      expect(clip).toBeDefined();
      expect(clip.name).toBeDefined();
      expect(clip.duration).toBeGreaterThan(0);
      expect(Object.keys(clip.channels).length).toBeGreaterThan(15);
      expect(clip.channels.armL_elev).toBeDefined();
      expect(clip.channels.armR_elev).toBeDefined();
      expect(clip.channels.kneeL).toBeDefined();
      expect(clip.channels.kneeR).toBeDefined();

      // Telemetry reduction check
      expect(telemetry.reductionRatio).toBeGreaterThan(50);
      expect(telemetry.totalCompressedKeys).toBeLessThan(telemetry.totalRawKeys);
    },
    20000,
  );
});

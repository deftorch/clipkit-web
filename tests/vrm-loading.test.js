import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import motusRig from '../src/data/rigs/motus.json';
import { parseGlb } from '../src/infrastructure/vrm/glb-parser.js';
import { buildRig } from '../src/infrastructure/vrm/vrm-rig-builder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_PATH = path.resolve(__dirname, 'fixtures/deft.vrm');

describe('VRM Loading & Parsing Smoke Test', () => {
  it('loads and verifies binary Deft.vrm file presence', () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    const stat = fs.statSync(FIXTURE_PATH);
    expect(stat.size).toBeGreaterThan(1_000_000); // ~15 MB
  });

  it('parses binary GLB chunks and VRMC_vrm metadata correctly', () => {
    const buffer = fs.readFileSync(FIXTURE_PATH);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
    const gltf = parseGlb(arrayBuffer);

    expect(gltf).toBeDefined();
    expect(gltf.asset).toBeDefined();
    expect(gltf.extensions?.VRMC_vrm).toBeDefined();
    expect(gltf.extensions.VRMC_vrm.specVersion).toBe('1.0');
    expect(gltf.extensions.VRMC_vrm.humanoid?.humanBones).toBeDefined();
  });

  it('builds full 55-bone humanoid rig from parsed VRM 1.0', () => {
    const buffer = fs.readFileSync(FIXTURE_PATH);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
    const gltf = parseGlb(arrayBuffer);
    const { rig, info } = buildRig(gltf, motusRig, 'Deft');

    expect(rig).toBeDefined();
    expect(rig.kind).toBe('vrm1');
    expect(rig.name).toBe('Deft');
    expect(rig.animated_bones.length).toBe(55);
    expect(rig.rest.offsets.length).toBe(55);
    expect(rig.rest.parents.length).toBe(55);

    // Hips offset Y should be around ~0.7m to 1.1m
    expect(rig.rest.offsets[0][1]).toBeGreaterThan(0.6);
    expect(rig.rest.offsets[0][1]).toBeLessThan(1.2);

    expect(info).toBeDefined();
    expect(info.spec).toBe('1.0');
    expect(info.present).toBe(22);
    expect(info.total).toBe(22);
    expect(info.warns).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import motusRig from '../src/data/rigs/motus.json';
import { MAP_M2V } from '../src/domain/validation/vrm10/constants.js';
import { buildRig } from '../src/infrastructure/vrm/vrm-rig-builder.js';

describe('VrmRig infrastructure module', () => {
  it('buildRig throws if not VRMC_vrm', () => {
    expect(() => buildRig({}, motusRig)).toThrow('Ekstensi VRMC_vrm tidak ditemukan');
    expect(() => buildRig({ extensions: { VRM: {} } }, motusRig)).toThrow('File ini VRM 0.x');
  });

  it('buildRig builds valid rig given minimal humanoid gltf', () => {
    const nodes = [];
    const humanBones = {};

    for (const [ib, vk] of Object.entries(MAP_M2V)) {
      const nodeIdx = nodes.length;
      // Provide reasonable coordinates (Hips around Y=0.9, Left higher X than Right)
      let tr = [0, 0.5, 0];
      if (ib === 'Hips') tr = [0, 0.95, 0];
      else if (ib.startsWith('Left')) tr = [0.2, 0.5, 0.1];
      else if (ib.startsWith('Right')) tr = [-0.2, 0.5, 0.1];
      else if (ib === 'Head') tr = [0, 1.5, 0];

      nodes.push({ name: vk, translation: tr });
      humanBones[vk] = { node: nodeIdx };
    }

    const gltf = {
      scene: 0,
      scenes: [{ nodes: nodes.map((_, i) => i) }],
      nodes,
      extensions: {
        VRMC_vrm: {
          specVersion: '1.0',
          humanoid: { humanBones },
          meta: { name: 'TestAvatar' },
        },
      },
    };

    const res = buildRig(gltf, motusRig, 'TestRig');
    expect(res.rig.name).toBe('TestRig');
    expect(res.rig.kind).toBe('vrm1');
    expect(res.rig.animated_bones.length).toBe(55);
    expect(res.info.name).toBe('TestRig');
    expect(res.info.present).toBe(22);
  });
});

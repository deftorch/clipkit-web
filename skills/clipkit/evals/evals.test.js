import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { defaultClips } from '../../../src/data/index.js';
import { defaultPoses } from '../../../src/data/poses/index.js';
import { composeClips } from '../../../src/domain/animation/compose.js';
import { main } from '../../../src/cli/cli.js';

describe('ClipKit Skill Evals', () => {
  const evalDir = path.resolve(__dirname, 'scratch_evals');

  beforeAll(() => {
    if (!fs.existsSync(evalDir)) {
      fs.mkdirSync(evalDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(evalDir)) {
      fs.rmSync(evalDir, { recursive: true, force: true });
    }
  });

  it('Eval 1: "make a jump" (passes validation with zero FAIL, saved as v1)', async () => {
    const jumpClip = {
      name: 'agent_jump',
      format_version: 2,
      version: 1,
      duration: 0.9,
      loop: false,
      changelog: [{ v: 1, catatan: 'Initial bipedal jump.' }],
      channels: {
        hip_y: [
          [0, 0.9],
          [0.2, 0.75, 'inQuad'],
          [0.45, 1.35, 'outQuad'],
          [0.9, 0.9, 'outBounce'],
        ],
        lean: [
          [0, 0],
          [0.2, 18, 'inOutSine'],
          [0.45, -5, 'outQuad'],
          [0.9, 0, 'inOutSine'],
        ],
        kneeL: [
          [0, 10],
          [0.2, 50, 'inQuad'],
          [0.45, 20, 'outQuad'],
          [0.9, 10, 'outBounce'],
        ],
        kneeR: [
          [0, 10],
          [0.2, 50, 'inQuad'],
          [0.45, 20, 'outQuad'],
          [0.9, 10, 'outBounce'],
        ],
        armR_elev: [
          [0, -70],
          [0.2, -80, 'inQuad'],
          [0.45, 45, 'outQuad'],
          [0.9, -70, 'inOutSine'],
        ],
      },
      windows: {
        inv: [0.3, 0.6],
        planted_L: [0, 0.2],
        planted_R: [0, 0.2],
      },
      events: [
        { t: 0.2, id: 'takeoff' },
        { t: 0.45, id: 'apex' },
        { t: 0.75, id: 'landing' },
      ],
      move: [0, 0, 1.2],
    };

    const clipPath = path.join(evalDir, 'agent_jump.json');
    fs.writeFileSync(clipPath, JSON.stringify(jumpClip), 'utf8');

    // 1. Validate
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);
    const valCode = await main(['validate', clipPath, '--json']);
    console.log = origLog;

    expect(valCode).toBe(0);
    const valReport = JSON.parse(logs[0]);
    expect(valReport.valid).toBe(true);
    expect(valReport.failCount).toBe(0);

    // 2. Save as v1 variant
    const varDir = path.join(evalDir, 'variants_jump');
    const verCode = await main([
      'version',
      clipPath,
      '--parent',
      '1',
      '--note',
      'Initial jump',
      '--dir',
      varDir,
    ]);
    expect(verCode).toBe(0);

    const v1Path = path.join(varDir, 'v1.json');
    expect(fs.existsSync(v1Path)).toBe(true);
    const manifestPath = path.join(varDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('Eval 2: "make a floatier variant" (new child version, parent untouched)', async () => {
    const varDir = path.join(evalDir, 'variants_jump');
    const v1Path = path.join(varDir, 'v1.json');
    const origV1Content = fs.readFileSync(v1Path, 'utf8');

    // Create floatier child variant (longer airtime, higher apex)
    const v1Clip = JSON.parse(origV1Content);
    const floatyClip = {
      ...v1Clip,
      version: 2,
      changelog: [
        ...v1Clip.changelog,
        { v: 2, catatan: 'Floatier jump variant with prolonged apex.' },
      ],
      duration: 1.2,
      channels: {
        ...v1Clip.channels,
        hip_y: [
          [0, 0.9],
          [0.2, 0.75, 'inQuad'],
          [0.55, 1.5, 'outQuad'],
          [0.8, 1.45, 'inOutSine'],
          [1.2, 0.9, 'outBounce'],
        ],
      },
    };

    const floatyPath = path.join(evalDir, 'jump_floaty.json');
    fs.writeFileSync(floatyPath, JSON.stringify(floatyClip), 'utf8');

    // Save as v2
    const verCode = await main([
      'version',
      floatyPath,
      '--parent',
      '1',
      '--note',
      'Floatier apex with delayed descent',
      '--dir',
      varDir,
    ]);
    expect(verCode).toBe(0);

    // Assert parent v1 is 100% untouched
    expect(fs.readFileSync(v1Path, 'utf8')).toBe(origV1Content);

    // Assert v2 exists and manifest updated
    const v2Path = path.join(varDir, 'v2.json');
    expect(fs.existsSync(v2Path)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(path.join(varDir, 'manifest.json'), 'utf8'));
    expect(manifest.defaultVersion).toBe(2);
    expect(manifest.versions['2'].parent).toBe(1);
    expect(manifest.versions['2'].note).toContain('Floatier');
    expect(manifest.versions['2'].metrics.airtime).toBeGreaterThan(manifest.versions['1'].metrics.airtime);
  });

  it('Eval 3: "add an angry face to this clip" (only face channels change, exports to .vrma)', async () => {
    const baseClip = defaultClips.slash;
    const angryPose = defaultPoses.face_angry;

    const layeredClip = {
      ...JSON.parse(JSON.stringify(baseClip)),
      format_version: 2,
      layers: [
        {
          ref: 'face_angry',
          mode: 'override',
        },
      ],
    };

    const { clip: composed } = composeClips(layeredClip, layeredClip.layers, {
      resolveRef: (ref) => (ref === 'face_angry' ? angryPose : null),
    });

    // Verify non-face channels are strictly identical
    for (const [ch, kfs] of Object.entries(baseClip.channels)) {
      if (!['jaw_open', 'eye_yaw', 'eye_pitch'].includes(ch)) {
        expect(composed.channels[ch]).toEqual(kfs);
      }
    }

    // Verify angry expression was added
    expect(composed.expressions.angry).toBeDefined();

    // Export to .vrma
    const outVrma = path.join(evalDir, 'slash_angry.vrma');
    const compPath = path.join(evalDir, 'slash_angry.json');
    fs.writeFileSync(compPath, JSON.stringify(composed), 'utf8');

    const expCode = await main(['export', compPath, '--out', outVrma]);
    expect(expCode).toBe(0);
    expect(fs.existsSync(outVrma)).toBe(true);
    expect(fs.statSync(outVrma).size).toBeGreaterThan(1000);
  });
});

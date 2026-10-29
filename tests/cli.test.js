import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CLI_VERSION, main } from '../src/cli/cli.js';

describe('ClipKit Agent CLI (cli.js)', () => {
  const testDir = path.resolve(__dirname, 'scratch_cli_test');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('prints version and exits with code 0 on --version', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['--version']);
    console.log = origLog;

    expect(code).toBe(0);
    expect(logs.some((l) => l.includes(`clipkit v${CLI_VERSION}`))).toBe(true);
  });

  it('validates a reference clip with --json and deterministic output', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['validate', 'src/data/clips/slash.json', '--json']);
    console.log = origLog;

    expect(code).toBe(0);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.valid).toBe(true);
    expect(parsed.style).toBe('stylized');
    expect(parsed.failCount).toBe(0);
    expect(Array.isArray(parsed.issues)).toBe(true);
  });

  it('fails validation when --fail-on warn is specified on a clip with warnings', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main([
      'validate',
      'src/data/clips/slash.json',
      '--fail-on',
      'warn',
      '--json',
    ]);
    console.log = origLog;

    expect(code).toBe(1);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.valid).toBe(false);
    expect(parsed.warnCount).toBeGreaterThan(0);
  });

  it('filters validation checks with --part', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['validate', 'src/data/clips/slash.json', '--part', 'torso', '--json']);
    console.log = origLog;

    expect(code).toBe(0);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.part).toBe('torso');
    // Foot slide is on legs/floor, so torso filter should have 0 issues
    expect(parsed.issues.length).toBe(0);
  });

  it('validates clip schema and flags unknown channels with hints', async () => {
    const badClipPath = path.join(testDir, 'bad_schema_clip.json');
    fs.writeFileSync(
      badClipPath,
      JSON.stringify({
        duration: 1.0,
        channels: {
          neck_pitch: [
            [0, 10],
            [1, 20],
          ],
        },
      }),
      'utf8',
    );

    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['schema', badClipPath, '--json']);
    console.log = origLog;

    expect(code).toBe(1);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.valid).toBe(false);
    const err = parsed.errors.find((e) => e.path === 'channels.neck_pitch');
    expect(err).toBeDefined();
    expect(err.hint).toContain("did you mean 'head_pitch'");
  });

  it('lists channels filtered by part in JSON format', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['channels', '--part', 'arms', '--json']);
    console.log = origLog;

    expect(code).toBe(0);
    const channels = JSON.parse(logs[0]);
    expect(channels.length).toBe(8);
    expect(channels.every((c) => c.part === 'arms')).toBe(true);
  });

  it('lists registered validation rules and limits', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['rules', '--json']);
    console.log = origLog;

    expect(code).toBe(0);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.rules.length).toBeGreaterThanOrEqual(8);
    expect(parsed.ruleCodes.SPEED_LIMIT).toBe('SPEED_LIMIT');
    expect(parsed.limits.styles.stylized).toBeDefined();
  });

  it('exports clip to .vrma binary and enforces overwrite protection', async () => {
    const outVrma = path.join(testDir, 'slash_export.vrma');

    // First export should succeed
    const code1 = await main(['export', 'src/data/clips/slash.json', '--out', outVrma]);
    expect(code1).toBe(0);
    expect(fs.existsSync(outVrma)).toBe(true);
    const stat = fs.statSync(outVrma);
    expect(stat.size).toBeGreaterThan(1000);

    // Second export without --force should fail
    const code2 = await main(['export', 'src/data/clips/slash.json', '--out', outVrma]);
    expect(code2).toBe(2);

    // With --force should succeed
    const code3 = await main(['export', 'src/data/clips/slash.json', '--out', outVrma, '--force']);
    expect(code3).toBe(0);
  });

  it('refuses to write outside working directory without --allow-outside', async () => {
    const outsidePath = '/tmp/outside_test.vrma';
    const code = await main(['export', 'src/data/clips/slash.json', '--out', outsidePath]);
    expect(code).toBe(2);
  });

  it('runs check with --sheet and produces structured JSON and files', async () => {
    const sheetDir = path.join(testDir, 'check_sheet_out');
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['check', 'src/data/clips/dodge.json', '--sheet', sheetDir, '--json']);
    console.log = origLog;

    expect(code).toBe(0);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.valid).toBe(true);
    expect(parsed.sheet).toBeDefined();
    expect(fs.existsSync(parsed.sheet.imagePath)).toBe(true);
    expect(fs.existsSync(parsed.sheet.metadataPath)).toBe(true);

    const svgContent = fs.readFileSync(parsed.sheet.imagePath, 'utf8');
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('dodge');

    const metaContent = JSON.parse(fs.readFileSync(parsed.sheet.metadataPath, 'utf8'));
    expect(metaContent.frameCount).toBe(8);
    expect(metaContent.rootTravel).toBeDefined();
  });

  it('runs poses list and poses show commands', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const codeList = await main(['poses', 'list', '--json']);
    const codeShow = await main(['poses', 'show', 'fist_L', '--json']);
    console.log = origLog;

    expect(codeList).toBe(0);
    expect(codeShow).toBe(0);

    const posesList = JSON.parse(logs[0]);
    expect(posesList.length).toBeGreaterThanOrEqual(8);
    expect(posesList.some((p) => p.name === 'fist_L')).toBe(true);

    const poseDetail = JSON.parse(logs[1]);
    expect(poseDetail.name).toBe('fist_L');
    expect(poseDetail.part).toBe('hands');
    expect(poseDetail.channels.indexL).toBeDefined();
  });

  it('runs edit mirror and retime commands', async () => {
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const codeMirror = await main(['edit', 'mirror', 'slash', '--json']);
    const codeRetime = await main(['edit', 'retime', 'slash', '--scale', '1.5', '--json']);
    console.log = origLog;

    expect(codeMirror).toBe(0);
    expect(codeRetime).toBe(0);

    const mirrored = JSON.parse(logs[0]);
    expect(mirrored.name).toBe('slash_mirror');
    expect(mirrored.channels).toBeDefined();

    const retimed = JSON.parse(logs[1]);
    expect(retimed.duration).toBeCloseTo(1.35, 2);
  });

  it('runs compare command reporting kinematic diffs and side-by-side sheet', async () => {
    const sheetDir = path.join(testDir, 'compare_sheet_out');
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    const code = await main(['compare', 'jump', 'slash', '--sheet', sheetDir, '--json']);
    console.log = origLog;

    expect(code).toBe(0);
    const result = JSON.parse(logs[0]);
    expect(result.clipA).toBe('jump');
    expect(result.clipB).toBe('slash');
    expect(result.metricsA.rootTravel).toBe(1.5);
    expect(result.diff.rootTravel).toBe(-1.5);
    expect(result.sheet).toBeDefined();
    expect(fs.existsSync(result.sheet)).toBe(true);

    const svgContent = fs.readFileSync(result.sheet, 'utf8');
    expect(svgContent).toContain('<svg');
    expect(svgContent).toContain('jump');
    expect(svgContent).toContain('slash');
  });

  it('runs version command creating variant folder with manifest.json', async () => {
    const varDir = path.join(testDir, 'jump_variants');
    const logs = [];
    const origLog = console.log;
    console.log = (msg) => logs.push(msg);

    // Initial version
    const code1 = await main([
      'version',
      'jump',
      '--parent',
      '1',
      '--note',
      'Floatier apex',
      '--dir',
      varDir,
      '--json',
    ]);
    console.log = origLog;

    expect(code1).toBe(0);
    const meta = JSON.parse(logs[0]);
    expect(meta.version).toBe(1);
    expect(meta.note).toBe('Floatier apex');

    const manifestPath = path.join(varDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.defaultVersion).toBe(1);
    expect(manifest.versions['1'].metrics.rootTravel).toBe(1.5);

    // Refusal without --force
    const code2 = await main([
      'version',
      'jump',
      '--parent',
      '1',
      '--note',
      'Duplicate attempt',
      '--dir',
      varDir,
    ]);
    expect(code2).toBe(1);

    // Success with --force
    const code3 = await main([
      'version',
      'jump',
      '--parent',
      '1',
      '--note',
      'Forced overwrite',
      '--dir',
      varDir,
      '--force',
    ]);
    expect(code3).toBe(0);
  });

  it('runs compose command flattening layers into regular clip', async () => {
    const layeredClip = {
      name: 'jump_punch',
      duration: 1.0,
      channels: {
        hip_y: [
          [0, 0.9],
          [1.0, 0.9],
        ],
      },
      layers: [
        {
          ref: 'punch_arm_R',
          channels: ['armR_*'],
          mode: 'override',
        },
      ],
    };
    const inputPath = path.join(testDir, 'layered_input.json');
    const outputPath = path.join(testDir, 'composed_out.json');
    fs.writeFileSync(inputPath, JSON.stringify(layeredClip), 'utf8');

    const code = await main(['compose', inputPath, '--output', outputPath]);
    expect(code).toBe(0);
    expect(fs.existsSync(outputPath)).toBe(true);

    const composed = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(composed.layers).toBeUndefined();
    expect(composed.channels.hip_y).toBeDefined();
    expect(composed.channels.armR_elev).toBeDefined();
  });

  it('returns code 2 for unknown commands and missing arguments', async () => {
    expect(await main(['non_existent_command'])).toBe(2);
    expect(await main(['validate'])).toBe(3); // Usage error caught
  });
});

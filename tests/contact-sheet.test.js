import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runSheet } from '../src/cli/commands/sheet.js';
import { defaultClips } from '../src/data/index.js';
import { loadRigs } from '../src/data/load-rigs.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import {
  renderContactSheet,
  renderSingleFrameSvg,
} from '../src/presentation/export/contact-sheet-renderer.js';

describe('Headless Contact Sheet Renderer', () => {
  const { motus } = loadRigs();
  const ctx = makeCtx(motus);

  it('renders a contact sheet with SVG output and metadata sidecar', () => {
    const clip = defaultClips.slash;
    const res = renderContactSheet(motus, ctx, clip, { frameCount: 8 });

    expect(res.svg).toBeDefined();
    expect(res.svg).toContain('<svg');
    expect(res.svg).toContain('</svg>');
    expect(res.svg).toContain('ClipKit Contact Sheet');
    expect(res.width).toBeGreaterThan(1000);
    expect(res.height).toBeGreaterThan(300);

    // Verify metadata
    expect(res.metadata).toBeDefined();
    expect(res.metadata.frameCount).toBe(8);
    expect(res.metadata.frames.length).toBe(8);
    expect(res.metadata.frames[0].index).toBe(0);
    expect(res.metadata.frames[7].index).toBe(7);
    expect(res.metadata.rootTravel).toBeDefined();
    expect(res.metadata.bounds).toBeDefined();
    expect(res.metadata.bounds.min[1]).toBeDefined();
    expect(res.metadata.bounds.max[1]).toBeGreaterThan(res.metadata.bounds.min[1]);
  });

  it('supports silhouette mode and multi-view generation', () => {
    const clip = defaultClips.dodge;
    const res = renderContactSheet(motus, ctx, clip, {
      frameCount: 6,
      silhouette: true,
      view: 'multi',
    });

    expect(res.svg).toContain('Silhouette: ON');
    expect(res.svg).toContain('FRONT');
    expect(res.svg).toContain('SIDE');
    expect(res.metadata.camera.views.length).toBe(3);
    expect(res.metadata.frames.length).toBe(6);
  });

  it('guarantees deterministic, byte-identical output for identical inputs', () => {
    const clip = defaultClips.walk;
    const res1 = renderContactSheet(motus, ctx, clip, { frameCount: 8 });
    const res2 = renderContactSheet(motus, ctx, clip, { frameCount: 8 });

    expect(res1.svg).toBe(res2.svg);
    expect(JSON.stringify(res1.metadata)).toBe(JSON.stringify(res2.metadata));
  });

  it('renders isolated single animation frames for GIF export', () => {
    const clip = defaultClips.jump;
    const svg0 = renderSingleFrameSvg(motus, ctx, clip, 0.0);
    const svgMid = renderSingleFrameSvg(motus, ctx, clip, 0.45);

    expect(svg0).toContain('<svg');
    expect(svg0).toContain('</svg>');
    expect(svg0).toContain('t=0.00s');
    expect(svgMid).toContain('t=0.45s');
    expect(svg0).not.toBe(svgMid);
  });

  it('exports contact sheet as PNG and animated GIF via runSheet', () => {
    const tmpOut = path.resolve('/tmp', `test_sheet_${Date.now()}`);
    fs.mkdirSync(tmpOut, { recursive: true });
    const clipPath = path.resolve('src/data/clips/slash.json');

    const exitCode = runSheet([clipPath], {
      dir: tmpOut,
      frames: 4,
      png: true,
      gif: true,
      force: true,
      allowOutside: true,
    });

    expect(exitCode).toBe(0);
    const svgPath = path.join(tmpOut, 'slash_sheet.svg');
    const pngPath = path.join(tmpOut, 'slash_sheet.png');
    const gifPath = path.join(tmpOut, 'slash_sheet.gif');

    expect(fs.existsSync(svgPath)).toBe(true);
    expect(fs.existsSync(pngPath)).toBe(true);
    expect(fs.existsSync(gifPath)).toBe(true);
    expect(fs.statSync(pngPath).size).toBeGreaterThan(100);
    expect(fs.statSync(gifPath).size).toBeGreaterThan(100);

    fs.rmSync(tmpOut, { recursive: true, force: true });
  });
});

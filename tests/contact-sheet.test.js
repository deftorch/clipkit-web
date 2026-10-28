import { describe, expect, it } from 'vitest';
import { defaultClips } from '../src/data/index.js';
import { loadRigs } from '../src/data/load-rigs.js';
import { makeCtx } from '../src/domain/rig/rig-context.js';
import { renderContactSheet } from '../src/presentation/export/contact-sheet-renderer.js';

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
});

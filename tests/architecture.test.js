import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = path.resolve(__dirname, '../src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function getLayer(filePath) {
  const rel = path.relative(SRC_ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'main.js' || rel.startsWith('cli/')) return 'root';
  if (rel.startsWith('domain/')) return 'domain';
  if (rel.startsWith('application/')) return 'application';
  if (rel.startsWith('infrastructure/')) return 'infrastructure';
  if (rel.startsWith('presentation/')) return 'presentation';
  if (rel.startsWith('data/')) return 'data';
  return 'unknown';
}

function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex =
    /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]|export\s+(?:[\w*\s{},]*\s+from\s+)['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  const specifiers = [];
  for (const match of content.matchAll(importRegex)) {
    specifiers.push(match[1] || match[2] || match[3]);
  }
  return specifiers;
}

describe('Architectural Layer Boundaries', () => {
  const allFiles = getAllFiles(SRC_ROOT);

  it('scans and categorizes all source files', () => {
    expect(allFiles.length).toBeGreaterThan(15);
    const layers = new Set(allFiles.map(getLayer));
    expect(layers.has('domain')).toBe(true);
    expect(layers.has('application')).toBe(true);
    expect(layers.has('infrastructure')).toBe(true);
    expect(layers.has('presentation')).toBe(true);
    expect(layers.has('root')).toBe(true);
  });

  it('enforces Clean Architecture layer dependency rules across all files', () => {
    const violations = [];

    for (const filePath of allFiles) {
      const sourceLayer = getLayer(filePath);
      const relPath = path.relative(SRC_ROOT, filePath).replace(/\\/g, '/');
      const specifiers = extractImports(filePath);

      for (const spec of specifiers) {
        if (!spec.startsWith('.')) {
          // External npm module or node builtin
          if (sourceLayer === 'domain') {
            violations.push(`[${relPath}] domain module cannot import external package '${spec}'`);
          } else if (sourceLayer === 'application') {
            violations.push(
              `[${relPath}] application module cannot import external package '${spec}'`,
            );
          }
          continue;
        }

        // Relative import: resolve absolute target path
        const targetPath = path.resolve(path.dirname(filePath), spec);
        const targetLayer = getLayer(targetPath);

        // Rule 1: domain imports nothing outside domain
        if (sourceLayer === 'domain' && targetLayer !== 'domain') {
          violations.push(
            `[${relPath}] (${sourceLayer}) forbidden import from '${targetLayer}': '${spec}'`,
          );
        }

        // Rule 2: application imports domain and data only (never infrastructure or presentation)
        if (
          sourceLayer === 'application' &&
          targetLayer !== 'application' &&
          targetLayer !== 'domain' &&
          targetLayer !== 'data'
        ) {
          violations.push(
            `[${relPath}] (${sourceLayer}) forbidden import from '${targetLayer}': '${spec}'`,
          );
        }

        // Rule 3: infrastructure imports domain and data only (never application or presentation)
        if (
          sourceLayer === 'infrastructure' &&
          targetLayer !== 'infrastructure' &&
          targetLayer !== 'domain' &&
          targetLayer !== 'data'
        ) {
          violations.push(
            `[${relPath}] (${sourceLayer}) forbidden import from '${targetLayer}': '${spec}'`,
          );
        }

        // Rule 4: presentation imports application, domain, data only (never infrastructure)
        if (sourceLayer === 'presentation' && targetLayer === 'infrastructure') {
          violations.push(
            `[${relPath}] (${sourceLayer}) forbidden import from '${targetLayer}': '${spec}'`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  }, 20000);
});

const clipModules = import.meta.glob('./clips/*.json', { eager: true });

export const defaultClips = {};
for (const [filePath, mod] of Object.entries(clipModules)) {
  const name = filePath.replace(/^\.\/clips\//, '').replace(/\.json$/, '');
  defaultClips[name] = mod.default || mod;
}

export { defaultPoses } from './poses/index.js';

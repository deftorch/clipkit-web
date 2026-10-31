const poseModules = import.meta.glob('./*.json', { eager: true });

export const defaultPoses = {};
for (const [filePath, mod] of Object.entries(poseModules)) {
  const name = filePath.replace(/^\.\//, '').replace(/\.json$/, '');
  defaultPoses[name] = mod.default || mod;
}

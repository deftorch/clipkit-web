import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    target: 'node18',
    ssr: 'src/cli/cli-entry.js',
    outDir: 'bin',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'clipkit.mjs',
        banner: '#!/usr/bin/env node\n',
      },
      external: ['node:fs', 'node:path', 'node:process', 'node:util', 'node:buffer'],
    },
  },
});

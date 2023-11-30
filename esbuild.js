const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./src/**/*.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outdir: './dist',
  })
  .catch(() => process.exit(1));

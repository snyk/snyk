import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/cli/index.ts'],
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: "dist/cli/index.js",
  external: [
    "*.node",
  ]
})
import * as esbuild from 'esbuild';
import esbuildPluginLicense from 'esbuild-plugin-license';

await esbuild.build({
  entryPoints: ['./src/cli/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/cli/index.js',
  external: ['*.node'],
  plugins: [
    esbuildPluginLicense({
      thirdParty: {
        includePrivate: false,
        output: {
          file: 'dist/cli/thirdPartyNotice.tmp.json',
          template(deps) {
            return JSON.stringify(
              deps.map((dep) => ({
                name: dep.packageJson.name,
                version: dep.packageJson.version,
                author: dep.packageJson.author?.name || null,
                repository: dep.packageJson.repository,
                source: dep.packageJson.source || `https://registry.npmjs.org/${dep.packageJson.name}/-/${dep.packageJson.name}-${dep.packageJson.version}.tgz`,
                license: dep.packageJson.license,
                licenseText: dep.licenseText,
              })),
            );
          },
        },
      },
    }),
  ],
});

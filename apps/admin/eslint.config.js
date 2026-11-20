import { baseConfig } from '@seego/eslint-config';
import { featureBoundaries } from '@seego/eslint-config/architecture';
import { reactConfig } from '@seego/eslint-config/react';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  ...reactConfig(),
  ...featureBoundaries({
    root: new URL('.', import.meta.url),
    sharedFiles: ['src/{components,config,hooks,lib}/**/*.{ts,tsx}'],
  }),
  {
    ignores: ['dist/**', 'src/app/routeTree.gen.ts'],
  },
];

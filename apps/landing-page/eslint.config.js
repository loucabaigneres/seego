import { baseConfig } from '@seego/eslint-config';
import { reactConfig } from '@seego/eslint-config/react';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  ...reactConfig({ reactRefresh: true }),
  {
    ignores: ['dist/**'],
  },
];

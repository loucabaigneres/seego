import { baseConfig } from '@seego/eslint-config';
import { featureBoundaries } from '@seego/eslint-config/architecture';
import { reactConfig } from '@seego/eslint-config/react';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  ...reactConfig({ globals: { __DEV__: 'readonly' } }),
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: globals.jest },
  },
  {
    files: ['*.config.js', 'babel.config.js', 'metro.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  ...featureBoundaries({
    root: new URL('.', import.meta.url),
    sharedFiles: ['src/{domain,hooks,lib,ui}/**/*.{ts,tsx}', 'src/env.ts'],
  }),
  {
    ignores: ['.expo/**', 'node_modules/**', 'dist/**', 'nativewind-env.d.ts', 'expo-env.d.ts'],
  },
];

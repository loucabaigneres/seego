import { baseConfig } from '@seego/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { readdirSync } from 'node:fs';

// One entry per folder of src/features, so new features are covered automatically.
const features = readdirSync(new URL('./src/features', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const noAppImports = {
  group: ['@/app', '@/app/**'],
  message: 'The app layer composes features and shared code; nothing may import from it.',
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        __DEV__: 'readonly',
      },
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: globals.jest },
  },
  {
    files: ['*.config.js', 'babel.config.js', 'metro.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  // Unidirectional architecture: shared -> features -> app.
  // Shared code may not depend on features or on the app layer.
  {
    files: ['src/{domain,hooks,lib,theme,ui}/**/*.{ts,tsx}', 'src/env.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            noAppImports,
            {
              group: ['@/features', '@/features/**'],
              message:
                'Shared code must not depend on a feature: move it into the feature or pass it as a prop.',
            },
            {
              regex: '^(\\.\\./)+(app|features)(/|$)',
              message: 'Shared code must not depend on features or on the app layer.',
            },
          ],
        },
      ],
    },
  },

  // A feature only imports shared code and its own files: compose features in src/app.
  ...features.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            noAppImports,
            {
              regex: `^@/features(?!/${feature}/)`,
              message: 'No cross-feature imports: compose features at the app level (src/app).',
            },
            {
              regex: '^\\.\\./\\.\\./',
              message: 'Use the @/ alias to reach code outside this feature.',
            },
          ],
        },
      ],
    },
  })),

  {
    ignores: ['.expo/**', 'node_modules/**', 'dist/**', 'nativewind-env.d.ts', 'expo-env.d.ts'],
  },
];

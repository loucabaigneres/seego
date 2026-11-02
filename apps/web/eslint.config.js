import { baseConfig } from '@seego/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
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

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,

  // React specific rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Unidirectional architecture: shared -> features -> app.
  // Shared code may not depend on features or on the app layer.
  {
    files: ['src/{components,config,hooks,lib}/**/*.{ts,tsx}'],
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
    ignores: ['dist/**', 'src/app/routeTree.gen.ts'],
  },
];

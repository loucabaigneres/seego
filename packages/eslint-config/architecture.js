import { readdirSync } from 'node:fs';
import { defineConfig } from 'eslint/config';

const noAppImports = {
  group: ['@/app', '@/app/**'],
  message: 'The app layer composes features and shared code; nothing may import from it.',
};

/**
 * Unidirectional front-end architecture: shared -> features -> app.
 * - Shared code (`sharedFiles`) may not import features or the app layer.
 * - A feature (`src/features/<name>`) only imports shared code and its own files:
 *   features are composed in `src/app`.
 * - Nothing imports `src/app`.
 *
 * @param {object} options
 * @param {URL} options.root The app root, usually `new URL('.', import.meta.url)`. Its
 *   `src/features` folders are read so that new features are covered automatically.
 * @param {string[]} options.sharedFiles Globs of the shared folders, relative to the app root
 *   (e.g. `['src/{components,config,hooks,lib}/**\/*.{ts,tsx}']`).
 */
export function featureBoundaries({ root, sharedFiles }) {
  const features = readdirSync(new URL('src/features/', root), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return defineConfig([
    {
      files: sharedFiles,
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
  ]);
}

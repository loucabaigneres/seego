import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

/**
 * React rules shared by the front-ends (web, admin, landing page, mobile):
 * Rules of Hooks + React Compiler checks, and browser globals.
 *
 * @param {object} [options]
 * @param {boolean} [options.reactRefresh=false] Warn when a module exports something else than
 *   components, which breaks Vite fast refresh. Off for apps using TanStack Router file routes,
 *   which export a `Route` object next to the component.
 * @param {Record<string, 'readonly' | 'writable'>} [options.globals] Extra globals (e.g. `__DEV__`).
 */
export function reactConfig({
  reactRefresh: withReactRefresh = false,
  globals: extraGlobals = {},
} = {}) {
  return defineConfig([
    reactHooks.configs.flat.recommended,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        globals: { ...globals.browser, ...extraGlobals },
      },
    },
    ...(withReactRefresh
      ? [
          {
            files: ['**/*.{ts,tsx}'],
            plugins: { 'react-refresh': reactRefresh },
            rules: {
              'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            },
          },
        ]
      : []),
  ]);
}

# Seego - ESLint Config

Shared ESLint flat configs (ESLint v10). Each workspace composes them in its own `eslint.config.js` and only depends on `eslint` + `@seego/eslint-config`. The root `eslint.config` ignores `apps/**` and `packages/**`: linting always runs per workspace.

| Export                                          | Content                                                                                                                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseConfig` (`.`)                              | `@eslint/js` + `typescript-eslint` recommended, Node globals, `no-console` (warn/error allowed), Prettier compatibility. Every workspace.                                        |
| `reactConfig(options)` (`./react`)              | Rules of Hooks + React Compiler checks, browser globals. Options: `reactRefresh` (off for TanStack Router file routes), `globals` (e.g. `__DEV__`).                              |
| `featureBoundaries(options)` (`./architecture`) | The **shared → features → app** import rules, one block per `src/features/*` folder (read from disk, so new features are covered automatically). Options: `root`, `sharedFiles`. |

## Usage

```js
// apps/web/eslint.config.js
import { baseConfig } from '@seego/eslint-config';
import { featureBoundaries } from '@seego/eslint-config/architecture';
import { reactConfig } from '@seego/eslint-config/react';

export default [
  ...baseConfig,
  ...reactConfig(),
  ...featureBoundaries({
    root: new URL('.', import.meta.url),
    sharedFiles: ['src/{components,config,hooks,lib}/**/*.{ts,tsx}'],
  }),
  { ignores: ['dist/**', 'src/app/routeTree.gen.ts'] },
];
```

Back-end packages (`apps/api`, `packages/database`, `packages/ui`) only use `baseConfig`.

## What `featureBoundaries` enforces

- Shared folders (`sharedFiles`) never import `@/features/**` or `@/app/**`.
- A feature only imports shared code and its own files, never another feature.
- Nothing imports `@/app`: route files are the only place that composes several features.
- A feature reaches code outside its own folder through the `@/` alias, not `../../`.

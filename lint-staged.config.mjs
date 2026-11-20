import { relative } from 'node:path';

/**
 * Each workspace has its own ESLint config (the root one ignores apps/** and packages/**), so
 * staged files are linted from their own package with `pnpm --filter <pkg> exec eslint`.
 * Commands of one entry run one after the other, so eslint --fix and prettier never race.
 */
const WORKSPACES = {
  'apps/api': '@seego/api',
  'apps/mobile': '@seego/mobile',
  'apps/web': '@seego/web',
  'apps/landing-page': '@seego/landing-page',
  'packages/database': '@seego/database',
  'packages/ui': '@seego/ui',
};

const quote = (files) => files.map((file) => JSON.stringify(file)).join(' ');

export default {
  '*.{js,mjs,ts,tsx}': (staged) => {
    const byPackage = new Map();
    const others = [];
    for (const file of staged) {
      const path = relative(process.cwd(), file);
      const dir = Object.keys(WORKSPACES).find((prefix) => path.startsWith(`${prefix}/`));
      if (!dir) others.push(file);
      else byPackage.set(dir, [...(byPackage.get(dir) ?? []), file]);
    }

    const commands = [];
    for (const [dir, files] of byPackage) {
      const lintable = files.filter((file) => /\.(ts|tsx)$/.test(file));
      if (lintable.length) {
        commands.push(`pnpm --filter ${WORKSPACES[dir]} exec eslint --fix ${quote(lintable)}`);
      }
    }

    // Prettier keeps its previous scope: .js/.ts files (the apps' .tsx are not prettier-formatted).
    const formattable = [...byPackage.values(), others]
      .flat()
      .filter((f) => /\.(js|mjs|ts)$/.test(f));
    if (formattable.length) commands.push(`prettier --write ${quote(formattable)}`);
    return commands;
  },
  '*.{json,md}': ['prettier --write'],
};

---
name: shadcn-admin
description: shadcn/ui in the Seego monorepo (apps/admin, the only workspace with a components.json). Use when adding, searching, fixing, styling or composing shadcn components, data tables or forms in apps/admin, or when running the shadcn CLI. Wraps the upstream shadcn skill (.agents/skills/shadcn) so it works from the monorepo root.
allowed-tools: Bash(pnpm --filter @seego/admin exec shadcn *), Bash(pnpm dlx shadcn@latest * -c apps/admin*)
---

# shadcn/ui — Seego admin

The upstream shadcn skill lives in `.agents/skills/shadcn` (installed with `pnpm dlx skills add shadcn/ui`, locked in `skills-lock.json`; do not edit it). Its `SKILL.md` injects `shadcn info`, which fails from a monorepo root, so this wrapper injects the context of `apps/admin` instead and defers to the upstream rules for everything else.

## Current Project Context (apps/admin)

```json
!`pnpm --filter @seego/admin exec shadcn info --json`
```

## How to use the upstream skill

1. **Read `.agents/skills/shadcn/SKILL.md` before any shadcn work** and follow its Principles, Critical Rules, Component Selection and Workflow. Skip its "Current Project Context" section: the context above replaces it.
2. Read the rule file linked from each Critical Rule you touch (`.agents/skills/shadcn/rules/*.md`: styling, forms, composition, icons, base-vs-radix), and `customization.md` before changing the theme.
3. **Every CLI command must target the workspace.** Either run the local CLI (pinned in `apps/admin/package.json`):
   ```bash
   pnpm --filter @seego/admin exec shadcn add field
   pnpm --filter @seego/admin exec shadcn docs select
   ```
   or append `-c apps/admin` to the upstream commands: `pnpm dlx shadcn@latest add field -c apps/admin`.
4. The CLI is interactive when a file already exists: never pass `--overwrite` without the user's approval; preview with `--dry-run` / `--diff <file>` (see "Updating Components" upstream).

## Seego specifics (take precedence over upstream defaults)

- **Base UI, not Radix** (`base: "base"`): `render` instead of `asChild`, `items` prop on `Select`, etc. See `rules/base-vs-radix.md`.
- **Theme = `@seego/ui` tokens.** `apps/admin/src/index.css` maps the shadcn role variables (`:root`, registered in `@theme inline`) onto `@seego/ui` tokens. Never put raw colours (hex/oklch) there or in components: point roles at `var(--color-…)` tokens. Never re-register a name `@seego/ui` already defines with the same meaning (`--color-background`), it would create a `var()` cycle.
  - `accent` follows shadcn (menu/hover highlight = surface); the albicocca accent is `bg-cta`.
  - Positive status: `<Badge variant="success">` (custom variant in `components/ui/badge.tsx`, Seego `success` tokens).
  - Errors use `destructive` (= vino/brand, as in the charte).
  - Light only: no `.dark` block; keep `@custom-variant dark (&:is(.dark *))` so `dark:` classes never follow the OS setting.
  - No shadows (charte): `--shadow-xs` / `--shadow-md` are neutralised.
- **Typography:** page headings use the `type-title` / `type-section` / `type-label` utilities, not `text-<size>` theme keys (cn() mistakes them for colours). Don't override component typography through `className`.
- **Icons:** `lucide-react`, with `data-icon` inside buttons and no sizing classes inside components.
- **`cn`** comes from the `cn` package, re-exported by `@/lib/utils`.
- **Data tables:** TanStack Table **v9** (`useTable`, `tableFeatures`), server-side pagination. Reuse `src/components/data-table/` (`DataTable`, `DataTablePagination`, `dataTableFeatures`); columns via `createColumnHelper<DataTableFeatures, T>()`; the data hook in `features/<x>/hooks` owns the tRPC query and pagination state.
- **Folders:** `src/components/ui/*` is CLI-owned (kebab-case, as generated); app-level shared components (PascalCase) live in `src/components/`. The ESLint import boundaries (shared → features → app) apply.
- UI copy is French, addressing the user with "tu".

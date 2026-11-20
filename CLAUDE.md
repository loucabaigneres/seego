# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Seego is a travel-planning app: a pnpm + Turborepo monorepo (Node 24, ESM, pnpm 10.33.2). Package names are `@seego/*`.

## Commands

Run from the repo root; target one workspace with `--filter`.

```bash
pnpm install                                   # also installs Husky hooks
docker-compose up -d                           # Postgres (PostGIS) on :5432 + API on :3000 (tsx watch, repo mounted)
pnpm turbo run dev --filter=@seego/api         # API without Docker (needs apps/api/.env)
pnpm turbo run dev --filter=@seego/web         # web on :5173
pnpm turbo run dev --filter=@seego/landing-page  # landing on :5174
pnpm turbo run dev --filter=@seego/admin       # back-office on :5175
pnpm turbo run dev --filter=@seego/mobile      # Expo dev server

pnpm lint | pnpm typecheck | pnpm build | pnpm test   # all workspaces via turbo
pnpm turbo run format lint build typecheck test --filter=@seego/api   # what CI runs, per package
pnpm format                                    # prettier --write (each package's `format` script only checks)
```

Tests:

- API: Vitest — `pnpm --filter @seego/api exec vitest run src/lib/itinerary/scoring.test.ts` (or `-t "<name>"`).
- UI tokens: Vitest + contrast audit — `pnpm --filter @seego/ui test`.
- Mobile: Jest (`jest-expo`) — `pnpm --filter @seego/mobile exec jest src/domain/date.test.ts`.
- Mobile typecheck first regenerates Expo Router typed routes (`.expo/types/router.d.ts`, gitignored, otherwise only written by `expo start`) with `expo customize tsconfig.json` (`pnpm --filter @seego/mobile typegen`).
- Web, admin and landing page have no tests.

Database (`packages/database`, uses its own `.env` with `localhost` in `DATABASE_URL`):

```bash
pnpm --filter @seego/database db:generate   # drizzle-kit: SQL migration from schema changes -> drizzle/
pnpm --filter @seego/database db:migrate    # apply migrations
pnpm --filter @seego/database db:seed       # seeds; discovery seed uses gitignored data.json if present
pnpm --filter @seego/database db:studio
pnpm --filter @seego/database db:promote-admin <email> [--revoke]   # fallback: grant/revoke the 'admin' role (normally done from the admin app's Administrateurs page)
```

After changing a design token in `packages/ui`: `pnpm --filter @seego/ui generate:css` (a test fails if `theme.css` is stale).

## Architecture

- **`apps/api`** — Fastify server. `src/index.ts` mounts: Better Auth at `/api/auth/*` (Fastify request bridged to a Fetch `Request`), tRPC at `/trpc`, `/health`, an image proxy and a newsletter unsubscribe route. CORS allowlist is hard-coded there. `src/env.ts` validates env with Zod and exits on failure (`RESEND_API_KEY`, Google OAuth vars etc. are required).
  - tRPC: `trpc/init.ts` defines `publicProcedure` / `protectedProcedure` (the latter requires a Better Auth session) / `adminProcedure` (session + `user.role === 'admin'`, Better Auth admin plugin; default role is `traveler`). Back-office procedures live under `admin.*` (`trpc/routers/admin.ts`). `trpc/router.ts` is the `appRouter` (some procedures inline, the rest in `trpc/routers/*`); Zod input schemas in `trpc/schemas/*`. No superjson transformer, so dates cross the wire as strings.
  - Many procedures are public and accept a `guestId`: guests use the app before signing up and their trips/swipes are later claimed (`useClaimGuestTrips` on web). Identity is `ctx.user?.id ?? input.guestId`.
  - Domain logic lives in `src/lib/`: `itinerary/` (planner, scoring, selection), `recommendation/`, `socialImport/` (Instagram/TikTok scraping), `inspiration/` + `aiAnalysis.ts`/`aiProvider.ts` (AI SDK, `AI_MODEL="provider:model"`, Google or Mistral), `email.ts` (Resend).
- **`packages/database`** — Drizzle ORM schema (`src/schemas/*`, `src/enums.ts`), `createClient()`, migrations (`drizzle/`), seeds. **Consumed from `dist/`**, so it must be built (`turbo` does this via `^build` before dev/typecheck); after editing the schema outside turbo, run `pnpm --filter @seego/database build`. PostGIS is enabled.
- **`packages/ui`** — framework-free design tokens (colors, typography, layout), the single source of truth for the brand. Mobile (Tailwind v3/NativeWind) uses `tailwindTheme()` from `@seego/ui/tailwind`; web (Tailwind v4) imports `@seego/ui/css` (generated). Exported straight from `src/`, no build.
- **`packages/eslint-config`** — shared ESLint flat configs: `baseConfig` (`.`, every workspace), `reactConfig({ reactRefresh?, globals? })` (`./react`: hooks + React Compiler rules, browser globals) and `featureBoundaries({ root, sharedFiles })` (`./architecture`: the shared → features → app import rules, one block per `src/features/*` folder). Each workspace composes them in its own `eslint.config.*` and only depends on `eslint` + `@seego/eslint-config`; the root config ignores `apps/**` and `packages/**`.
- **`apps/web`** — Vite + React 19 + TanStack Router (file routes in `src/app/routes`, `routeTree.gen.ts` is generated — never edit) + tRPC via `@trpc/tanstack-react-query`. `api/[...path].ts` is a Vercel edge proxy: in prod the front calls `/api/*` on its own domain so the session cookie is first-party (Safari); enabled with `VITE_USE_API_PROXY=true` + `API_PROXY_TARGET`. Locally it calls `VITE_API_URL` directly.
- **`apps/mobile`** — Expo SDK 57 + Expo Router + NativeWind; Better Auth via `@better-auth/expo` (session in SecureStore). Same user journey as web. Fonts are embedded natively, so it needs a development build (`npx expo run:android|ios`; `npx expo prebuild --clean` after changing plugins or native deps). See `apps/mobile/README.md` and the root README for auth/networking on devices (LAN IP, `adb reverse`, tunnel for Google OAuth).
- **`apps/admin`** — back-office, same base as web (Vite + React 19 + TanStack Router + tRPC) plus shadcn/ui (Base UI, `components.json`, style base-nova) and TanStack Table **v9** (`useTable` + `tableFeatures`). `src/components/ui/*` is owned by the shadcn CLI (`pnpm dlx shadcn@latest add <name>` from `apps/admin`; `cn` comes from the `cn` package via `@/lib/utils`); the shadcn theme variables (`:root` + `@theme inline`) are mapped onto `@seego/ui` tokens in `src/index.css` (in admin, `accent` follows shadcn = surface; use `cta` for albicocca; headings use `type-*` utilities). Follow the shadcn skill in `.agents/skills/shadcn` (run its CLI with `-c apps/admin` from the root). Reusable server-paginated table: `src/components/data-table/` (`DataTable`, `DataTablePagination`, `dataTableFeatures`); columns via `createColumnHelper<DataTableFeatures, T>()`. E-mail/password sign-in; `_authed.tsx` layout redirects to `/login` unless the session has the `admin` role (UX guard only, the API enforces it). Deployed like web: Vercel project `seego-admin` via the `deploy-admin` CD job (`main` → admin.seego.fr, `develop` → aliased to admin-staging.seego.fr), same `/api/*` edge proxy (`api/[...path].ts`), security headers in `vercel.json`.
- **`apps/landing-page`** — static Vite + React waitlist teaser (no router).

**Client ↔ API typing:** web and mobile import only the _type_ `AppRouter` from `@seego/api/src/trpc/router` in their `src/lib/trpc.ts`, which exports `RouterInputs` / `RouterOutputs`. All API types in clients must be derived from those, never via relative imports into `apps/api`.

## Frontend conventions (web, admin and mobile, ESLint-enforced via `featureBoundaries`)

- Dependency direction is **shared → features → app** (`no-restricted-imports`): shared folders (`components`/`ui`, `hooks`, `lib`, `config`, `domain`) never import `features` or `app`; a feature never imports another feature; only route files in `src/app` compose several features.
- Import across folders via the `@/` alias, never `../../`; no barrel `index.ts` files.
- Route/screen files stay thin: business logic goes in `features/<x>/lib` (pure, tested on mobile) or a `features/<x>/hooks/useXxx` hook that owns the tRPC calls.
- No hard-coded colours — use token classes (`bg-primary`, `text-ink-muted`, `rounded-card`) or `@seego/ui`.
- Every query handles loading, error (with retry) and empty states.
- UI copy is French and addresses the user with "tu". Mobile charte: vino for actions, albicocca (`cta`) as sparse accent, no shadows, no emojis, Phosphor icons from `@/ui/icons`, serif titles / sans actions.

## Git workflow

- Commits must follow Conventional Commits (commitlint, `commit-msg` hook), e.g. `feat(api): ...`.
- `pre-commit` runs lint-staged: `eslint --fix` per owning workspace on staged `.ts/.tsx`, then Prettier on `.js/.mjs/.ts/.json/.md` (app `.tsx` files are not Prettier-formatted).
- CI runs on every branch except `main`; CD deploys `main` → production and `develop` → staging (API Docker image + Vercel for web and admin; the landing page deploys via its own manual workflow).

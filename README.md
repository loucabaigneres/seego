# 🗺️ Seego

Welcome to the main repository for the Seego project, a travel-planning app! This repository uses a **Monorepo** architecture powered by [Turborepo](https://turborepo.dev/) and [pnpm](https://pnpm.io/).

## 🛠️ Tech Stack

- **Package Manager:** pnpm 10.33.2
- **Monorepo Orchestrator:** Turborepo
- **Web (`apps/web`):** React 19 (Vite), TypeScript, TanStack Router, Tailwind CSS v4, Motion (`motion/react`), tRPC client, PostHog
- **Mobile (`apps/mobile`):** React Native (React 19), Expo SDK 57, Expo Router, NativeWind, tRPC client
- **Back-office (`apps/admin`):** React 19 (Vite), TanStack Router + Table v9, shadcn/ui (Base UI), tRPC client
- **Landing page (`apps/landing-page`):** React 19 (Vite), Tailwind CSS v4, Three.js, PostHog
- **Backend (`apps/api`):** Node.js 24 (ESM), Fastify, tRPC, Zod, Better Auth, AI SDK (Google / Mistral), Resend
- **Database (`packages/database`):** PostgreSQL 17 + PostGIS, Drizzle ORM, `postgres.js`
- **Design tokens (`packages/ui`):** framework-free colours, typography, layout and fonts
- **Code Quality:** ESLint v10 (Flat Config), Prettier, Husky, Commitlint, lint-staged, Vitest / Jest
- **Local Infrastructure:** Docker & Docker-Compose

---

## 🏗️ Project Architecture

The codebase is divided into executable applications and shared packages. Each one has its own README.

```bash
seego/
├── apps/
│   ├── admin/            # Back-office (Vite + React + TanStack Router/Table + shadcn/ui), admins only
│   ├── api/              # Backend server (Fastify + tRPC + Better Auth)
│   ├── landing-page/     # Static waitlist teaser (www.seego.fr)
│   ├── mobile/           # Mobile application (React Native + Expo)
│   └── web/              # Web application (Vite + React, app.seego.fr)
├── packages/
│   ├── database/         # Drizzle schema, DB client, migrations and seeds
│   ├── eslint-config/    # Shared ESLint Flat Configs (base, react, architecture)
│   └── ui/               # Design tokens and fonts, single source of truth for the brand
├── docker-compose.yml    # Local infrastructure (PostgreSQL/PostGIS + API)
├── turbo.json            # Turborepo tasks configuration
└── pnpm-workspace.yaml   # Monorepo configuration
```

| Package                | README                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| `@seego/api`           | [`apps/api/README.md`](apps/api/README.md)                             |
| `@seego/web`           | [`apps/web/README.md`](apps/web/README.md)                             |
| `@seego/mobile`        | [`apps/mobile/README.md`](apps/mobile/README.md)                       |
| `@seego/admin`         | [`apps/admin/README.md`](apps/admin/README.md)                         |
| `@seego/landing-page`  | [`apps/landing-page/README.md`](apps/landing-page/README.md)           |
| `@seego/database`      | [`packages/database/README.md`](packages/database/README.md)           |
| `@seego/ui`            | [`packages/ui/README.md`](packages/ui/README.md)                       |
| `@seego/eslint-config` | [`packages/eslint-config/README.md`](packages/eslint-config/README.md) |

## 🚀 Installation Guide (Onboarding)

### 1. Prerequisites

Ensure you have the following tools installed on your machine:

- [Node.js](https://nodejs.org/) (Version 24 LTS)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm@10.33.2`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Docker-Compose)
- For the mobile app, a native toolchain to build the development build: **Android Studio** (SDK + emulator, JDK 17) and/or **Xcode** (iOS simulator, macOS only). Expo Go is not supported (see [`apps/mobile/README.md`](apps/mobile/README.md)).

### 2. Install Dependencies

At the root of the project, install all packages:
_(Note: This will automatically set up Husky Git Hooks for your local development environment)_

```bash
pnpm install
```

### 3. Environment Variables

The API validates its environment with Zod and refuses to start if a required variable is missing (`apps/api/src/env.ts`). Each front-end has an `.env.example` to copy.

Create `apps/api/.env`:

```env
DATABASE_URL=postgres://admin:password@db:5432/seego
PORT=3000
NODE_ENV=development
BETTER_AUTH_SECRET=generate_a_random_string_here_at_least_10_chars
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=found_in_your_google_cloud_console
GOOGLE_CLIENT_SECRET=found_in_your_google_cloud_console
# iOS bundle ID (`ios.bundleIdentifier` in apps/mobile/app.json): audience of Sign in with Apple tokens
APPLE_APP_BUNDLE_IDENTIFIER=fr.seego.app
FRONTEND_URL=http://localhost:5173

# AI analysis (optional to start the server, required to analyze posts). Format: "provider:model"
AI_MODEL=google:gemini-flash-lite-latest
GEMINI_API_KEY=your_google_ai_studio_api_key

# Transactional emails via Resend (required: the server refuses to start without it, must start with "re_")
RESEND_API_KEY=re_your_resend_api_key
# Newsletter (production only, leave unset elsewhere): Resend "Waitlist" segment that waitlist
# leads are synced to, and the signing secret of the webhook pointing at POST /webhooks/resend
# (event contact.updated). Without the segment ID, no contact is ever written to Resend.
# Each contact carries its signed link to our /unsubscribe page in the Resend contact property
# `unsubscribe_url` (must exist on the account): newsletter templates use {{{contact.unsubscribe_url}}}.
# RESEND_WAITLIST_SEGMENT_ID=
# RESEND_WEBHOOK_SECRET=whsec_...
# Signing secret of the Tally survey webhook pointing at POST /webhooks/tally (production only):
# e-mails left at the end of the survey become waitlist leads.
# TALLY_SIGNING_SECRET=
```

> ℹ️ `DATABASE_URL` uses the `db` host because the API runs inside Docker. If you run the API outside Docker, use `localhost` instead.

Create `packages/database/.env` (used by migrations, seeds and Drizzle Studio from your machine):

```env
DATABASE_URL=postgres://admin:password@localhost:5432/seego
```

Create `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Copy the other front-end examples:

```bash
cp apps/admin/.env.example apps/admin/.env               # VITE_API_URL=http://localhost:3000
cp apps/mobile/.env.example apps/mobile/.env             # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_WEB_URL, GOOGLE_MAPS_API_KEY
cp apps/landing-page/.env.example apps/landing-page/.env # VITE_API_URL (+ optional PostHog key)
```

> ℹ️ **Mobile:** keep `EXPO_PUBLIC_API_URL=http://localhost:3000`. On a phone or an emulator, the app swaps `localhost` for the IP of the machine serving Expo (`apps/mobile/src/lib/api-url.ts`), so the same `.env` works everywhere. Google sign-in is the exception (Google refuses private IPs): see [`apps/mobile/README.md`](apps/mobile/README.md#authentication).

### 4. Start the Backend Infrastructure (Docker)

Start both the PostgreSQL (PostGIS) database and the Fastify API in the background:

```bash
docker-compose up -d
```

✅ The Backend API is now running on `http://localhost:3000` (health check: `http://localhost:3000/health`). The repository is mounted in the container and the API runs with `tsx watch`, so your changes reload automatically.

### 5. Initialize and Seed the Database

Apply the migrations (SQL files committed in `packages/database/drizzle/`), then inject the discovery content:

```bash
pnpm --filter @seego/database db:migrate
pnpm --filter @seego/database db:seed
```

Only run `db:generate` after changing the Drizzle schema, to create a new migration (see [`packages/database/README.md`](packages/database/README.md)).

> ℹ️ Note on `data.json`: the discovery seed (`discovery.seed.ts`) imports extra locations from `packages/database/data.json` if the file is present. This file is gitignored (large scraped dataset): without it, the seed simply skips this step.

### 6. Run the Frontends

Since the backend is already running via Docker, you only need to start the frontends you are working on.

#### Web App

```bash
pnpm turbo run dev --filter "@seego/web"
```

✅ `http://localhost:5173`

#### Admin (back-office)

```bash
pnpm turbo run dev --filter "@seego/admin"
```

✅ `http://localhost:5175`. Only accounts with the Better Auth `admin` role can sign in: see [`apps/admin/README.md`](apps/admin/README.md#créer-un-administrateur) to promote one.

#### Landing page

```bash
pnpm turbo run dev --filter "@seego/landing-page"
```

✅ `http://localhost:5174`

#### Mobile App

The mobile app needs a development build (fonts and Sign in with Apple are native, so Expo Go does not work). Build and install it on an emulator/simulator or a connected device; this also starts Metro:

```bash
pnpm --filter "@seego/mobile" android   # npx expo run:android
pnpm --filter "@seego/mobile" ios       # npx expo run:ios (macOS only)
```

Rebuild only after changing `app.json` plugins or a native dependency (`npx expo prebuild --clean` from `apps/mobile`). Once the app is installed, you can just start Metro:

```bash
pnpm turbo run dev --filter "@seego/mobile" --ui=tui
```

Platform prerequisites (JDK 17, Windows long paths, ninja version, Google Maps key) are listed in [`apps/mobile/README.md`](apps/mobile/README.md).

---

## 🛡️ Code Quality & Git Workflow

To maintain a high-quality codebase, we enforce formatting and commit conventions automatically using **Husky** and **lint-staged**.

### 1. Auto-formatting on Commit

When you run `git commit`, Husky runs `lint-staged` on the files you modified only: `eslint --fix` (in the workspace that owns the file) on `.ts/.tsx`, then Prettier on `.js/.mjs/.ts/.json/.md`. Auto-fixable errors are fixed and added to your commit.

### 2. Conventional Commits

We use `commitlint`. Your commit messages must follow the Conventional Commits format, or the commit will be rejected.

Format: `<type>(<optional scope>): <description>`

**Common types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

_Example:_ `git commit -m "feat(api): add Apple sign-in"`

### 3. Frontend conventions

Web, admin and mobile share the same rules, enforced by ESLint (`featureBoundaries` from `@seego/eslint-config/architecture`):

- Code flows one way: **shared → features → app**. A feature never imports another feature; only route files compose several features.
- Import across folders with the `@/` alias, never `../../`; no barrel `index.ts`.
- API types come from `RouterInputs` / `RouterOutputs` (`@/lib/trpc`), never from relative imports into `apps/api`.
- No hard-coded colours: use the `@seego/ui` tokens.
- UI copy is French and uses "tu".

### 4. CI / CD

- **CI** (`.github/workflows/ci.yml`) runs on every branch except `main`: `format lint build typecheck test` through Turbo.
- **CD** (`.github/workflows/cd.yml`): `main` deploys to production and `develop` to staging. It builds and pushes the API Docker image, applies the Drizzle migrations, triggers the Render deploy, then deploys web and admin to Vercel.
- The landing page is deployed with its own manual workflow (`deploy-landing-page.yml`).

---

## 📝 Useful Commands

Thanks to Turborepo, you can run commands from the root to target specific projects.

| Action                         | Command                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| **Start Docker (DB + API)**    | `docker-compose up -d`                                                  |
| **Stop Docker**                | `docker-compose down`                                                   |
| **Start the API (no Docker)**  | `pnpm turbo run dev --filter "@seego/api"`                              |
| **Start the Web App**          | `pnpm turbo run dev --filter "@seego/web"`                              |
| **Start the Admin**            | `pnpm turbo run dev --filter "@seego/admin"`                            |
| **Start the Landing page**     | `pnpm turbo run dev --filter "@seego/landing-page"`                     |
| **Start the Mobile App**       | `pnpm turbo run dev --filter "@seego/mobile"`                           |
| **Lint / typecheck / test**    | `pnpm lint` / `pnpm typecheck` / `pnpm test`                            |
| **What CI runs (one package)** | `pnpm turbo run format lint build typecheck test --filter "@seego/api"` |
| **Format the entire project**  | `pnpm format`                                                           |
| **Generate DB migration**      | `pnpm --filter "@seego/database" db:generate`                           |
| **Apply DB migrations**        | `pnpm --filter "@seego/database" db:migrate`                            |
| **Open Drizzle Studio**        | `pnpm --filter "@seego/database" db:studio`                             |

# 🗺️ Seego Project

Welcome to the main repository for the Seego project! This repository uses a **Monorepo** architecture powered by [Turborepo](https://turborepo.dev/) and [pnpm](https://pnpm.io/).

## 🛠️ Tech Stack

- **Package Manager:** pnpm
- **Monorepo Orchestrator:** Turborepo
- **Frontend (`apps/web`):** React (Vite), TypeScript, TanStack Router, Tailwind CSS, Motion (`motion/react`), tRPC Client
- **Mobile (`apps/mobile`):** React Native (React 19), Expo SDK 57, Expo Router, tRPC Client
- **Backend (`apps/api`):** Node.js 24 (ESM), Fastify, tRPC, Zod, Better Auth
- **Database (`packages/database`):** PostgreSQL, Drizzle ORM, `postgres.js`
- **Code Quality:** ESLint v10 (Flat Config), Prettier, Husky, Commitlint, lint-staged
- **Local Infrastructure:** Docker & Docker-Compose

---

## 🏗️ Project Architecture

The codebase is divided into executable applications and shared packages.

```bash
seego/
├── apps/
│   ├── admin/            # The back-office (Vite + React + TanStack Router/Table), admins only
│   ├── api/              # The backend server (Fastify + tRPC + Better Auth)
│   ├── mobile/           # The mobile application (React Native + Expo)
│   └── web/              # The frontend web application (Vite + React)
├── packages/
│   ├── database/         # Drizzle schema, DB instance, and migrations
│   └── eslint-config/     # Shared ESLint Flat Config for the monorepo
├── docker-compose.yml    # Local infrastructure (PostgreSQL + API)
├── turbo.json            # Turborepo scripts configuration
└── pnpm-workspace.yaml   # Monorepo configuration
```

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

The project uses Zod for strict environment validation. You need to create three `.env` files.

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

# AI Analysis Configuration (optional to start the server, required to analyze posts)
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
```

Create `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Create `apps/admin/.env` (copy `apps/admin/.env.example`):

```env
VITE_API_URL=http://localhost:3000
```

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> ⚠️ **Note for Mobile testing:** _If you are testing the mobile app on a physical device, `localhost` will not work. You must replace it with your computer's local IP address (e.g., `EXPO_PUBLIC_API_URL=http://192.168.1.X:3000`)._

#### Mobile authentication (Better Auth)

The mobile app signs in through the API's Better Auth, with the `@better-auth/expo` plugin: the session lives in SecureStore. Auth runs in the development build (Expo Go is no longer supported).

- **Email / password** works on every target, including a LAN IP.
- **Google** uses the browser redirect flow, so Google must reach the API's callback (`<BETTER_AUTH_URL>/api/auth/callback/google`, listed in the Google Cloud Console). Google refuses private IPs, so:
  - **iOS simulator**: `http://localhost:3000` works as is.
  - **Android emulator or USB device**: run `adb reverse tcp:3000 tcp:3000`, then use `EXPO_PUBLIC_API_URL=http://localhost:3000`.
  - **Physical iPhone**: expose the API through an HTTPS tunnel (e.g. `ngrok http 3000`), set the tunnel URL as `BETTER_AUTH_URL` (API) and `EXPO_PUBLIC_API_URL` (mobile), and add `<tunnel>/api/auth/callback/google` to the Google console.
- The API trusts the app scheme `seego://` and, in development, Expo dev URLs (`exp://`) and the web preview (`http://localhost:8081`). See `apps/api/src/lib/auth.ts`.

Create `packages/database/.env`:

```env
DATABASE_URL=postgres://admin:password@localhost:5432/seego
```

### 4. Start the Backend Infrastructure (Docker)

Start both the PostgreSQL database and the Fastify API in the background:

```bash
docker-compose up -d
```

✅ The Backend API is now automatically running on `http://localhost:3000`

### 5. Initialize and Seed the Database

We use strict migration flows. First, generate the SQL migration files, apply them to the database, and finally inject the test data:

```bash
pnpm --filter @seego/database db:generate
pnpm --filter @seego/database db:migrate
pnpm --filter @seego/database db:seed
```

> ℹ️ Note on `data.json`: The discovery content seed (`discovery.seed.ts`) imports extra locations from `packages/database/data.json` if the file is present. This file is gitignored (large scraped dataset) — without it, the seed simply skips this step and only inserts the test data.

### 6. Run the Frontends

Since the backend is already running via Docker, you only need to start the frontends locally. You can run one or both depending on what you are working on.

#### Run the Web App:

```bash
pnpm turbo run dev --filter=@seego/web
```

✅ The Web App will be accessible at `http://localhost:5173`

#### Run the Admin (back-office):

```bash
pnpm turbo run dev --filter=@seego/admin
```

✅ The Admin will be accessible at `http://localhost:5175`. Only accounts with the Better Auth `admin` role can sign in: see [`apps/admin/README.md`](apps/admin/README.md) to promote one.

#### Run the Mobile App:

The mobile app needs a development build (fonts are embedded natively by the `expo-font` config plugin, so Expo Go no longer works). Build and install it on an emulator/simulator or a connected device; this also starts Metro:

```bash
pnpm --filter @seego/mobile android   # npx expo run:android
pnpm --filter @seego/mobile ios       # npx expo run:ios (macOS only)
```

Rebuild only after changing `app.json` plugins or a native dependency (`npx expo prebuild --clean` from `apps/mobile`). Once the app is installed, you can just start Metro:

```bash
pnpm turbo run dev --filter=@seego/mobile --ui=tui
```

Android prerequisites (JDK 17, Windows long paths, ninja version) are listed in [`apps/mobile/README.md`](apps/mobile/README.md).

---

## 🛡️ Code Quality & Git Workflow

To maintain a high-quality codebase, we enforce formatting and commit conventions automatically using **Husky** and **lint-staged**.

### 1. Auto-formatting on Commit

When you run `git commit`, Husky intercepts the action and runs `lint-staged`. It will automatically run ESLint and Prettier **only on the files you modified**. If there are auto-fixable errors, it will fix them and add them to your commit seamlessly.

### 2. Conventional Commits

We use `commitlint`. Your commit messages must follow the Conventional Commits format, or the commit will be rejected.

Format: `<type>(<optional scope>): <description>`

**Allowed types:**

- `feat:` A new feature

- `fix:` A bug fix

- `docs:` Documentation only changes

- `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc)

- `refactor:` A code change that neither fixes a bug nor adds a feature

- `chore:` Changes to the build process or auxiliary tools

_Example:_ `git commit -m "feat: add user authentication via BetterAuth"`

---

## 📝 Useful Commands

Thanks to Turborepo, you can run commands from the root to target specific projects.

| Action                        | Command                                     |
| ----------------------------- | ------------------------------------------- |
| **Start the API**             | `pnpm turbo run dev --filter=@seego/api`    |
| **Start the Web App**         | `pnpm turbo run dev --filter=@seego/web`    |
| **Start the Mobile App**      | `pnpm turbo run dev --filter=@seego/mobile` |
| **Start the Admin**           | `pnpm turbo run dev --filter=@seego/admin`  |
| **Format the entire project** | `pnpm run format`                           |
| **Lint the entire project**   | `pnpm run lint`                             |
| **Generate DB migration**     | `pnpm --filter @seego/database db:generate` |
| **Apply DB migration**        | `pnpm --filter @seego/database db:migrate`  |
| **Start Docker (DB + API)**   | `docker-compose up -d`                      |
| **Stop Docker**               | `docker-compose down`                       |

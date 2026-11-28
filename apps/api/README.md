# Seego - API

Fastify server for every Seego client (web, mobile, admin, landing page): Better Auth for sessions, tRPC for the API, plus a few plain HTTP routes.

## Run

The usual way is Docker, from the root (Postgres/PostGIS + API with `tsx watch`, repo mounted):

```bash
docker-compose up -d          # http://localhost:3000
```

Without Docker (Postgres must be reachable, use `localhost` in `DATABASE_URL`):

```bash
pnpm turbo run dev --filter "@seego/api"
```

`turbo` builds `@seego/database` first (`^build`): the API imports it from `dist/`.

| Script      | What it does                            |
| ----------- | --------------------------------------- |
| `dev`       | `tsx watch src/index.ts`                |
| `build`     | `tsc` to `dist/`                        |
| `start`     | `node dist/index.js` (production image) |
| `typecheck` | `tsc --noEmit`                          |
| `lint`      | ESLint (shared base config)             |
| `format`    | Prettier check                          |
| `test`      | Vitest                                  |

Run one test file: `pnpm --filter "@seego/api" exec vitest run src/lib/itinerary/scoring.test.ts` (or `-t "<name>"`).

## Environment

Validated with Zod in `src/env.ts`: the process exits if a variable is missing or invalid. The full list with example values is in the [root README](../../README.md#3-environment-variables).

| Variable                                   | Notes                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `DATABASE_URL`, `PORT`, `NODE_ENV`         | `NODE_ENV` defaults to `development`                                   |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`    | Secret ≥ 10 chars. In prod, `BETTER_AUTH_URL` is the front URL (proxy) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Required                                                               |
| `APPLE_APP_BUNDLE_IDENTIFIER`              | Required, audience of the native Sign in with Apple token              |
| `FRONTEND_URL`                             | Defaults to `http://localhost:5173`; trusted origin + email links      |
| `AI_MODEL`, `GEMINI_API_KEY`               | `provider:model` (`google:` or `mistral:`); key only needed to analyse |
| `RESEND_API_KEY`                           | Required, must start with `re_`                                        |

## HTTP surface (`src/index.ts`)

| Route                 | What                                                                            |
| --------------------- | ------------------------------------------------------------------------------- |
| `/api/auth/*`         | Better Auth (Fastify request bridged to a Fetch `Request`)                      |
| `/trpc`               | tRPC `appRouter`                                                                |
| `/health`             | Health check (pinged by the `keep-alive` workflow)                              |
| `/image-proxy?url=`   | Proxies known place images (`src/routes/image-proxy.ts`)                        |
| `/unsubscribe?token=` | Newsletter unsubscribe, GET page + one-click POST (`src/routes/unsubscribe.ts`) |

CORS is an allowlist hard-coded in `src/index.ts` (seego.fr domains, `*.vercel.app`, `localhost`). A new front domain must also be added to `trustedOrigins` in `src/lib/auth.ts`.

## Auth (`src/lib/auth.ts`)

- Email + password with mandatory email verification by 6-digit OTP (`emailOTP` plugin), password reset by email.
- Google (browser redirect flow) and Apple (native iOS only: the app sends the identity token, checked against Apple's keys).
- `expo()` plugin for the mobile app (`seego://` scheme, `exp://` and `localhost:8081` in development).
- `admin()` plugin: default role `traveler`, only `admin` opens the back-office.

## tRPC

- `src/trpc/init.ts`: `publicProcedure`, `protectedProcedure` (needs a session), `adminProcedure` (session + `role === 'admin'`, otherwise `FORBIDDEN`).
- `src/trpc/router.ts`: `appRouter`, a few procedures inline, the rest in `src/trpc/routers/*` (`group`, `user`, `inspiration`, `onboarding`, `waitlist`, `admin`, `discovery`, `itinerary`). Zod input schemas live in `src/trpc/schemas/*`.
- No superjson transformer: dates cross the wire as strings.
- Guests use the app before signing up: many procedures are public and take a `guestId`. Identity is `ctx.user?.id ?? input.guestId`; guest trips are claimed after sign-up.
- Clients only import the **type** `AppRouter` from `src/trpc/router` and derive `RouterInputs` / `RouterOutputs` from it.

## Domain logic (`src/lib`)

| Folder / file                                    | Role                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `itinerary/`                                     | Trip planner: scoring, selection, geo helpers, replacements           |
| `recommendation/`                                | Discovery card recommendation algorithm                               |
| `socialImport/`                                  | Instagram / TikTok scraping (Open Graph, subtitles, hashtags, images) |
| `inspiration/`, `aiAnalysis.ts`, `aiProvider.ts` | AI analysis of imported posts (AI SDK, Google or Mistral)             |
| `geocoding.ts`, `importedPlaces.ts`              | Place resolution for imported content                                 |
| `adminRoles.ts`                                  | Rules to grant / revoke the `admin` role (see `apps/admin/README.md`) |
| `email.ts`, `unsubscribe.ts`                     | Transactional emails (Resend) and unsubscribe tokens                  |

## Deployment

The root `Dockerfile` prunes the monorepo for `@seego/api` (`turbo prune`), builds it and runs `node dist/index.js`. The CD pushes the image to Docker Hub (`latest` for `main`, `staging` for `develop`), applies the Drizzle migrations to Supabase, then triggers the Render deploy hook.

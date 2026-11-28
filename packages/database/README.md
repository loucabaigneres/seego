# Seego - Database

Drizzle ORM schema, database client, migrations and seeds for PostgreSQL 17 + PostGIS.

Consumed **from `dist/`** (`main: ./dist/index.js`): it must be built before the API can use it. `turbo` does it automatically (`^build` before `dev` / `typecheck`). After editing the schema outside turbo, run:

```bash
pnpm --filter "@seego/database" build
```

## Environment

Its own `.env`, used from your machine, so the host is `localhost` (not `db` as inside Docker):

```env
DATABASE_URL=postgres://admin:password@localhost:5432/seego
```

Against staging or production, pass the URL inline: `DATABASE_URL=<url> pnpm --filter "@seego/database" db:migrate`.

## Scripts

| Script                                    | What it does                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `db:generate`                             | `drizzle-kit generate`: SQL migration from schema changes to `drizzle/` |
| `db:migrate`                              | Applies the migrations (`src/migrate.ts`), also run by the CD           |
| `db:seed`                                 | Seeds the database (`src/seeds/index.ts`)                               |
| `db:studio`                               | Drizzle Studio                                                          |
| `db:push`                                 | `drizzle-kit push` (prototyping only, prefer migrations)                |
| `db:promote-admin <email> [--revoke]`     | Grants / revokes the `admin` role (fallback, see below)                 |
| `build` / `typecheck` / `lint` / `format` | `tsc` to `dist/`, `tsc --noEmit`, ESLint, Prettier check                |

## Changing the schema

1. Edit `src/schemas/*.ts` (or `src/enums.ts`) and export new tables from `src/index.ts`.
2. `pnpm --filter "@seego/database" db:generate`, then review the SQL in `drizzle/`.
3. `pnpm --filter "@seego/database" db:migrate`.
4. Commit the schema change **and** the generated migration (`drizzle/*.sql` + `drizzle/meta`).

`drizzle.config.ts` filters the `postgis` extension, which is created by `Dockerfile.db` locally.

## Layout

```
src/
  index.ts          createClient(url) + re-exports every schema and enum
  enums.ts          Postgres enums
  schemas/          auth (Better Auth tables), admin, catalogue, document, inspiration,
                    onboarding, payment, trip, waitlist
  catalogue/        Helpers to write catalogue content
  seeds/            One file per domain; index.ts picks which ones run
  migrate.ts        Migration runner
  promote-admin.ts  Admin role script
drizzle/            Generated SQL migrations (never edit by hand)
```

## Seeds

`db:seed` currently runs only the discovery content seed (`discovery.seed.ts`). The other seeds (admin, inspirations, trips, payments, documents) are commented out in `src/seeds/index.ts`: uncomment them locally if you need that data.

The discovery seed also imports the places of `data.json` when the file is present. It is gitignored (large scraped dataset): without it, that step is skipped.

## Admin role script

Normally, admins are promoted from the back-office (**Administrateurs** page, see `apps/admin/README.md`). The script is the fallback when no admin can sign in anymore:

```bash
pnpm --filter "@seego/database" db:promote-admin prenom@seego.fr
pnpm --filter "@seego/database" db:promote-admin prenom@seego.fr --revoke   # back to 'traveler'
```

It writes to `admin_role_events` (without an author) but sends no email.

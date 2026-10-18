/* eslint-disable no-console */
import 'dotenv/config';
import { lookup } from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Runs the drizzle/ migrations with the drizzle-orm migrator instead of `drizzle-kit migrate`,
// which hides the underlying error behind its spinner and only reports `Exit status 1`.
// It writes to the same `drizzle.__drizzle_migrations` table, so already-applied migrations are skipped.

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// `uselibpqcompat` is a node-postgres (pg) option; postgres.js would send it to the server as an
// unknown startup parameter and fail. `sslmode` is kept: postgres.js translates it to its `ssl` option.
const parsed = new URL(url);
parsed.searchParams.delete('uselibpqcompat');
const { hostname, port } = parsed;
console.log(`Applying migrations on ${hostname}:${port || '5432'}...`);

// The Supabase direct host (db.<ref>.supabase.co) is IPv6-only, and GitHub-hosted runners have no IPv6.
try {
  await lookup(hostname, { family: 4 });
} catch {
  console.warn(
    `Warning: ${hostname} has no IPv4 address. On an IPv4-only network (GitHub Actions, Render), ` +
      'use the Supabase Session pooler URL (postgres.<ref>@aws-0-<region>.pooler.supabase.com:5432).',
  );
}

const client = postgres(parsed.toString(), {
  max: 1,
  prepare: false,
  connect_timeout: 20,
  onnotice: () => {},
});

try {
  await migrate(drizzle(client), {
    migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
  });
  console.log('Migrations applied successfully.');
} catch (error) {
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  await client.end();
}

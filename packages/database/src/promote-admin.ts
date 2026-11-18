/* eslint-disable no-console */
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { createClient } from './index.js';
import { user } from './schemas/auth.js';

// Grants (or revokes with --revoke) the Better Auth 'admin' role, which opens the back-office (apps/admin).
// Usage: pnpm --filter @seego/database db:promote-admin <email> [--revoke]
// The account must already exist (sign up on apps/web and verify the e-mail first).

const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const email = args
  .find((arg) => !arg.startsWith('--'))
  ?.trim()
  .toLowerCase();

if (!email) {
  console.error('Usage: db:promote-admin <email> [--revoke]');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const db = createClient(url);
const role = revoke ? 'traveler' : 'admin';

const updated = await db
  .update(user)
  .set({ role, updatedAt: new Date() })
  .where(eq(user.email, email))
  .returning({ id: user.id, emailVerified: user.emailVerified });

if (updated.length === 0) {
  console.error(`No user found with e-mail ${email}.`);
  process.exit(1);
}

// No session cookie cache is configured, so the new role applies on the very next request.
console.log(`${email} now has the '${role}' role.`);
if (!updated[0].emailVerified) {
  console.warn('Warning: this e-mail is not verified yet, so sign-in will be refused until it is.');
}
process.exit(0);

import { schema } from '@seego/database';
import { and, eq } from 'drizzle-orm';
import type { db as appDb } from '../db.js';
import { type KnownAppleUser, placeholderUpgrade } from './email.js';

const { account, user } = schema;

function linkedUser(db: typeof appDb, sub: string) {
  return db
    .select({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
    })
    .from(account)
    .innerJoin(user, eq(user.id, account.userId))
    .where(and(eq(account.providerId, 'apple'), eq(account.accountId, sub)))
    .limit(1);
}

/** The account already linked to this Apple ID (`sub`), if any. */
export async function findUserByAppleSubject(
  db: typeof appDb,
  sub: string,
): Promise<KnownAppleUser | null> {
  const [row] = await linkedUser(db, sub);
  return row ? { email: row.email, emailVerified: row.emailVerified } : null;
}

/**
 * Gives an account created with the placeholder e-mail the e-mail (and name) Apple now shares.
 * Better Auth signs an existing Apple user in through the linked account and never updates their
 * profile, so without this the account would keep the placeholder for good. Best effort: if the
 * address already belongs to another account (unique e-mail), the placeholder stays.
 */
export async function upgradeApplePlaceholder(
  db: typeof appDb,
  sub: string,
  incoming: { email?: unknown; emailVerified?: unknown; name?: unknown },
): Promise<void> {
  const [current] = await linkedUser(db, sub);
  if (!current) return;
  const patch = placeholderUpgrade(current, incoming);
  if (!patch) return;
  try {
    await db
      .update(user)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(user.id, current.id));
  } catch (err) {
    console.warn('[apple] could not replace the placeholder e-mail:', err);
  }
}

/**
 * Refresh token Better Auth stored for this user's Apple account, when they signed in through the
 * redirect flow (web). Stored as is: `account.encryptOAuthTokens` is not enabled in auth.ts (if it
 * ever is, decrypt it here). `null` for native iOS sign-ins, which keep no Apple token.
 */
export async function findAppleRefreshToken(
  db: typeof appDb,
  userId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ refreshToken: account.refreshToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'apple')))
    .limit(1);
  return row?.refreshToken ?? null;
}

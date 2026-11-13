import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../env.js';

/**
 * Newsletter unsubscribe links.
 *
 * The token is `<base64url(email)>.<hmac>`: stateless, no expiry (an
 * unsubscribe link must keep working in old e-mails) and impossible to forge
 * for someone else's address without BETTER_AUTH_SECRET.
 */

function sign(payload: string) {
  return createHmac('sha256', env.BETTER_AUTH_SECRET)
    .update(`unsubscribe:${payload}`)
    .digest('base64url');
}

export function createUnsubscribeToken(email: string) {
  const payload = Buffer.from(email.trim().toLowerCase()).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** Returns the e-mail encoded in a valid token, or null if the token is invalid. */
export function verifyUnsubscribeToken(token: string): string | null {
  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  return Buffer.from(payload, 'base64url').toString();
}

/** Public URL to put in newsletter e-mails (and the List-Unsubscribe header). */
export function buildUnsubscribeUrl(email: string) {
  const base = env.BETTER_AUTH_URL.replace(/\/$/, '');
  return `${base}/unsubscribe?token=${createUnsubscribeToken(email)}`;
}

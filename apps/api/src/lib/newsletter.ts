import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { env } from '../env.js';
import type { db as appDb } from './db.js';
import { resend } from './email.js';
import { waitlistLeads } from './tables.js';
import { buildUnsubscribeUrl } from './unsubscribe.js';

/**
 * Newsletter audience kept in Resend.
 *
 * `waitlist_leads` is the source of truth; every lead is mirrored as a Resend contact in the
 * "Waitlist" segment (`RESEND_WAITLIST_SEGMENT_ID`) so broadcasts can target them. Opt-outs
 * flow both ways: our /unsubscribe page updates the contact, and Resend's own unsubscribe link
 * (`{{{RESEND_UNSUBSCRIBE_URL}}}` in broadcasts) comes back through the webhook.
 *
 * Without a segment ID (staging, local) nothing is ever written to Resend contacts.
 */

type Database = typeof appDb;

export const newsletterSegmentId = env.RESEND_WAITLIST_SEGMENT_ID ?? null;
export const isNewsletterSyncEnabled = () => newsletterSegmentId !== null;

/**
 * Resend contact property holding each contact's signed link to our /unsubscribe page.
 * Newsletter templates use it as `{{{contact.unsubscribe_url}}}`, so opting out lands on the
 * Seego-branded page (which updates both the DB and Resend) instead of Resend's hosted one.
 * The property must exist on the Resend account (created once, string, fallback seego.fr).
 */
export const UNSUBSCRIBE_URL_PROPERTY = 'unsubscribe_url';

/** A Resend API call that failed (`code` is Resend's error name, e.g. `not_found`). */
export class ResendApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ResendApiError';
    this.code = code;
  }
}

type ResendResult<T> = { data: T | null; error: { name: string; message: string } | null };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Unwraps a Resend SDK result, throwing on error. Retries on `rate_limit_exceeded`
 * (the API allows a few requests per second and the admin screens fire several at once).
 */
export async function resendCall<T>(fn: () => Promise<ResendResult<T>>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const { data, error } = await fn();
    if (!error) return data as T;
    if (error.name === 'rate_limit_exceeded' && attempt < 3) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    throw new ResendApiError(error.name, error.message);
  }
}

/** Adds (or re-subscribes) a lead in the Resend audience. Best effort: never throws. */
export async function upsertNewsletterContact(email: string) {
  if (!newsletterSegmentId) return;
  const segmentId = newsletterSegmentId;
  try {
    const properties = { [UNSUBSCRIBE_URL_PROPERTY]: buildUnsubscribeUrl(email) };
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
      properties,
    });
    if (!error) return;
    // Most likely the contact already exists (someone signing up again after opting out).
    await resendCall(() => resend.contacts.update({ email, unsubscribed: false, properties }));
    await resendCall(() => resend.contacts.segments.add({ email, segmentId }));
  } catch (err) {
    console.error('[newsletter] contact upsert failed:', err);
  }
}

/** Mirrors an opt-out made on our /unsubscribe page. Best effort: never throws. */
export async function markNewsletterContactUnsubscribed(email: string) {
  if (!newsletterSegmentId) return;
  try {
    await resendCall(() => resend.contacts.update({ email, unsubscribed: true }));
  } catch (err) {
    // `not_found` only means the lead was never synced: the DB opt-out still applies.
    console.error('[newsletter] contact opt-out failed:', err);
  }
}

/**
 * Applies an opt-in/opt-out coming from Resend (webhook) to `waitlist_leads`.
 * Only rows whose state actually changes are touched.
 */
export async function applyResendSubscription(db: Database, email: string, unsubscribed: boolean) {
  const normalized = email.trim().toLowerCase();
  await db
    .update(waitlistLeads)
    .set({ unsubscribedAt: unsubscribed ? new Date() : null })
    .where(
      and(
        eq(waitlistLeads.email, normalized),
        unsubscribed
          ? isNull(waitlistLeads.unsubscribedAt)
          : isNotNull(waitlistLeads.unsubscribedAt),
      ),
    );
}

/** Max contacts read back from Resend (100 per page); the audience is far below this. */
const MAX_CONTACT_PAGES = 50;

/** Every contact of the account, or only those of `segmentId`. */
export async function listResendContacts(segmentId?: string) {
  const contacts: { email: string; unsubscribed: boolean }[] = [];
  let after: string | undefined;
  for (let page = 0; page < MAX_CONTACT_PAGES; page++) {
    const result = await resendCall(() =>
      resend.contacts.list({ limit: 100, ...(after ? { after } : {}), segmentId }),
    );
    contacts.push(...result.data.map((c) => ({ email: c.email, unsubscribed: c.unsubscribed })));
    const last = result.data.at(-1);
    if (!result.has_more || !last) return { contacts, truncated: false };
    after = last.id;
  }
  return { contacts, truncated: true };
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** CSV for a Resend contact import: one row per lead, with its opt-out state and unsubscribe link. */
export function buildContactsCsv(
  leads: { email: string; unsubscribedAt: Date | null }[],
  unsubscribeUrlFor: (email: string) => string,
) {
  const rows = leads.map(
    (lead) =>
      `${csvCell(lead.email)},${lead.unsubscribedAt ? 'true' : 'false'},${csvCell(unsubscribeUrlFor(lead.email))}`,
  );
  return [`email,unsubscribed,${UNSUBSCRIBE_URL_PROPERTY}`, ...rows].join('\n');
}

/**
 * Full sync of `waitlist_leads` into the Resend "Waitlist" segment.
 *
 * 1. Opt-outs recorded on Resend win: they are copied to the DB first, so a missed webhook
 *    can never turn into a re-subscription.
 * 2. Every lead is upserted through one contact import (CSV), with its opt-out state and its
 *    signed unsubscribe link (`unsubscribe_url` property).
 *
 * The import runs asynchronously on Resend's side; its status is read with `contacts.imports.get`.
 */
export async function syncWaitlistToResend(db: Database) {
  if (!newsletterSegmentId) {
    throw new ResendApiError('sync_disabled', 'Synchronisation désactivée sur cet environnement.');
  }
  const segmentId = newsletterSegmentId;

  const { contacts } = await listResendContacts();
  const optedOut = contacts.filter((c) => c.unsubscribed).map((c) => c.email.toLowerCase());
  let reconciled = 0;
  for (let i = 0; i < optedOut.length; i += 500) {
    const updated = await db
      .update(waitlistLeads)
      .set({ unsubscribedAt: new Date() })
      .where(
        and(
          inArray(waitlistLeads.email, optedOut.slice(i, i + 500)),
          isNull(waitlistLeads.unsubscribedAt),
        ),
      )
      .returning({ id: waitlistLeads.id });
    reconciled += updated.length;
  }

  const leads = await db
    .select({ email: waitlistLeads.email, unsubscribedAt: waitlistLeads.unsubscribedAt })
    .from(waitlistLeads);
  if (leads.length === 0) return { importId: null, total: 0, reconciled };

  const { id } = await resendCall(() =>
    resend.contacts.imports.create({
      file: new Blob([buildContactsCsv(leads, buildUnsubscribeUrl)], { type: 'text/csv' }),
      columnMap: {
        email: 'email',
        unsubscribed: 'unsubscribed',
        properties: {
          [UNSUBSCRIBE_URL_PROPERTY]: { column: UNSUBSCRIBE_URL_PROPERTY, type: 'string' },
        },
      },
      onConflict: 'upsert',
      segments: [{ id: segmentId }],
    }),
  );
  return { importId: id, total: leads.length, reconciled };
}

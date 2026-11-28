import { createHmac, timingSafeEqual } from 'node:crypto';
import { waitlistLeads } from '@seego/database';
import { and, isNotNull, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { db as appDb } from './db.js';

/**
 * Waitlist leads coming from the Tally survey ("Ton avis sur Seego"), whose last question
 * optionally asks for an e-mail address.
 *
 * Two entry points share this module: the `POST /webhooks/tally` route (new submissions) and
 * the one-off `scripts/backfill-tally-leads.ts` (submissions made before the webhook existed).
 * Kept free of `env.js` so the script can run with only `DATABASE_URL` and a Tally API key.
 */

// Only `insert` is used, so a transaction (backfill script) works as well as the client.
type Database = Pick<typeof appDb, 'insert'>;

/** Attribution stored on every lead created from the survey. */
export const TALLY_LEAD_ATTRIBUTION = {
  utmSource: 'tally',
  utmMedium: 'survey',
  utmCampaign: 'questionnaire_avis',
} as const;

const emailSchema = z.email().max(254);

/** Trimmed, lower-cased e-mail, or null when the value is not a valid address. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return emailSchema.safeParse(email).success ? email : null;
}

/** First valid answer to an `INPUT_EMAIL` question (webhook `data.fields` entries). */
export function extractTallyEmail(fields: { type: string; value?: unknown }[]): string | null {
  for (const field of fields) {
    if (field.type !== 'INPUT_EMAIL') continue;
    const email = normalizeEmail(field.value);
    if (email) return email;
  }
  return null;
}

/** One page of `GET https://api.tally.so/forms/{formId}/submissions`. */
export const tallySubmissionsPageSchema = z.object({
  hasMore: z.boolean(),
  questions: z.array(z.object({ id: z.string(), type: z.string() })),
  submissions: z.array(
    z.object({
      id: z.string(),
      submittedAt: z.iso.datetime({ offset: true }),
      responses: z.array(z.object({ questionId: z.string(), answer: z.unknown() })),
    }),
  ),
});

/** E-mail left in each submission of an API page (submissions without one are skipped). */
export function extractEmailsFromSubmissionsPage(page: z.infer<typeof tallySubmissionsPageSchema>) {
  const emailQuestionIds = new Set(
    page.questions.filter((q) => q.type === 'INPUT_EMAIL').map((q) => q.id),
  );
  return page.submissions.flatMap((submission) => {
    const email = submission.responses
      .filter((r) => emailQuestionIds.has(r.questionId))
      .map((r) => normalizeEmail(r.answer))
      .find((e) => e !== null);
    return email
      ? [{ submissionId: submission.id, email, submittedAt: new Date(submission.submittedAt) }]
      : [];
  });
}

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

/**
 * Checks the `Tally-Signature` header: base64 HMAC-SHA256 of the JSON payload with the
 * webhook's signing secret. Tally's own example signs `JSON.stringify(parsedBody)`, so both
 * the raw body and its re-serialisation are accepted (they only differ if Tally ever sends
 * non-compact JSON).
 */
export function verifyTallySignature(rawBody: string, signature: string, secret: string) {
  if (!signature) return false;
  const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64');
  if (safeEqual(sign(rawBody), signature)) return true;
  try {
    return safeEqual(sign(JSON.stringify(JSON.parse(rawBody))), signature);
  } catch {
    return false;
  }
}

export type TallyLeadOutcome = 'inserted' | 'resubscribed' | 'unchanged';

/**
 * Records a survey e-mail in `waitlist_leads`, without ever duplicating or overwriting a lead
 * (someone may already have signed up on seego.fr):
 * - unknown e-mail → new lead, attributed to Tally, dated from the submission;
 * - existing lead that opted out **before** this submission → re-subscribed (`unsubscribed_at`
 *   cleared), since answering the survey is a newer sign of interest;
 * - any other existing lead → left untouched (its attribution and an opt-out made after the
 *   submission both win).
 */
export async function upsertTallyLead(
  db: Database,
  email: string,
  submittedAt: Date,
): Promise<TallyLeadOutcome> {
  const [row] = await db
    .insert(waitlistLeads)
    .values({ email, ...TALLY_LEAD_ATTRIBUTION, createdAt: submittedAt })
    .onConflictDoUpdate({
      target: waitlistLeads.email,
      set: { unsubscribedAt: null },
      setWhere: and(
        isNotNull(waitlistLeads.unsubscribedAt),
        lt(waitlistLeads.unsubscribedAt, submittedAt),
      ),
    })
    // `xmax = 0` only on a freshly inserted row (an updated one carries the updating transaction).
    .returning({ inserted: sql<boolean>`(xmax = 0)` });

  if (!row) return 'unchanged';
  return row.inserted ? 'inserted' : 'resubscribed';
}

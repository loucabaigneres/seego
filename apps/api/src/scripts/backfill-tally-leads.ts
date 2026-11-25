/* eslint-disable no-console */
/**
 * One-off: copies the e-mails left in past Tally survey submissions into `waitlist_leads`
 * (submissions made before the `POST /webhooks/tally` route existed).
 *
 *   DATABASE_URL=postgres://... TALLY_API_KEY=tly-... \
 *     pnpm --filter @seego/api exec tsx src/scripts/backfill-tally-leads.ts <formId> [--dry-run]
 *
 * Same rules as the webhook (`upsertTallyLead`): no duplicate, an existing lead is never
 * overwritten, and a lead who opted out before answering the survey is re-subscribed.
 * Unlike the webhook, no confirmation e-mail is sent and Resend is not touched: sync the
 * audience from the admin app afterwards. Safe to run several times.
 *
 * `--dry-run` runs everything inside a transaction that is rolled back, so the reported
 * counts are exact but nothing is written.
 */
import { createClient } from '@seego/database';
import { TransactionRollbackError } from 'drizzle-orm';
import {
  extractEmailsFromSubmissionsPage,
  tallySubmissionsPageSchema,
  type TallyLeadOutcome,
  upsertTallyLead,
} from '../lib/tallyLeads.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const formId = args.find((arg) => !arg.startsWith('--'));
const { DATABASE_URL, TALLY_API_KEY } = process.env;

if (!formId || !DATABASE_URL || !TALLY_API_KEY) {
  console.error(
    'Usage: DATABASE_URL=... TALLY_API_KEY=... tsx src/scripts/backfill-tally-leads.ts <formId> [--dry-run]',
  );
  process.exit(1);
}

async function fetchSubmissions(id: string, apiKey: string) {
  const all: ReturnType<typeof extractEmailsFromSubmissionsPage> = [];
  for (let page = 1; ; page++) {
    const url = new URL(`https://api.tally.so/forms/${encodeURIComponent(id)}/submissions`);
    url.searchParams.set('filter', 'completed');
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', '500');
    const response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!response.ok) {
      throw new Error(`Tally API ${response.status}: ${await response.text()}`);
    }
    const data = tallySubmissionsPageSchema.parse(await response.json());
    all.push(...extractEmailsFromSubmissionsPage(data));
    if (!data.hasMore) return all;
  }
}

const submissions = await fetchSubmissions(formId, TALLY_API_KEY);
// Oldest first: a lead is dated from its first answer, and a later answer can still re-subscribe it.
submissions.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());

const db = createClient(DATABASE_URL);
console.log(
  `${dryRun ? '[dry-run] ' : ''}${submissions.length} submissions with an e-mail → ${new URL(DATABASE_URL).host}`,
);

const counts: Record<TallyLeadOutcome, number> = { inserted: 0, resubscribed: 0, unchanged: 0 };
try {
  await db.transaction(async (tx) => {
    for (const { email, submittedAt } of submissions) {
      const outcome = await upsertTallyLead(tx, email, submittedAt);
      counts[outcome]++;
      if (outcome !== 'unchanged') console.log(`  ${outcome.padEnd(12)} ${email}`);
    }
    if (dryRun) tx.rollback();
  });
} catch (err) {
  if (!(err instanceof TransactionRollbackError)) throw err;
}

console.log(
  `${dryRun ? '[dry-run, rolled back] ' : ''}inserted: ${counts.inserted}, re-subscribed: ${counts.resubscribed}, already there: ${counts.unchanged}`,
);
process.exit(0);

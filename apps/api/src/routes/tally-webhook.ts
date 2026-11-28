import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { env } from '../env.js';
import { db } from '../lib/db.js';
import { sendWaitlistConfirmation } from '../lib/email.js';
import { upsertNewsletterContact } from '../lib/newsletter.js';
import { extractTallyEmail, upsertTallyLead, verifyTallySignature } from '../lib/tallyLeads.js';

// Only what we read from a FORM_RESPONSE event (https://tally.so/help/webhooks).
const tallyEventSchema = z.object({
  eventType: z.string(),
  createdAt: z.string().optional(),
  data: z
    .object({
      createdAt: z.string().optional(),
      fields: z.array(z.object({ type: z.string(), value: z.unknown() })).default([]),
    })
    .optional(),
});

const parseDate = (value: string | undefined) => {
  const date = value ? new Date(value) : new Date(NaN);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

/**
 * POST /webhooks/tally — completed submissions of the Tally survey (webhook configured on the
 * form, production only, with a signing secret).
 *
 * The e-mail left at the end of the survey becomes a waitlist lead (see `upsertTallyLead`).
 * A newly added or re-subscribed lead gets the same treatment as a seego.fr sign-up:
 * confirmation e-mail and Resend contact.
 *
 * The signature is checked on the raw body, so this route lives in its own encapsulated scope
 * where JSON bodies are kept as strings. Any non-2xx answer makes Tally retry (5 min → 1 day),
 * so only a database failure returns one.
 */
export function registerTallyWebhook(server: FastifyInstance) {
  void server.register(async (scope) => {
    scope.removeContentTypeParser('application/json');
    scope.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
      done(null, body);
    });

    scope.post('/webhooks/tally', async (request, reply) => {
      if (!env.TALLY_SIGNING_SECRET) {
        return reply.status(503).send({ error: 'Webhook not configured' });
      }

      const rawBody = typeof request.body === 'string' ? request.body : '';
      const header = request.headers['tally-signature'];
      const signature = (Array.isArray(header) ? header[0] : header) ?? '';
      if (!verifyTallySignature(rawBody, signature, env.TALLY_SIGNING_SECRET)) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }

      let json: unknown;
      try {
        json = JSON.parse(rawBody);
      } catch {
        return reply.status(400).send({ error: 'Invalid payload' });
      }
      const event = tallyEventSchema.safeParse(json);
      if (!event.success) return reply.status(400).send({ error: 'Invalid payload' });
      if (event.data.eventType !== 'FORM_RESPONSE' || !event.data.data) {
        return reply.send({ received: true });
      }

      const email = extractTallyEmail(event.data.data.fields);
      if (!email) return reply.send({ received: true });

      const submittedAt = parseDate(event.data.data.createdAt ?? event.data.createdAt);
      const outcome = await upsertTallyLead(db, email, submittedAt);
      if (outcome !== 'unchanged') {
        void sendWaitlistConfirmation(email);
        void upsertNewsletterContact(email);
      }

      return reply.send({ received: true });
    });
  });
}

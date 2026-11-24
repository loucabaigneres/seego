import type { FastifyInstance } from 'fastify';

import { env } from '../env.js';
import { db } from '../lib/db.js';
import { resend } from '../lib/email.js';
import { applyResendSubscription } from '../lib/newsletter.js';

/**
 * POST /webhooks/resend — events sent by Resend (configured on the Resend dashboard, production
 * only, with the `contact.updated` event).
 *
 * Its purpose is to keep `waitlist_leads.unsubscribed_at` in line with opt-outs made through
 * Resend's own unsubscribe link (`{{{RESEND_UNSUBSCRIBE_URL}}}` in broadcasts), which never
 * reach our /unsubscribe page.
 *
 * The signature (Standard Webhooks, `svix-*` headers) is checked on the raw body, so this route
 * lives in its own encapsulated scope where JSON bodies are kept as strings.
 */
export function registerResendWebhook(server: FastifyInstance) {
  void server.register(async (scope) => {
    scope.removeContentTypeParser('application/json');
    scope.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
      done(null, body);
    });

    scope.post('/webhooks/resend', async (request, reply) => {
      if (!env.RESEND_WEBHOOK_SECRET) {
        return reply.status(503).send({ error: 'Webhook not configured' });
      }

      const header = (name: string) => {
        const value = request.headers[name];
        return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
      };

      let event: ReturnType<typeof resend.webhooks.verify>;
      try {
        event = resend.webhooks.verify({
          payload: typeof request.body === 'string' ? request.body : '',
          headers: {
            id: header('svix-id'),
            timestamp: header('svix-timestamp'),
            signature: header('svix-signature'),
          },
          webhookSecret: env.RESEND_WEBHOOK_SECRET,
        });
      } catch {
        return reply.status(400).send({ error: 'Invalid signature' });
      }

      if (event.type === 'contact.updated') {
        await applyResendSubscription(db, event.data.email, event.data.unsubscribed);
      }

      return reply.send({ received: true });
    });
  });
}

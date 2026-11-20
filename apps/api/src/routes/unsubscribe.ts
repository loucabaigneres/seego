import { eq, isNull, and } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { db } from '../lib/db.js';
import { resend } from '../lib/email.js';
import { waitlistLeads } from '../lib/tables.js';
import { verifyUnsubscribeToken } from '../lib/unsubscribe.js';

/**
 * Newsletter unsubscribe.
 *
 * - GET  /unsubscribe?token=…  shows a confirmation page. Nothing changes on GET,
 *   because mail scanners prefetch links and would unsubscribe people by mistake.
 * - POST /unsubscribe?token=…  performs the opt-out. It serves both the confirmation
 *   button and the one-click mechanism (RFC 8058, `List-Unsubscribe-Post` header)
 *   used by Gmail / Apple Mail.
 *
 * The opt-out is recorded in `waitlist_leads.unsubscribed_at` and mirrored on the
 * Resend contact so broadcasts stop targeting the address.
 */

const page = (title: string, body: string) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} – Seego</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f7f9;color:#111;display:grid;place-items:center;min-height:100vh;margin:0}
main{background:#fff;border-radius:16px;padding:32px;max-width:420px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center}
button{background:#111;color:#fff;border:0;border-radius:999px;padding:12px 24px;font-size:16px;cursor:pointer}
p{color:#555;line-height:1.5}</style></head>
<body><main><h1>${title}</h1>${body}</main></body></html>`;

async function unsubscribe(email: string) {
  await db
    .update(waitlistLeads)
    .set({ unsubscribedAt: new Date() })
    .where(and(eq(waitlistLeads.email, email), isNull(waitlistLeads.unsubscribedAt)));

  // Best effort: the DB is the source of truth, a Resend failure must not break the opt-out.
  try {
    const { error } = await resend.contacts.update({ email, unsubscribed: true });
    if (error) console.error('[unsubscribe] Resend error:', error);
  } catch (err) {
    console.error('[unsubscribe] Resend update failed:', err);
  }
}

export function registerUnsubscribe(server: FastifyInstance) {
  // Form posts / one-click bodies (`List-Unsubscribe=One-Click`) carry nothing we need;
  // the token is in the query string. Accept them instead of answering 415.
  server.addContentTypeParser(
    'application/x-www-form-urlencoded',
    { parseAs: 'string' },
    (_req, body, done) => {
      done(null, body);
    },
  );

  server.get<{ Querystring: { token?: string } }>('/unsubscribe', async (request, reply) => {
    const token = request.query.token ?? '';
    reply.type('text/html; charset=utf-8');

    if (!verifyUnsubscribeToken(token)) {
      return reply
        .status(400)
        .send(page('Lien invalide', '<p>Ce lien de désinscription est invalide ou incomplet.</p>'));
    }

    return reply.send(
      page(
        'Se désinscrire ?',
        `<p>Tu ne recevras plus la newsletter Seego.</p>
<form method="post" action="/unsubscribe?token=${encodeURIComponent(token)}"><button type="submit">Confirmer la désinscription</button></form>`,
      ),
    );
  });

  server.post<{ Querystring: { token?: string } }>('/unsubscribe', async (request, reply) => {
    const email = verifyUnsubscribeToken(request.query.token ?? '');
    reply.type('text/html; charset=utf-8');

    if (!email) {
      return reply
        .status(400)
        .send(page('Lien invalide', '<p>Ce lien de désinscription est invalide ou incomplet.</p>'));
    }

    await unsubscribe(email);
    return reply.send(
      page(
        'Tu es désinscrit(e)',
        '<p>Tu ne recevras plus la newsletter Seego. À bientôt peut-être !</p>',
      ),
    );
  });
}

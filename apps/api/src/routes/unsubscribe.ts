import { eq, isNull, and } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

import { db } from '../lib/db.js';
import { markNewsletterContactUnsubscribed } from '../lib/newsletter.js';
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

// Seego charte, same values as the e-mail templates. Copied from `packages/ui/src/colors.ts`
// (`palette`, `colors.ink`): @seego/ui ships TypeScript sources the compiled API cannot load.
const page = (title: string, body: string) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="robots" content="noindex">
<title>${title} – Seego</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:32px 16px;background:#F7F0E8;color:#22090F;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif}
.logo{font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:34px;color:#5C1426;text-decoration:none}
.logo i{font-style:italic}.logo span{color:#F08A5D}
main{width:100%;max-width:440px;background:#5C1426;border-radius:20px;padding:40px 32px;text-align:center}
h1{margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:34px;line-height:40px;color:#F7F0E8}
p{margin:0 0 24px;font-size:16px;line-height:24px;color:#F5C6A8}
p:last-child{margin-bottom:0}
button,.cta{display:inline-block;background:#F08A5D;color:#22090F;border:0;border-radius:28px;padding:16px 28px;font:bold 16px/20px 'Hanken Grotesk',Arial,Helvetica,sans-serif;cursor:pointer;text-decoration:none}
button:focus-visible,.cta:focus-visible{outline:3px solid #F5C6A8;outline-offset:3px}
footer{font-size:13px;line-height:20px;color:#6A5055}
footer a{color:#5C1426}
</style></head>
<body>
<a class="logo" href="https://www.seego.fr">See<i>go</i><span>.</span></a>
<main><h1>${title}</h1>${body}</main>
<footer><a href="https://www.seego.fr">seego.fr</a> · Planifie tes voyages à plusieurs</footer>
</body></html>`;

async function unsubscribe(email: string) {
  await db
    .update(waitlistLeads)
    .set({ unsubscribedAt: new Date() })
    .where(and(eq(waitlistLeads.email, email), isNull(waitlistLeads.unsubscribedAt)));

  // Best effort: the DB is the source of truth, a Resend failure must not break the opt-out.
  await markNewsletterContactUnsubscribed(email);
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
        '<p>Tu ne recevras plus la newsletter Seego. À bientôt peut-être !</p><a class="cta" href="https://www.seego.fr">Retour sur seego.fr</a>',
      ),
    );
  });
}

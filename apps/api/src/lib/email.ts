import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_TRANSACTIONAL = 'Seego <noreply@mail.seego.fr>';

export async function sendTransactional(opts: { to: string; subject: string; html: string }) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_TRANSACTIONAL,
      ...opts,
    });
    if (error) console.error('[email] Resend error:', error);
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}

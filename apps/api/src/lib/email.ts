import { Resend } from 'resend';
import { env } from '../env.js';
import { buildUnsubscribeUrl } from './unsubscribe.js';

export const resend = new Resend(env.RESEND_API_KEY);

const FROM_TRANSACTIONAL = 'Seego <noreply@mail.seego.fr>';
export const FROM_MARKETING = 'Seego <hello@news.seego.fr>';

export const TEMPLATES = {
  verifyEmailOtp: 'verify-email-otp',
  resetPassword: 'reset-password',
  waitlistConfirmation: 'waitlist-confirmation',
} as const;

async function sendTemplate(opts: {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, string | number>;
}) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_TRANSACTIONAL,
      to: opts.to,
      subject: opts.subject,
      template: { id: opts.template, variables: opts.variables },
    });
    if (error) console.error(`[email] Resend error (${opts.template}):`, error);
  } catch (err) {
    console.error(`[email] send failed (${opts.template}):`, err);
  }
}

export function sendVerificationCode(to: string, code: string) {
  return sendTemplate({
    to,
    subject: 'Ton code de confirmation Seego',
    template: TEMPLATES.verifyEmailOtp,
    variables: { OTP_CODE: code },
  });
}

export function sendResetPasswordEmail(to: string, url: string) {
  return sendTemplate({
    to,
    subject: 'Réinitialise ton mot de passe Seego',
    template: TEMPLATES.resetPassword,
    variables: { RESET_URL: url },
  });
}

export function sendWaitlistConfirmation(to: string) {
  return sendTemplate({
    to,
    subject: 'Bienvenue dans la communauté Seego !',
    template: TEMPLATES.waitlistConfirmation,
    variables: { UNSUBSCRIBE_URL: buildUnsubscribeUrl(to) },
  });
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Security notice sent when the 'admin' role changes: to the account concerned and to every
 * admin, so a mistaken or malicious change is noticed right away. Plain message (no Resend
 * template) since it is internal.
 */
export async function sendAdminRoleNotice(opts: {
  to: string[];
  action: 'grant' | 'revoke';
  targetEmail: string;
  actorEmail: string;
}) {
  if (opts.to.length === 0) return;
  const granted = opts.action === 'grant';
  const subject = granted
    ? `[Seego Admin] ${opts.targetEmail} est maintenant administrateur`
    : `[Seego Admin] ${opts.targetEmail} n'est plus administrateur`;
  const lines = [
    granted
      ? `Le compte ${opts.targetEmail} a reçu le rôle administrateur du back-office Seego.`
      : `Le compte ${opts.targetEmail} n'a plus le rôle administrateur du back-office Seego.`,
    `Modification faite par ${opts.actorEmail} le ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}.`,
    "Si ce changement n'était pas prévu, préviens l'équipe immédiatement : un administrateur peut l'annuler depuis la page Administrateurs.",
  ];
  try {
    // One message per recipient so admins never see each other's addresses.
    const { error } = await resend.batch.send(
      opts.to.map((to) => ({
        from: FROM_TRANSACTIONAL,
        to,
        subject,
        text: lines.join('\n\n'),
        html: lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''),
      })),
    );
    if (error) console.error('[email] Resend error (admin-role-notice):', error);
  } catch (err) {
    console.error('[email] send failed (admin-role-notice):', err);
  }
}

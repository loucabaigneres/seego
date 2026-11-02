import { Resend } from 'resend';
import { env } from '../env.js';

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
    if (error) console.error('[email] Resend error (${opts.template}):', error);
  } catch (err) {
    console.error('[email] send failed (${opts.template}):', err);
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
  });
}

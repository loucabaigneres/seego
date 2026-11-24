import { z } from 'zod';

export const waitlistStatusSchema = z.enum(['all', 'subscribed', 'unsubscribed']);

export const listWaitlistLeadsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
  // Recherche partielle (insensible à la casse) sur l'e-mail.
  search: z.string().trim().max(254).optional(),
  status: waitlistStatusSchema.default('all'),
});

const email = z.string().trim().toLowerCase().max(255).pipe(z.email());
// Re-authentication: every role change asks for the acting admin's password.
const password = z.string().min(1).max(128);

export const lookupAdminCandidateSchema = z.object({ email });

export const grantAdminSchema = z.object({
  userId: z.string().min(1),
  // Typed again by hand in the confirmation step, compared server-side with the account's e-mail.
  confirmEmail: email,
  password,
});

// Resend identifiers (templates also accept their alias).
const resendId = z.string().trim().min(1).max(100);

export const emailTemplateSchema = z.object({ templateId: resendId });

export const createBroadcastSchema = z.object({
  templateId: resendId,
  name: z.string().trim().min(1).max(120),
});

/** Word the admin types by hand before a broadcast goes to the whole segment. */
export const BROADCAST_CONFIRMATION_WORD = 'ENVOYER';

export const sendBroadcastSchema = z.object({
  broadcastId: resendId,
  confirmation: z.literal(BROADCAST_CONFIRMATION_WORD, {
    error: `Tape ${BROADCAST_CONFIRMATION_WORD} pour confirmer l’envoi.`,
  }),
});

export const removeBroadcastSchema = z.object({ broadcastId: resendId });

export const revokeAdminSchema = z.object({
  userId: z.string().min(1),
  password,
});

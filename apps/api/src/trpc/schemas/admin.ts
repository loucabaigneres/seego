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

export const revokeAdminSchema = z.object({
  userId: z.string().min(1),
  password,
});

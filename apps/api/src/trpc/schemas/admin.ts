import { z } from 'zod';

export const waitlistStatusSchema = z.enum(['all', 'subscribed', 'unsubscribed']);

export const listWaitlistLeadsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
  // Recherche partielle (insensible à la casse) sur l'e-mail.
  search: z.string().trim().max(254).optional(),
  status: waitlistStatusSchema.default('all'),
});

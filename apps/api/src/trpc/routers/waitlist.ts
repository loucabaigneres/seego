import { waitlistLeads } from '@seego/database';
import { isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { sendWaitlistConfirmation } from '../../lib/email.js';
import { upsertNewsletterContact } from '../../lib/newsletter.js';
import { createTRPCRouter, publicProcedure } from '../init.js';

// Marketing attribution captured from the landing page. Everything but the
// e-mail is optional (a visitor may arrive without any UTM parameter).
const joinInput = z.object({
  email: z.email('Adresse e-mail invalide.').max(254),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(150).optional(),
  utmTerm: z.string().max(150).optional(),
  utmContent: z.string().max(150).optional(),
  referrer: z.string().max(2048).optional(),
  landingPageUrl: z.string().max(2048).optional(),
});

export const waitlistRouter = createTRPCRouter({
  /**
   * Registers a waitlist lead. Public (visitors are not authenticated).
   * The e-mail is unique, so re-submitting the same address is a no-op, except for
   * someone who previously unsubscribed: signing up again clears `unsubscribed_at`
   * (we keep the row as a soft opt-out rather than deleting it) and re-sends the
   * confirmation e-mail.
   */
  join: publicProcedure.input(joinInput).mutation(async ({ ctx, input }) => {
    const email = input.email.trim().toLowerCase();

    const inserted = await ctx.db
      .insert(waitlistLeads)
      .values({
        email,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmTerm: input.utmTerm,
        utmContent: input.utmContent,
        referrer: input.referrer,
        landingPageUrl: input.landingPageUrl,
      })
      .onConflictDoUpdate({
        target: waitlistLeads.email,
        set: { unsubscribedAt: null },
        // Only touch rows that opted out; an active lead stays untouched (no row returned).
        setWhere: isNotNull(waitlistLeads.unsubscribedAt),
      })
      .returning({ id: waitlistLeads.id });

    if (inserted.length > 0) {
      void sendWaitlistConfirmation(email);
      void upsertNewsletterContact(email);
    }

    return { success: true };
  }),
});

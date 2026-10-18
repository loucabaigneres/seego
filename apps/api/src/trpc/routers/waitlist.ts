import { waitlistLeads } from '@voyagr/database';
import { z } from 'zod';
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
   * The e-mail is unique, so re-submitting the same address is a no-op.
   */
  join: publicProcedure.input(joinInput).mutation(async ({ ctx, input }) => {
    const email = input.email.trim().toLowerCase();

    await ctx.db
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
      // Same address twice -> keep the first lead, report success anyway.
      .onConflictDoNothing({ target: waitlistLeads.email });

    return { success: true };
  }),
});

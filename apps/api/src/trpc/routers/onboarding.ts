import { trip, userOnboarding } from '@seego/database';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init.js';
import { submitOnboardingSchema } from '../schemas/onboarding.js';

export const onboardingRouter = createTRPCRouter({
  startDirectTrip: publicProcedure
    .input(
      z
        .object({
          guestId: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      const targetUserId = ctx.user?.id ?? input?.guestId ?? 'guest';

      const [newTrip] = await ctx.db
        .insert(trip)
        .values({
          userId: targetUserId,
          status: 'draft',
        })
        .returning({ id: trip.id });

      return {
        tripId: newTrip.id,
      };
    }),

  submit: publicProcedure.input(submitOnboardingSchema).mutation(async ({ ctx, input }) => {
    const targetUserId = ctx.user?.id ?? input.guestId ?? 'guest';

    let tripId: string;
    if (input.tripId) {
      const existing = await ctx.db.query.trip.findFirst({
        where: (t, { eq }) => eq(t.id, input.tripId!),
        columns: { userId: true },
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voyage introuvable.' });
      }
      if (!ctx.user || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Action non autorisée.' });
      }
      await ctx.db
        .update(trip)
        .set({ interests: input.vibes, updatedAt: new Date() })
        .where(eq(trip.id, input.tripId));
      tripId = input.tripId;
    } else {
      const [newTrip] = await ctx.db
        .insert(trip)
        .values({
          userId: targetUserId,
          status: 'draft',
          interests: input.vibes,
        })
        .returning({ id: trip.id });
      tripId = newTrip.id;
    }

    await ctx.db.insert(userOnboarding).values({
      tripId,
      userId: ctx.user?.id ?? null,
      landscapes: input.landscapes,
      vibes: input.vibes,
      travelWith: input.travelWith,
      climates: input.climates,
    });

    return {
      success: true,
      tripId,
    };
  }),
});

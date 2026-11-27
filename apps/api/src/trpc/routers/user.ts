import { TRPCError } from '@trpc/server';
import { userOnboarding } from '@seego/database';
import { and, count, desc, eq, inArray, isNull, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { env } from '../../env.js';
import {
  DELETE_CONFIRMATION,
  deleteAccount,
  isSessionFresh,
} from '../../lib/account/deleteAccount.js';
import { findAppleRefreshToken } from '../../lib/apple/knownUser.js';
import { revokeAppleAccess } from '../../lib/apple/revoke.js';
import { swipes, trip, user } from '../../lib/tables.js';
import { createTRPCRouter, protectedProcedure } from '../init.js';

/** Sign in with Apple key, to revoke the user's Apple authorization on deletion. */
const appleKey = {
  teamId: env.APPLE_TEAM_ID,
  keyId: env.APPLE_KEY_ID,
  privateKey: env.APPLE_PRIVATE_KEY,
};

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [userData] = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, ctx.user.id));

    const [tripsCount] = await ctx.db
      .select({ value: count() })
      .from(trip)
      .where(and(eq(trip.userId, ctx.user.id), isNull(trip.deletedAt)));

    const [likedCount] = await ctx.db
      .select({ value: count() })
      .from(swipes)
      .where(eq(swipes.userId, ctx.user.id));

    return {
      user: userData,
      stats: {
        tripsCount: Number(tripsCount?.value ?? 0),
        likedPlacesCount: Number(likedCount?.value ?? 0),
      },
    };
  }),

  getTrips: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        status: trip.status,
        createdAt: trip.createdAt,
      })
      .from(trip)
      .where(and(eq(trip.userId, ctx.user.id), isNull(trip.deletedAt)))
      .orderBy(desc(trip.createdAt));
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
        image: z.string().url().optional().or(z.literal('')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          name: input.name,
          image: input.image || null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.user.id));

      return { success: true };
    }),

  renameTrip: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        title: z
          .string()
          .trim()
          .min(1, 'Le titre ne peut pas être vide.')
          .max(80, 'Le titre doit comporter au plus 80 caractères.'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedTrip] = await ctx.db
        .update(trip)
        .set({ title: input.title, updatedAt: new Date() })
        .where(and(eq(trip.id, input.tripId), eq(trip.userId, ctx.user.id), isNull(trip.deletedAt)))
        .returning({ id: trip.id, title: trip.title });

      if (!updatedTrip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Ce voyage n'existe pas ou vous n'avez pas l'autorisation de le modifier.",
        });
      }

      return { success: true, trip: updatedTrip };
    }),

  /**
   * Deletes the account and its data for good (GDPR, App Store guideline 5.1.1(v)).
   * Needs a recent sign-in, and for an Apple account a fresh authorization code from the device
   * so the Apple token can be revoked. Owned group trips go to another member.
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.literal(DELETE_CONFIRMATION),
        appleAuthorizationCode: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isSessionFresh(new Date(ctx.session.session.createdAt))) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Reconnecte-toi avant de supprimer ton compte.',
        });
      }

      // Before deleting: the Apple account row (and its stored token) goes with the user, and
      // the app's code is single-use. Best effort, the account is erased even if Apple is down.
      const revocation = await revokeAppleAccess({
        authorizationCode: input.appleAuthorizationCode,
        storedRefreshToken: await findAppleRefreshToken(ctx.db, ctx.user.id),
        bundleId: env.APPLE_APP_BUNDLE_IDENTIFIER,
        servicesId: env.APPLE_CLIENT_ID,
        key: appleKey,
      });
      // Only trace of whether Apple was told (App Store 5.1.1(v)).
      if (revocation.status === 'failed') {
        console.error('[deleteAccount] Apple revocation failed:', revocation);
      }

      const result = await deleteAccount(ctx.db, ctx.user.id);
      return { ...result, appleRevoked: revocation.status === 'revoked' };
    }),

  deleteTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedTrip] = await ctx.db
        .update(trip)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(trip.id, input.tripId),
            eq(trip.userId, ctx.user.id),
            // A group trip has members: only group.deleteGroupTrip may remove it.
            eq(trip.isGroup, false),
            isNull(trip.deletedAt),
          ),
        )
        .returning({ id: trip.id });

      if (!deletedTrip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Ce voyage n'existe pas ou vous n'avez pas l'autorisation de le supprimer.",
        });
      }

      return { success: true };
    }),

  saveTripToAccount: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updatedTrip] = await ctx.db
        .update(trip)
        .set({
          userId: ctx.user.id,
          status: 'finalized',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(trip.id, input.tripId),
            // Your own trip, or one made as a guest: never someone else's (a group's host).
            or(eq(trip.userId, ctx.user.id), like(trip.userId, 'guest\\_%')),
          ),
        )
        .returning();

      if (!updatedTrip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voyage introuvable.' });
      }

      return { success: true, trip: updatedTrip };
    }),

  // Moves everything created anonymously on this device (trips, onboarding answers, swipes)
  // to the logged-in account. Trip status is left untouched.
  claimGuestTrips: protectedProcedure
    // Only real guest ids, so a client cannot pass another user's id and take their trips.
    .input(z.object({ guestId: z.string().regex(/^guest_[0-9a-f-]{36}$/) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return await ctx.db.transaction(async (tx) => {
        const claimedTrips = await tx
          .update(trip)
          .set({ userId, updatedAt: new Date() })
          .where(eq(trip.userId, input.guestId))
          .returning({ id: trip.id });

        const claimedTripIds = claimedTrips.map((t) => t.id);
        if (claimedTripIds.length > 0) {
          await tx
            .update(userOnboarding)
            .set({ userId })
            .where(
              and(inArray(userOnboarding.tripId, claimedTripIds), isNull(userOnboarding.userId)),
            );
        }

        // A place swiped both as guest and as user would break the (user, content) unique index:
        // keep the account's swipe and drop the guest one.
        const alreadySwiped = tx
          .select({ id: swipes.discoveryContentId })
          .from(swipes)
          .where(eq(swipes.userId, userId));
        await tx
          .delete(swipes)
          .where(
            and(
              eq(swipes.userId, input.guestId),
              inArray(swipes.discoveryContentId, alreadySwiped),
            ),
          );
        await tx.update(swipes).set({ userId }).where(eq(swipes.userId, input.guestId));

        return { claimedTripsCount: claimedTripIds.length };
      });
    }),
});

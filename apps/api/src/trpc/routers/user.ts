import { TRPCError } from '@trpc/server';
import { userOnboarding } from '@seego/database';
import {
  and,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { z } from 'zod';
import { activity, discoveryContent, swipes, trip, tripDay, user } from '../../lib/tables.js';
import { createTRPCRouter, protectedProcedure } from '../init.js';
import { tripTitleSchema } from '../schemas/trip.js';

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
    // Correlated subqueries built with Drizzle so `trip.id` renders qualified ("trip"."id").
    // Day 0 holds the liked places, day -1 the alternative hotels, day 1+ the itinerary.
    const tripDayIds = (dayFilter: SQL) =>
      ctx.db
        .select({ id: tripDay.id })
        .from(tripDay)
        .where(and(eq(tripDay.tripId, trip.id), dayFilter));
    const activityCount = (dayFilter: SQL) =>
      ctx.db.$count(
        activity,
        and(isNull(activity.deletedAt), inArray(activity.tripDayId, tripDayIds(dayFilter))),
      );
    // Same rule as the trip page: the first itinerary photo, else a liked place's.
    const coverImage = ctx.db
      .select({ url: discoveryContent.mainMediaUrl })
      .from(activity)
      .innerJoin(tripDay, eq(tripDay.id, activity.tripDayId))
      .innerJoin(discoveryContent, eq(discoveryContent.id, activity.discoveryContentId))
      .where(and(eq(tripDay.tripId, trip.id), gte(tripDay.dayIndex, 0), isNull(activity.deletedAt)))
      .orderBy(sql`${tripDay.dayIndex} = 0`, tripDay.dayIndex, activity.orderIndex)
      .limit(1);

    return await ctx.db
      .select({
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        status: trip.status,
        createdAt: trip.createdAt,
        startDate: trip.startDate,
        durationDays: trip.durationDays,
        daysCount: ctx.db.$count(
          tripDay,
          and(eq(tripDay.tripId, trip.id), gt(tripDay.dayIndex, 0)),
        ),
        stepsCount: activityCount(gt(tripDay.dayIndex, 0)),
        likedCount: activityCount(eq(tripDay.dayIndex, 0)),
        coverImage: sql<string | null>`(${coverImage})`,
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
        title: tripTitleSchema,
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

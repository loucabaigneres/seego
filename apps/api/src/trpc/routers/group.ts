import { activity, trip, tripDay, tripMembers, user } from '@seego/database';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import crypto from 'node:crypto';
import { z } from 'zod';
import type { Context } from '../context.js';
import { createTRPCRouter, protectedProcedure } from '../init.js';
import { tripTitleSchema } from '../schemas/trip.js';

// Upper case only, no 0/O nor 1/I: codes are read aloud and typed by hand. 32 symbols, so a
// random byte modulo the length stays unbiased.
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 8;

/** Title of a group trip the host has not named. */
export const DEFAULT_GROUP_TRIP_TITLE = 'Nouveau voyage de groupe';

export function generateInvitePayload() {
  const bytes = crypto.randomBytes(INVITE_CODE_LENGTH);
  const inviteCode = Array.from(bytes, (b) => INVITE_ALPHABET[b % INVITE_ALPHABET.length]).join('');
  const inviteCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { inviteCode, inviteCodeExpiresAt };
}

/** The caller's row in `trip_members` for this trip, if any. */
function findMembership(ctx: { db: Context['db']; user: { id: string } }, tripId: string) {
  return ctx.db.query.tripMembers.findFirst({
    where: (tm, { and, eq }) => and(eq(tm.tripId, tripId), eq(tm.userId, ctx.user.id)),
  });
}

type MemberRow = {
  tripId: string;
  id: string;
  name: string;
  role: 'owner' | 'member' | null;
  joinedAt: Date;
};

/** Per trip: member count, the first 3 members (owner first, then by join date) and the owner's name. */
export function summarizeMembers(rows: MemberRow[]) {
  const sorted = [...rows].sort(
    (a, b) =>
      Number(b.role === 'owner') - Number(a.role === 'owner') ||
      a.joinedAt.getTime() - b.joinedAt.getTime(),
  );
  const byTrip = new Map<
    string,
    { memberCount: number; members: { id: string; name: string }[]; ownerName: string | null }
  >();
  for (const r of sorted) {
    const entry = byTrip.get(r.tripId) ?? { memberCount: 0, members: [], ownerName: null };
    entry.memberCount++;
    if (entry.members.length < 3) entry.members.push({ id: r.id, name: r.name });
    if (r.role === 'owner') entry.ownerName = r.name;
    byTrip.set(r.tripId, entry);
  }
  return byTrip;
}

export const groupRouter = createTRPCRouter({
  createOrConvertGroupTrip: protectedProcedure
    .input(
      z
        .object({
          tripId: z.uuid().optional(),
          title: tripTitleSchema.optional(),
          destination: z.string().trim().min(1).optional(),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      const { inviteCode, inviteCodeExpiresAt } = generateInvitePayload();

      if (input?.tripId) {
        const existingTrip = await ctx.db.query.trip.findFirst({
          where: (t, { eq }) => eq(t.id, input.tripId!),
        });

        if (!existingTrip) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Voyage introuvable.' });
        }

        if (existingTrip.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Action non autorisée.' });
        }

        const [updatedTrip] = await ctx.db
          .update(trip)
          .set({
            isGroup: true,
            inviteCode,
            inviteCodeExpiresAt,
            destination: input.destination ?? existingTrip.destination,
            updatedAt: new Date(),
          })
          .where(eq(trip.id, input.tripId))
          .returning();

        if (!(await findMembership(ctx, updatedTrip.id))) {
          await ctx.db.insert(tripMembers).values({
            tripId: updatedTrip.id,
            userId: ctx.user.id,
            role: 'owner',
          });
        }

        return {
          tripId: updatedTrip.id,
          inviteCode: updatedTrip.inviteCode,
          inviteCodeExpiresAt: updatedTrip.inviteCodeExpiresAt,
          destination: updatedTrip.destination,
        };
      }

      const [newTrip] = await ctx.db
        .insert(trip)
        .values({
          userId: ctx.user.id,
          // Unnamed: replaced by "Voyage à <ville>" once the host has swiped its places.
          title: input?.title ?? DEFAULT_GROUP_TRIP_TITLE,
          // null until the group picks its city: clients show their own placeholder.
          destination: input?.destination ?? null,
          isGroup: true,
          inviteCode,
          inviteCodeExpiresAt,
          status: 'draft',
        })
        .returning();

      await ctx.db.insert(tripMembers).values({
        tripId: newTrip.id,
        userId: ctx.user.id,
        role: 'owner',
      });

      return {
        tripId: newTrip.id,
        inviteCode: newTrip.inviteCode,
        inviteCodeExpiresAt: newTrip.inviteCodeExpiresAt,
        destination: newTrip.destination,
      };
    }),

  regenerateInviteCode: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await findMembership(ctx, input.tripId);

      if (!membership || membership.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul l’organisateur peut régénérer le code.',
        });
      }

      const { inviteCode, inviteCodeExpiresAt } = generateInvitePayload();

      const [updatedTrip] = await ctx.db
        .update(trip)
        .set({ inviteCode, inviteCodeExpiresAt, updatedAt: new Date() })
        .where(eq(trip.id, input.tripId))
        .returning();

      return {
        inviteCode: updatedTrip.inviteCode,
        inviteCodeExpiresAt: updatedTrip.inviteCodeExpiresAt,
      };
    }),

  updateDestination: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        destination: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!(await findMembership(ctx, input.tripId))) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès refusé au voyage.' });
      }

      await ctx.db
        .update(trip)
        .set({ destination: input.destination, updatedAt: new Date() })
        .where(eq(trip.id, input.tripId));

      return { success: true, destination: input.destination };
    }),

  joinGroupTrip: protectedProcedure
    .input(z.object({ inviteCode: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const targetTrip = await ctx.db.query.trip.findFirst({
        // Case-insensitive: codes made before the upper-case alphabet (e.g. "PkB-5ukU") still match.
        where: (t, { and, isNull, sql }) =>
          and(
            sql`upper(${t.inviteCode}) = ${input.inviteCode.trim().toUpperCase()}`,
            isNull(t.deletedAt),
          ),
      });

      if (!targetTrip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Code de voyage introuvable ou expiré.',
        });
      }

      if (
        !targetTrip.inviteCodeExpiresAt ||
        new Date(targetTrip.inviteCodeExpiresAt) < new Date()
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Ce lien d’invitation a expiré (validité 24 h). Demande à l’hôte d’en générer un nouveau.',
        });
      }

      if (!(await findMembership(ctx, targetTrip.id))) {
        await ctx.db.insert(tripMembers).values({
          tripId: targetTrip.id,
          userId: ctx.user.id,
          role: 'member',
        });
      }

      return {
        success: true,
        tripId: targetTrip.id,
      };
    }),

  getMyGroupTrips: protectedProcedure.query(async ({ ctx }) => {
    const trips = await ctx.db
      .select({
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        inviteCode: trip.inviteCode,
        inviteCodeExpiresAt: trip.inviteCodeExpiresAt,
        status: trip.status,
        createdAt: trip.createdAt,
        role: tripMembers.role,
      })
      .from(tripMembers)
      .innerJoin(trip, eq(tripMembers.tripId, trip.id))
      .where(
        and(eq(tripMembers.userId, ctx.user.id), eq(trip.isGroup, true), isNull(trip.deletedAt)),
      )
      .orderBy(desc(trip.createdAt));
    if (trips.length === 0) return [];

    // One query for every trip's members, instead of one per trip.
    const memberRows = await ctx.db
      .select({
        tripId: tripMembers.tripId,
        id: user.id,
        name: user.name,
        role: tripMembers.role,
        joinedAt: tripMembers.joinedAt,
      })
      .from(tripMembers)
      .innerJoin(user, eq(tripMembers.userId, user.id))
      .where(
        inArray(
          tripMembers.tripId,
          trips.map((t) => t.id),
        ),
      );
    const byTrip = summarizeMembers(memberRows);
    return trips.map((t) => ({
      ...t,
      ...(byTrip.get(t.id) ?? { memberCount: 0, members: [], ownerName: null }),
    }));
  }),

  getGroupMembers: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Members' emails are only shown to the other members.
      if (!(await findMembership(ctx, input.tripId))) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès refusé au voyage.' });
      }

      return ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: tripMembers.role,
          joinedAt: tripMembers.joinedAt,
        })
        .from(tripMembers)
        .innerJoin(user, eq(tripMembers.userId, user.id))
        .where(eq(tripMembers.tripId, input.tripId));
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        tripId: z.string().uuid(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const callerMembership = await findMembership(ctx, input.tripId);

      if (!callerMembership || callerMembership.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul le propriétaire du voyage peut supprimer des membres.',
        });
      }

      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'L’organisateur ne peut pas s’auto-exclure.',
        });
      }

      await ctx.db
        .delete(tripMembers)
        .where(and(eq(tripMembers.tripId, input.tripId), eq(tripMembers.userId, input.userId)));

      return { success: true };
    }),

  leaveGroupTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await findMembership(ctx, input.tripId);

      if (!membership) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tu ne fais pas partie de ce voyage.' });
      }

      if (membership.role === 'owner') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'L’organisateur ne peut pas quitter son voyage : supprime-le plutôt.',
        });
      }

      await ctx.db
        .delete(tripMembers)
        .where(and(eq(tripMembers.tripId, input.tripId), eq(tripMembers.userId, ctx.user.id)));

      return { success: true };
    }),

  deleteGroupTrip: protectedProcedure
    .input(z.object({ tripId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const callerMembership = await findMembership(ctx, input.tripId);

      if (!callerMembership || callerMembership.role !== 'owner') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Seul l’organisateur peut supprimer ce voyage de groupe.',
        });
      }

      const days = await ctx.db
        .select({ id: tripDay.id })
        .from(tripDay)
        .where(eq(tripDay.tripId, input.tripId));

      const dayIds = days.map((d) => d.id);
      if (dayIds.length > 0) {
        await ctx.db.delete(activity).where(inArray(activity.tripDayId, dayIds));
        await ctx.db.delete(tripDay).where(eq(tripDay.tripId, input.tripId));
      }

      await ctx.db.delete(tripMembers).where(eq(tripMembers.tripId, input.tripId));
      await ctx.db.delete(trip).where(eq(trip.id, input.tripId));

      return { success: true };
    }),
});

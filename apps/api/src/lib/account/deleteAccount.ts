import { schema } from '@seego/database';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import type { db as appDb } from '../db.js';

const {
  activity,
  generatedDocument,
  importedInspiration,
  paymentTransaction,
  places,
  swipes,
  trip,
  tripDay,
  tripMembers,
  user,
  verification,
} = schema;

type Database = typeof appDb;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

export interface OwnedTrip {
  id: string;
}

export interface OtherMember {
  tripId: string;
  userId: string;
  joinedAt: Date;
}

export interface OwnedTripsPlan {
  /** Group trips other members still use: they get a new owner. */
  transfers: { tripId: string; newOwnerId: string }[];
  /** Trips nobody else is in: deleted with the account. */
  deletions: string[];
}

/**
 * What happens to the trips the deleted user owns: a trip with other members goes to the member
 * who joined first, so they keep it; any other trip is deleted.
 */
export function planOwnedTrips(owned: OwnedTrip[], otherMembers: OtherMember[]): OwnedTripsPlan {
  const plan: OwnedTripsPlan = { transfers: [], deletions: [] };
  for (const { id } of owned) {
    const [heir] = otherMembers
      .filter((member) => member.tripId === id)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
    if (heir) plan.transfers.push({ tripId: id, newOwnerId: heir.userId });
    else plan.deletions.push(id);
  }
  return plan;
}

/** Deletes trips with everything hanging off them (days, activities, documents, payments). */
async function deleteTrips(tx: Transaction, tripIds: string[]) {
  if (tripIds.length === 0) return;
  const days = tx.select({ id: tripDay.id }).from(tripDay).where(inArray(tripDay.tripId, tripIds));
  await tx.delete(activity).where(inArray(activity.tripDayId, days));
  await tx.delete(tripDay).where(inArray(tripDay.tripId, tripIds));
  await tx.delete(generatedDocument).where(inArray(generatedDocument.tripId, tripIds));
  await tx.delete(paymentTransaction).where(inArray(paymentTransaction.tripId, tripIds));
  // trip_members and user_onboarding follow by cascade.
  await tx.delete(trip).where(inArray(trip.id, tripIds));
}

/**
 * Places the user imported from inspirations are private to them: deleted, except those another
 * user's trip or swipe still points to, which are detached instead (they stay inactive, out of
 * the catalogue) so nobody else's itinerary breaks.
 */
async function deleteOwnedPlaces(tx: Transaction, userId: string) {
  const owned = await tx
    .select({ id: places.id })
    .from(places)
    .where(eq(places.ownerUserId, userId));
  const ownedIds = owned.map((place) => place.id);
  if (ownedIds.length === 0) return;

  const usedByActivities = await tx
    .selectDistinct({ id: activity.discoveryContentId })
    .from(activity)
    .where(inArray(activity.discoveryContentId, ownedIds));
  const usedBySwipes = await tx
    .selectDistinct({ id: swipes.discoveryContentId })
    .from(swipes)
    .where(inArray(swipes.discoveryContentId, ownedIds));
  const stillUsed = new Set(
    [...usedByActivities, ...usedBySwipes].map((row) => row.id).filter((id) => id !== null),
  );

  const toDelete = ownedIds.filter((id) => !stillUsed.has(id));
  if (toDelete.length > 0) await tx.delete(places).where(inArray(places.id, toDelete));
  if (stillUsed.size > 0) {
    await tx
      .update(places)
      .set({ ownerUserId: null })
      .where(inArray(places.id, [...stillUsed]));
  }
}

/** Word the user types to confirm; the API checks it so a stray call cannot erase an account. */
export const DELETE_CONFIRMATION = 'SUPPRIMER';

/** Same window as Better Auth's `freshAge`: older sessions must sign in again first. */
const FRESH_SESSION_MS = 24 * 60 * 60 * 1000;

export function isSessionFresh(createdAt: Date, now: number = Date.now()): boolean {
  return now - createdAt.getTime() < FRESH_SESSION_MS;
}

export interface DeleteAccountResult {
  deletedTrips: number;
  transferredTrips: number;
}

/**
 * Erases a user and their data (GDPR right to erasure, App Store guideline 5.1.1(v)), in one
 * transaction: either everything goes or nothing does. Several tables hold a `user_id` without a
 * foreign key, so they are cleaned here explicitly; the rest follows by cascade when the `user`
 * row goes (sessions, linked accounts, trip memberships, onboarding answers).
 */
export async function deleteAccount(db: Database, userId: string): Promise<DeleteAccountResult> {
  return db.transaction(async (tx) => {
    const [account] = await tx.select({ email: user.email }).from(user).where(eq(user.id, userId));
    if (!account) return { deletedTrips: 0, transferredTrips: 0 };

    // Trips the user owns, soft-deleted ones included.
    const owned = await tx.select({ id: trip.id }).from(trip).where(eq(trip.userId, userId));
    const ownedIds = owned.map((row) => row.id);
    const otherMembers =
      ownedIds.length === 0
        ? []
        : await tx
            .select({
              tripId: tripMembers.tripId,
              userId: tripMembers.userId,
              joinedAt: tripMembers.joinedAt,
            })
            .from(tripMembers)
            .where(and(inArray(tripMembers.tripId, ownedIds), ne(tripMembers.userId, userId)))
            .orderBy(asc(tripMembers.joinedAt));
    const plan = planOwnedTrips(owned, otherMembers);

    for (const { tripId, newOwnerId } of plan.transfers) {
      await tx.update(trip).set({ userId: newOwnerId }).where(eq(trip.id, tripId));
      await tx
        .update(tripMembers)
        .set({ role: 'owner' })
        .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, newOwnerId)));
    }
    await deleteTrips(tx, plan.deletions);

    await tx.delete(swipes).where(eq(swipes.userId, userId));
    await tx.delete(importedInspiration).where(eq(importedInspiration.userId, userId));
    await tx.delete(paymentTransaction).where(eq(paymentTransaction.userId, userId));
    await deleteOwnedPlaces(tx, userId);

    // Pending e-mail codes (verification, password reset) are keyed by an identifier ending with
    // the address. Exact suffix match: LIKE would treat `_` in the address as a wildcard.
    await tx
      .delete(verification)
      .where(sql`right(${verification.identifier}, length(${account.email})) = ${account.email}`);

    await tx.delete(user).where(eq(user.id, userId));

    return { deletedTrips: plan.deletions.length, transferredTrips: plan.transfers.length };
  });
}

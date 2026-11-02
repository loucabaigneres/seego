import {
  activity,
  generatedDocument,
  paymentTransaction,
  trip,
  tripDay,
  tripMembers,
} from '@seego/database';
import { eq, inArray } from 'drizzle-orm';
import type { Context } from '../trpc/context.js';

/**
 * Hard-deletes a trip and every row that references it, in one transaction.
 * Payments are kept for accounting and only detached from the trip.
 * `user_onboarding` rows go away through their ON DELETE CASCADE.
 */
export async function deleteTripCascade(db: Context['db'], tripId: string) {
  await db.transaction(async (tx) => {
    const days = await tx
      .select({ id: tripDay.id })
      .from(tripDay)
      .where(eq(tripDay.tripId, tripId));

    const dayIds = days.map((d) => d.id);
    if (dayIds.length > 0) {
      await tx.delete(activity).where(inArray(activity.tripDayId, dayIds));
      await tx.delete(tripDay).where(eq(tripDay.tripId, tripId));
    }

    await tx.delete(generatedDocument).where(eq(generatedDocument.tripId, tripId));
    await tx
      .update(paymentTransaction)
      .set({ tripId: null })
      .where(eq(paymentTransaction.tripId, tripId));
    await tx.delete(tripMembers).where(eq(tripMembers.tripId, tripId));
    await tx.delete(trip).where(eq(trip.id, tripId));
  });
}

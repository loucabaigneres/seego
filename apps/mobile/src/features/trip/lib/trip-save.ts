export type TripSaveState = 'saved' | 'save' | 'sign-in';

/**
 * What the "save to my profile" card offers: nothing to do once the trip is finalized in the
 * user's own account, a save button when signed in, a sign-in otherwise.
 */
export function tripSaveState(
  trip: { status: string | null; userId: string | null },
  userId: string | null | undefined,
): TripSaveState {
  if (!userId) return 'sign-in';
  return trip.status === 'finalized' && trip.userId === userId ? 'saved' : 'save';
}

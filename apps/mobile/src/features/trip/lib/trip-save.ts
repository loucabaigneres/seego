export type TripSaveState = 'hidden' | 'saved' | 'save' | 'sign-in';

/**
 * What the "save to my profile" card offers: nothing on a group trip hosted by someone else
 * (it is the host's), nothing to do once the trip is finalized in the user's own account, a save
 * button when signed in, a sign-in otherwise.
 */
export function tripSaveState(
  trip: { status: string | null; userId: string | null; isGroup?: boolean },
  userId: string | null | undefined,
): TripSaveState {
  if (trip.isGroup && trip.userId !== userId) return 'hidden';
  if (!userId) return 'sign-in';
  return trip.status === 'finalized' && trip.userId === userId ? 'saved' : 'save';
}

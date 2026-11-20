import { STORAGE_KEYS, storage } from '@/lib/storage';
import { queryClient, trpc, trpcClient } from '@/lib/trpc';

/**
 * Moves what was created as a guest on this device (trips, swipes) to the new session's account.
 * One attempt per sign-in: on failure the guest id stays, so the next sign-in tries again.
 */
async function claimGuestTrips() {
  const guestId = await storage.get(STORAGE_KEYS.guestId);
  if (!guestId) return;
  try {
    await trpcClient.user.claimGuestTrips.mutate({ guestId });
    // A fresh guest id is created if the user signs out and starts a trip again.
    await storage.remove(STORAGE_KEYS.guestId);
    queryClient.removeQueries({ queryKey: ['guestId'] });
  } catch {
    // Never blocks the sign-in.
  }
}

/**
 * Keeps React Query in step with the session: every query may answer differently
 * once signed in, and account data must not survive a sign-out.
 * shortcut: Google on Expo web leaves the page and never calls this, so guest trips are
 * not claimed there; add a check on app start if the web build ever ships.
 */
export async function syncQueriesWithSession(event: 'signed-in' | 'signed-out') {
  if (event === 'signed-in') {
    await claimGuestTrips();
    return queryClient.invalidateQueries();
  }
  // Every router that returns account data must be listed here.
  queryClient.removeQueries({ queryKey: trpc.user.pathKey() });
  queryClient.removeQueries({ queryKey: trpc.inspiration.pathKey() });
}

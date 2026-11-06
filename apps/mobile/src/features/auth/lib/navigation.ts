import { router } from 'expo-router';

import { syncQueriesWithSession } from './query-cache';

export function closeAuth() {
  if (router.canGoBack()) router.back();
  else router.replace('/profile');
}

/** Every successful sign-in ends here: account data is brought in, then the auth screen closes. */
export async function finishSignIn() {
  await syncQueriesWithSession('signed-in');
  closeAuth();
}

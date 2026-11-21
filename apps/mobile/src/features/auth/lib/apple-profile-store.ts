import * as SecureStore from 'expo-secure-store';

import type { AppleProfile } from './apple';

/** Same prefix as the auth client's storage (`storagePrefix` in auth-client.ts). */
const KEY = 'seego.apple-pending-profile';

/**
 * Keeps Apple's one-time profile on the device (Keychain) between an authorization
 * and the API's confirmation. Storage failures never block the sign-in.
 */
export const appleProfileStore = {
  async load(): Promise<AppleProfile | null> {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      return raw ? (JSON.parse(raw) as AppleProfile) : null;
    } catch {
      return null;
    }
  },
  async save(profile: AppleProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify(profile));
    } catch {
      // Best effort: without it, only a failed first sign-in loses the name.
    }
  },
  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch {
      // Nothing to do: a stale profile is ignored for another Apple user.
    }
  },
};

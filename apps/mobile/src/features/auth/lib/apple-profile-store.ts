import * as SecureStore from 'expo-secure-store';

import { type AppleProfile, isAppleProfile } from './apple';

/** Same prefix as the auth client's storage (`storagePrefix` in auth-client.ts). */
export const APPLE_PROFILE_KEY = 'seego.apple-pending-profile';

/**
 * Keeps Apple's one-time profile on the device (Keychain) between an authorization
 * and the API's confirmation. Storage failures never block the sign-in.
 */
export const appleProfileStore = {
  async load(): Promise<AppleProfile | null> {
    try {
      const raw = await SecureStore.getItemAsync(APPLE_PROFILE_KEY);
      if (!raw) return null;
      // Corrupted or written in another format: ignore it rather than send bad values to the API.
      const value: unknown = JSON.parse(raw);
      return isAppleProfile(value) ? value : null;
    } catch {
      return null;
    }
  },
  async save(profile: AppleProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync(APPLE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Best effort: without it, only a failed first sign-in loses the name.
    }
  },
  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(APPLE_PROFILE_KEY);
    } catch {
      // Nothing to do: a stale profile is ignored for another Apple user.
    }
  },
};

export type AppleProfileStore = typeof appleProfileStore;

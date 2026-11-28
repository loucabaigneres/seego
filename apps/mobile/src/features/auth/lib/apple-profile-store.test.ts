import * as SecureStore from 'expo-secure-store';

import { APPLE_PROFILE_KEY, appleProfileStore } from './apple-profile-store';

jest.mock('expo-secure-store', () => {
  const items = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => items.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      items.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      items.delete(key);
    }),
  };
});

const profile = {
  user: 'apple-user-1',
  givenName: 'Jane',
  familyName: null,
  email: 'jane@privaterelay.appleid.com',
};

describe('appleProfileStore', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync(APPLE_PROFILE_KEY);
  });

  it('reads back the profile it saved, until cleared', async () => {
    await appleProfileStore.save(profile);
    await expect(appleProfileStore.load()).resolves.toEqual(profile);

    await appleProfileStore.clear();
    await expect(appleProfileStore.load()).resolves.toBeNull();
  });

  it('ignores a value that is not valid JSON', async () => {
    await SecureStore.setItemAsync(APPLE_PROFILE_KEY, '{"user": "apple-us');
    await expect(appleProfileStore.load()).resolves.toBeNull();
  });

  it('ignores JSON of another shape, such as an older format', async () => {
    await SecureStore.setItemAsync(APPLE_PROFILE_KEY, JSON.stringify({ name: 'Jane' }));
    await expect(appleProfileStore.load()).resolves.toBeNull();
  });

  it('never throws when the Keychain is unavailable', async () => {
    jest.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('Keychain locked'));
    jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('Keychain locked'));
    jest.mocked(SecureStore.deleteItemAsync).mockRejectedValueOnce(new Error('Keychain locked'));

    await expect(appleProfileStore.load()).resolves.toBeNull();
    await expect(appleProfileStore.save(profile)).resolves.toBeUndefined();
    await expect(appleProfileStore.clear()).resolves.toBeUndefined();
  });
});

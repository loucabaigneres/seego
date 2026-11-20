import { router, usePathname } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const IMPORT_PATH = '/inspiration/import';

/**
 * Opens the import screen when another app shares to Seego on Android (no deep link there).
 * On iOS the share extension opens a deep link instead, routed by `app/+native-intent.ts`.
 * Renders nothing; must sit inside `ShareIntentProvider`.
 */
export function ShareIntentRedirect() {
  const { hasShareIntent } = useShareIntentContext();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === 'android' && hasShareIntent && pathname !== IMPORT_PATH) {
      router.push(IMPORT_PATH);
    }
  }, [hasShareIntent, pathname]);

  return null;
}

import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Text } from '@/ui';

/** Text link under an empty trip list: opens the "join with a code" screen. */
export function JoinCodeLink() {
  return (
    <Pressable
      role="button"
      onPress={() => router.push('/join')}
      className="py-2.5 active:opacity-80"
    >
      <Text variant="caption" tone="brand" className="font-sans-semibold">
        Un ami t’a invité ? Entre son code
      </Text>
    </Pressable>
  );
}

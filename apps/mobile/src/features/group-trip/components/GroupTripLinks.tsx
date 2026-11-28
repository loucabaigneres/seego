import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Text } from '@/ui';
import { UsersThreeIcon } from '@/ui/icons';

/** Under an empty trip list: open the group trip creation screen, or the "join with a code" screen. */
export function GroupTripLinks() {
  return (
    <View className="items-center gap-2.5 self-stretch">
      <Button
        label="Créer un voyage de groupe"
        variant="outline"
        icon={UsersThreeIcon}
        onPress={() => router.push('/group/create')}
        className="self-stretch"
      />
      <Pressable role="button" onPress={() => router.push('/join')} className="py-2.5 active:opacity-80">
        <Text variant="caption" tone="brand" className="font-sans-semibold">
          Un ami t’a invité ? Entre son code
        </Text>
      </Pressable>
    </View>
  );
}

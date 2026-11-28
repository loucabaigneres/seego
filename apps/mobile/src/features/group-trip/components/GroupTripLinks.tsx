import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Notice, Text } from '@/ui';
import { UsersThreeIcon } from '@/ui/icons';

import { useCreateGroupTrip } from '../hooks/useCreateGroupTrip';
import { JoinCodeSheet } from './JoinCodeSheet';

/** Under an empty trip list: start a group trip, or open the "join with a code" sheet. */
export function GroupTripLinks() {
  const [isOpen, setIsOpen] = useState(false);
  const { create, isCreating, failed } = useCreateGroupTrip();

  return (
    <View className="items-center gap-2.5 self-stretch">
      <Button
        label="Créer un voyage de groupe"
        variant="outline"
        icon={UsersThreeIcon}
        loading={isCreating}
        onPress={create}
        className="self-stretch"
      />
      {failed && <Notice message="Impossible de créer le voyage de groupe. Réessaie." />}
      <Pressable role="button" onPress={() => setIsOpen(true)} className="py-2.5 active:opacity-80">
        <Text variant="caption" tone="brand" className="font-sans-semibold">
          Un ami t’a invité ? Entre son code
        </Text>
      </Pressable>
      <JoinCodeSheet visible={isOpen} onClose={() => setIsOpen(false)} />
    </View>
  );
}

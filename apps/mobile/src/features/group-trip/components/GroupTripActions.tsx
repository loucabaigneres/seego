import { useState } from 'react';
import { View } from 'react-native';

import { Button, Notice } from '@/ui';
import { PlusIcon, UsersThreeIcon } from '@/ui/icons';

import { useCreateGroupTrip } from '../hooks/useCreateGroupTrip';
import { JoinCodeSheet } from './JoinCodeSheet';

/** Trips tab: join a friend's trip with a code, or start a new group trip. */
export function GroupTripActions() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const { create, isCreating, failed } = useCreateGroupTrip();

  return (
    <View className="gap-2">
      <View className="flex-row gap-3">
        <Button
          label="Rejoindre"
          variant="outline"
          size="sm"
          className="flex-1"
          icon={UsersThreeIcon}
          onPress={() => setIsJoinOpen(true)}
        />
        <Button
          label="Voyage de groupe"
          size="sm"
          className="flex-1"
          icon={PlusIcon}
          loading={isCreating}
          onPress={create}
        />
      </View>
      {failed && <Notice message="Impossible de créer le voyage de groupe. Réessaie." />}
      <JoinCodeSheet visible={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </View>
  );
}

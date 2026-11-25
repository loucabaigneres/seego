import { useState } from 'react';
import { View } from 'react-native';

import { firstName } from '@/domain/group';
import { Avatar, Button, Notice, Sheet, Text } from '@/ui';

import type { useGroupTrip } from '../hooks/useGroupTrip';

type Removal = ReturnType<typeof useGroupTrip>['members']['removal'];

/** "Retirer Tom du groupe ?": the organizer confirms before a member loses access. */
export function RemoveMemberSheet({ removal, tripTitle }: { removal: Removal; tripTitle: string }) {
  // Keeps the member on screen while the closing animation plays.
  const [shown, setShown] = useState(removal.pending);
  if (removal.pending && removal.pending !== shown) setShown(removal.pending);
  if (!shown) return null;

  const name = shown.member.name || shown.member.email;
  const first = firstName(name);
  return (
    <Sheet visible={removal.pending !== null} onClose={removal.close}>
      <View role="alert" className="items-center gap-4">
        <Avatar name={name} index={shown.index} size="xl" className="mt-2.5" />
        <Text variant="section" role="heading" className="text-center text-[30px] leading-[34px]">
          Retirer {first} du groupe ?
        </Text>
        <Text tone="muted" className="max-w-[310px] text-center">
          {first} n’aura plus accès à « {tripTitle} ». Tu pourras l’inviter à nouveau plus tard
          avec un code.
        </Text>
        {removal.failed && (
          <Notice message={`Impossible de retirer ${first} pour le moment. Réessaie.`} />
        )}
        <View className="gap-2.5 self-stretch pt-1.5">
          <Button
            label={`Retirer ${first}`}
            loading={removal.isRemoving}
            onPress={removal.confirm}
          />
          <Button label="Annuler" variant="outline" onPress={removal.close} />
        </View>
      </View>
    </Sheet>
  );
}

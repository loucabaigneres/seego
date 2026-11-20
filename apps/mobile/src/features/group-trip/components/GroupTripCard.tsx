import { View } from 'react-native';

import { Badge, Button, Card, Notice, Text } from '@/ui';
import { ShareNetworkIcon, UsersThreeIcon } from '@/ui/icons';

import type { useGroupTrip } from '../hooks/useGroupTrip';

/** Trip page: the offer to travel together, or the group's invite once it is one. */
export function GroupTripCard({ group }: { group: ReturnType<typeof useGroupTrip> }) {
  if (group.state === 'hidden') return null;

  if (group.state !== 'active') {
    const isGuest = group.state === 'sign-in';
    return (
      <Card className="gap-3">
        <View className="gap-1">
          <Text variant="label">Partir à plusieurs ?</Text>
          <Text variant="caption">
            {isGuest
              ? 'Connecte-toi pour voyager en groupe et inviter tes amis.'
              : 'Transforme ce voyage en voyage de groupe et invite tes amis.'}
          </Text>
        </View>
        <Button
          label={isGuest ? 'Se connecter' : 'Inviter des amis'}
          variant="outline"
          size="sm"
          icon={isGuest ? undefined : UsersThreeIcon}
          loading={group.convert.isPending}
          onPress={isGuest ? group.signIn : group.convert.run}
        />
        {group.convert.failed && (
          <Notice message="Impossible de créer le voyage de groupe pour le moment. Réessaie." />
        )}
      </Card>
    );
  }

  const { expired, hoursLeft } = group.status;
  return (
    <Card className="gap-4">
      <View className="gap-2">
        <Badge label="Voyage de groupe" tone="success" />
        <Text variant="overline">Code d’invitation</Text>
        <Text variant="section" className="tracking-[3px]" selectable>
          {group.code ?? '—'}
        </Text>
        <Text variant="caption" tone={expired ? 'brand' : 'success'}>
          {expired
            ? group.isHost
              ? 'Code expiré : génère-en un nouveau.'
              : 'Code expiré : demande un nouveau code à l’hôte.'
            : `Valide encore ${hoursLeft} h`}
        </Text>
      </View>
      <View className="flex-row gap-3">
        {expired && group.isHost ? (
          <Button
            label="Nouveau code"
            size="sm"
            className="flex-1"
            loading={group.regenerate.isPending}
            onPress={group.regenerate.run}
          />
        ) : (
          <Button
            label="Partager"
            size="sm"
            className="flex-1"
            icon={ShareNetworkIcon}
            disabled={expired}
            onPress={group.share}
          />
        )}
        <Button
          label="Membres"
          variant="outline"
          size="sm"
          className="flex-1"
          icon={UsersThreeIcon}
          onPress={group.sheet.open}
        />
      </View>
    </Card>
  );
}

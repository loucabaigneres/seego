import { Pressable, View } from 'react-native';

import { firstName, membersLabel } from '@/domain/group';
import { AvatarStack, Button, Card, Notice, Skeleton, Text } from '@/ui';
import { PlusIcon, UsersThreeIcon } from '@/ui/icons';

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

  const { list } = group.members;
  const owner = list.find((m) => m.role === 'owner');
  const caption = group.isHost
    ? 'Tu organises ce voyage'
    : owner
      ? `Organisé par ${firstName(owner.name)}`
      : 'Voyage de groupe';

  return (
    <View className="flex-row items-center gap-3.5 rounded-card bg-surface px-4 py-3.5">
      <Pressable
        role="button"
        aria-label={`Participants : ${membersLabel(list, group.meId)}. ${caption}`}
        onPress={group.openParticipants}
        className="flex-1 flex-row items-center gap-3.5 active:opacity-80"
      >
        {group.members.isLoading ? (
          <Skeleton className="h-[34px] w-20 rounded-full" />
        ) : (
          <AvatarStack
            names={list.slice(0, 3).map((m) => m.name || m.email)}
            extra={Math.max(list.length - 3, 0)}
            size="md"
            ringClassName="border-surface"
          />
        )}
        <View className="flex-1">
          <Text variant="label" className="text-[15px] leading-5" numberOfLines={1}>
            {group.members.failed ? 'Participants' : membersLabel(list, group.meId) || '…'}
          </Text>
          <Text variant="caption">{caption}</Text>
        </View>
      </Pressable>
      <Button
        label="Inviter"
        variant="outline"
        size="sm"
        icon={PlusIcon}
        onPress={group.openParticipants}
      />
    </View>
  );
}

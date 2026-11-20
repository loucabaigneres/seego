import { ScrollView, View } from 'react-native';

import { pluralize } from '@/domain/date';
import { Badge, Button, cn, ErrorState, IconButton, Notice, Sheet, Skeleton, Text, TextField } from '@/ui';
import { XIcon } from '@/ui/icons';

import type { GroupMember, useGroupTrip } from '../hooks/useGroupTrip';

/** "Voyage de groupe" sheet: destination, members, new code, leaving or deleting the group. */
export function GroupTripSheet({ group }: { group: ReturnType<typeof useGroupTrip> }) {
  const { sheet, members, destination } = group;

  return (
    <Sheet visible={sheet.isOpen} onClose={sheet.close} title="Voyage de groupe">
      <ScrollView contentContainerClassName="gap-6 pb-2" keyboardShouldPersistTaps="handled">
        {sheet.error && <Notice message={sheet.error} />}

        <View className="gap-3">
          <TextField
            label="Destination"
            value={destination.value}
            onChangeText={destination.setValue}
            editable={!destination.isSaving}
            returnKeyType="done"
            onSubmitEditing={() => destination.canSave && destination.save()}
          />
          <Text variant="caption">
            L’itinéraire ne change pas : il reste celui déjà planifié.
          </Text>
          {destination.canSave && (
            <Button
              label="Enregistrer la destination"
              size="sm"
              loading={destination.isSaving}
              onPress={destination.save}
            />
          )}
        </View>

        <View className="gap-3">
          <Text variant="overline">
            {members.list.length > 0
              ? `Participants · ${pluralize(members.list.length, 'membre')}`
              : 'Participants'}
          </Text>
          {members.isLoading ? (
            <View className="gap-2" aria-busy>
              <Skeleton className="h-12 rounded-card" />
              <Skeleton className="h-12 rounded-card" />
            </View>
          ) : members.failed ? (
            <ErrorState
              className="flex-none"
              title="Participants indisponibles"
              message="Impossible de charger les membres du groupe."
              onRetry={members.retry}
            />
          ) : (
            members.list.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                canRemove={group.isHost && member.role !== 'owner'}
                isRemoving={members.removingId === member.id}
                onRemove={() => members.remove(member)}
              />
            ))
          )}
        </View>

        <View className="gap-1">
          {group.isHost && (
            <Button
              label="Générer un nouveau code"
              variant="text"
              size="sm"
              loading={group.regenerate.isPending}
              onPress={group.regenerate.run}
            />
          )}
          {group.isHost ? (
            <Button
              label="Supprimer le voyage de groupe"
              variant="text"
              size="sm"
              loading={group.deleteTrip.isPending}
              onPress={group.deleteTrip.run}
            />
          ) : (
            <Button
              label="Quitter ce voyage"
              variant="text"
              size="sm"
              loading={group.leave.isPending}
              onPress={group.leave.run}
            />
          )}
        </View>
      </ScrollView>
    </Sheet>
  );
}

function MemberRow({
  member,
  canRemove,
  isRemoving,
  onRemove,
}: {
  member: GroupMember;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  const name = member.name || member.email;
  return (
    <View className="flex-row items-center gap-3 rounded-card bg-surface px-4 py-2.5">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-ink">
        <Text variant="label" tone="inverse" className="uppercase">
          {name[0]}
        </Text>
      </View>
      <Text className="flex-1" numberOfLines={1}>
        {name}
      </Text>
      {member.role === 'owner' ? (
        <Badge label="Hôte" tone="accent" />
      ) : canRemove ? (
        <IconButton
          label={`Retirer ${name}`}
          icon={XIcon}
          onPress={onRemove}
          disabled={isRemoving}
          className={cn('-my-2', isRemoving && 'opacity-50')}
        />
      ) : null}
    </View>
  );
}

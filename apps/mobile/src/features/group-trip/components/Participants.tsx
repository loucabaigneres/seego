import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { formatDate } from '@/domain/date';
import { firstName } from '@/domain/group';
import { tripDisplayTitle } from '@/domain/trip-summary';
import { WEB_URL } from '@/env';
import { colors } from '@seego/ui';
import {
  Avatar,
  Button,
  cn,
  ErrorState,
  IconButton,
  Notice,
  Screen,
  Skeleton,
  Tag,
  Text,
  TextField,
} from '@/ui';
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  CheckIcon,
  ClipboardTextIcon,
  DotsThreeVerticalIcon,
  InfoIcon,
  LinkSimpleIcon,
  MapPinIcon,
  ShareNetworkIcon,
  SignOutIcon,
  TrashIcon,
} from '@/ui/icons';

import type { GroupMember, useGroupTrip } from '../hooks/useGroupTrip';
import { inviteUrl } from '../lib/invite';
import { RemoveMemberSheet } from './RemoveMemberSheet';

type Group = ReturnType<typeof useGroupTrip>;

/** Organizer: the code in large, its link, share it or make a new one. */
function InviteBlock({ group }: { group: Group }) {
  const { expired, hoursLeft } = group.status;
  const link = group.code ? inviteUrl(WEB_URL, group.code).replace(/^https?:\/\//, '') : '';

  return (
    <View aria-label="Inviter des amis" className="gap-3 rounded-card bg-brand p-[18px]">
      <View className="flex-row items-baseline justify-between">
        <Text variant="overline" tone="accent">
          Inviter des amis
        </Text>
        <Text variant="caption" tone="inverse" className="text-[12px] opacity-70">
          {expired ? 'Code expiré' : `Valable encore ${hoursLeft} h`}
        </Text>
      </View>
      <View className="flex-row items-center justify-between gap-2.5">
        <Text
          variant="title"
          tone="inverse"
          selectable
          className={cn('text-[34px] leading-[38px] tracking-[2px]', expired && 'opacity-50')}
        >
          {group.code ?? '—'}
        </Text>
        {!expired && (
          <IconButton
            variant="scrim"
            label={group.copy.isCopied ? 'Code copié' : 'Copier le code'}
            icon={group.copy.isCopied ? CheckIcon : ClipboardTextIcon}
            onPress={group.copy.run}
          />
        )}
      </View>
      {!expired && link !== '' && (
        <View className="h-10 flex-row items-center gap-2 rounded-xl bg-ink-inverse/10 px-3">
          <LinkSimpleIcon size={20} color={colors.accent} />
          <Text variant="caption" tone="inverse" numberOfLines={1} className="flex-1 opacity-80">
            {link}
          </Text>
        </View>
      )}
      <View className="flex-row gap-2">
        {!expired && (
          <Button
            label="Partager"
            variant="onBrand"
            size="sm"
            icon={ShareNetworkIcon}
            onPress={group.share}
            className="flex-1"
          />
        )}
        <Button
          label="Nouveau code"
          variant="onBrandSoft"
          size="sm"
          icon={ArrowCounterClockwiseIcon}
          loading={group.regenerate.isPending}
          onPress={group.regenerate.run}
          className="flex-1"
        />
      </View>
    </View>
  );
}

/** Member: a friend wants to come, share the organizer's code. */
function ShareCodeCard({ group, ownerName }: { group: Group; ownerName: string }) {
  const { expired } = group.status;
  return (
    <View className="flex-row items-center gap-3.5 rounded-card bg-surface p-4">
      <View className="flex-1 gap-0.5">
        <Text variant="label" className="text-[15px] leading-5">
          Un ami veut venir ?
        </Text>
        <Text variant="caption">
          {expired ? (
            `Le code a expiré : demande-en un nouveau à ${ownerName}.`
          ) : (
            <>
              Partage le code{' '}
              <Text className="font-serif text-[16px] tracking-[1px] text-brand" selectable>
                {group.code}
              </Text>
            </>
          )}
        </Text>
      </View>
      {!expired && (
        <Button label="Partager" size="sm" icon={ShareNetworkIcon} onPress={group.share} />
      )}
    </View>
  );
}

function MemberRow({
  member,
  index,
  isMe,
  canRemove,
  isRemoving,
  onRemove,
}: {
  member: GroupMember;
  index: number;
  isMe: boolean;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  const name = member.name || member.email;
  const date = formatDate(member.joinedAt);
  const isOwner = member.role === 'owner';
  const since = date && (isOwner ? `A créé le voyage le ${date}` : `A rejoint le ${date}`);

  return (
    <View className="min-h-[62px] flex-row items-center gap-3 border-b border-line py-2.5">
      <Avatar name={name} index={index} />
      <View className="flex-1">
        <Text variant="label" className="text-[15px] leading-5" numberOfLines={1}>
          {name}
          {isMe && <Text variant="caption"> (toi)</Text>}
        </Text>
        {since !== '' && <Text variant="caption">{since}</Text>}
      </View>
      {isOwner ? (
        <Tag
          label="Organisateur"
          capitalize={false}
          className="bg-accent"
          textClassName="font-sans-semibold text-brand"
        />
      ) : canRemove ? (
        <IconButton
          label={`Options pour ${name}`}
          icon={DotsThreeVerticalIcon}
          onPress={onRemove}
          disabled={isRemoving}
          className={cn(isRemoving && 'opacity-50')}
        />
      ) : (
        <Tag label="Membre" capitalize={false} textClassName="font-sans-semibold" />
      )}
    </View>
  );
}

/** Any member can change the city; the itinerary already planned stays as it is. */
function DestinationField({ group }: { group: Group }) {
  const { destination } = group;
  return (
    <View className="gap-2">
      <TextField
        label="Destination"
        icon={MapPinIcon}
        value={destination.value}
        onChangeText={destination.setValue}
        editable={!destination.isSaving}
        returnKeyType="done"
        onSubmitEditing={() => destination.canSave && destination.save()}
      />
      {destination.canSave ? (
        <Button
          label="Enregistrer la destination"
          size="sm"
          loading={destination.isSaving}
          onPress={destination.save}
        />
      ) : (
        <Text variant="caption">L’itinéraire déjà planifié ne change pas.</Text>
      )}
    </View>
  );
}

/** Who is in a group trip; the organizer invites and manages, a member shares and can leave. */
export function Participants({
  trip,
  group,
}: {
  trip: { title: string | null; destination: string | null };
  group: Group;
}) {
  const { members } = group;
  const owner = members.list.find((m) => m.role === 'owner');
  const ownerName = owner ? firstName(owner.name || owner.email) : 'l’organisateur';
  // Organizer first, then by arrival.
  const sorted = [...members.list].sort(
    (a, b) =>
      Number(b.role === 'owner') - Number(a.role === 'owner') ||
      new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentClassName="gap-[18px]">
        <IconButton
          label="Retour"
          icon={ArrowLeftIcon}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/trips'))}
          className="-ml-2.5"
        />
        <View className="gap-1">
          <Text variant="overline" tone="brand" numberOfLines={1}>
            {tripDisplayTitle(trip)}
          </Text>
          <Text variant="title" role="heading" className="text-[36px] leading-[38px]">
            Participants
          </Text>
        </View>

        {group.error && <Notice message={group.error} />}
        {group.isHost ? (
          <InviteBlock group={group} />
        ) : (
          <ShareCodeCard group={group} ownerName={ownerName} />
        )}

        <View>
          <Text variant="overline" className="pb-0.5">
            {members.list.length > 1 ? `${members.list.length} participants` : 'Participants'}
          </Text>
          {members.isLoading ? (
            <View className="gap-2 pt-2" aria-busy>
              <Skeleton className="h-[52px] rounded-field" />
              <Skeleton className="h-[52px] rounded-field" />
            </View>
          ) : members.failed ? (
            <ErrorState
              className="flex-none pt-4"
              title="Participants indisponibles"
              message="Impossible de charger les membres du groupe. Vérifie ta connexion, puis on réessaie."
              onRetry={members.retry}
            />
          ) : (
            sorted.map((member, index) => (
              <MemberRow
                key={member.id}
                member={member}
                index={index}
                isMe={member.id === group.meId}
                canRemove={group.isHost && member.role !== 'owner'}
                isRemoving={members.removingId === member.id}
                onRemove={() => members.removal.open(member, index)}
              />
            ))
          )}
          {group.isHost && !members.isLoading && members.list.length === 1 && (
            <Text variant="caption" className="pt-3">
              Personne n’a encore rejoint : partage le code à tes amis.
            </Text>
          )}
        </View>

        <DestinationField group={group} />

        {!group.isHost && (
          <View className="flex-row gap-2">
            <InfoIcon size={20} color={colors.brand} />
            <Text variant="caption" className="flex-1">
              Seul {ownerName} peut retirer des participants ou supprimer le voyage.
            </Text>
          </View>
        )}

        <View className="mt-auto pt-2">
          {group.isHost ? (
            <Button
              label="Supprimer le voyage de groupe"
              variant="text"
              icon={TrashIcon}
              loading={group.deleteTrip.isPending}
              onPress={group.deleteTrip.run}
            />
          ) : (
            <Button
              label="Quitter le voyage"
              variant="text"
              icon={SignOutIcon}
              loading={group.leave.isPending}
              onPress={group.leave.run}
            />
          )}
        </View>
      </Screen>
      <RemoveMemberSheet removal={members.removal} tripTitle={tripDisplayTitle(trip)} />
    </KeyboardAvoidingView>
  );
}

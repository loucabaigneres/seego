import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatDate } from '@/domain/date';
import { groupRowCaption, isDestinationPending } from '@/domain/group';
import { tripDisplayTitle, tripMonogram, tripStatusMeta } from '@/domain/trip-summary';
import { colors } from '@seego/ui';
import { AvatarStack, Badge, cn, IconButton, Tag, Text } from '@/ui';
import { CompassIcon, SuitcaseRollingIcon, TrashIcon } from '@/ui/icons';

import type { TripListItem } from '../lib/merge-trips';

export interface TripCardProps {
  trip: TripListItem;
  onDelete: () => void;
  isDeleting: boolean;
}

/** Tile colours, cycled down the list like a stack of postcards. */
const TILE_TONES = [
  { tile: 'bg-accent', text: 'text-brand', icon: colors.brand },
  { tile: 'bg-success', text: 'text-ink-inverse', icon: colors.ink.inverse },
  { tile: 'bg-surface', text: 'text-brand', icon: colors.brand },
] as const;

function openTrip(tripId: string) {
  router.push({ pathname: '/trip/[tripId]', params: { tripId } });
}

/** "Créé le 3 nov. 2026" */
function tripDetails(trip: TripListItem): string {
  const createdAt = formatDate(trip.createdAt);
  return createdAt ? `Créé le ${createdAt}` : '';
}

function DeleteButton({
  trip,
  title,
  onDelete,
  isDeleting,
  variant,
}: TripCardProps & { title: string; variant: 'scrim' | 'ghost' }) {
  // A group trip is deleted or left from its page: user.deleteTrip refuses it.
  if (trip.groupRole) return null;
  return (
    <IconButton
      variant={variant}
      label={`Supprimer ${title}`}
      icon={TrashIcon}
      onPress={onDelete}
      disabled={isDeleting}
      className={cn(isDeleting && 'opacity-50')}
    />
  );
}

/** The latest trip, shown large at the top of the list. */
export function TripFeatureCard(props: TripCardProps) {
  const { trip } = props;
  const status = tripStatusMeta(trip.status);
  const title = tripDisplayTitle(trip);

  return (
    <View className="h-[180px] overflow-hidden rounded-card bg-brand">
      <Pressable
        role="link"
        aria-label={`${title}, ${status.label}`}
        onPress={() => openTrip(trip.id)}
        className="flex-1 justify-between p-4 active:opacity-80"
      >
        <Badge label={status.label} tone={status.tone === 'success' ? 'success' : 'accent'} />
        <View className="gap-1">
          <Text variant="title" tone="inverse" numberOfLines={2} className="text-[34px] leading-9">
            {title}
          </Text>
          <Text variant="caption" tone="accent" numberOfLines={1}>
            {tripDetails(trip)}
          </Text>
        </View>
      </Pressable>
      <View className="absolute right-2.5 top-2.5">
        <DeleteButton {...props} title={title} variant="scrim" />
      </View>
    </View>
  );
}

/** A trip under the featured one: postcard tile, title and status. */
export function TripRow({ index, ...props }: TripCardProps & { index: number }) {
  const { trip } = props;
  const status = tripStatusMeta(trip.status);
  const title = tripDisplayTitle(trip);
  const monogram = tripMonogram(trip);
  const tone = TILE_TONES[index % TILE_TONES.length];

  return (
    <View className="flex-row items-center gap-3.5 border-b border-line py-3.5">
      <Pressable
        role="link"
        aria-label={`${title}, ${status.label}`}
        onPress={() => openTrip(trip.id)}
        className="flex-1 flex-row items-center gap-3.5 active:opacity-80"
      >
        <View
          aria-hidden
          className={cn('size-[68px] items-center justify-center rounded-field', tone.tile)}
        >
          {monogram ? (
            <Text variant="section" className={cn('text-[28px] leading-7', tone.text)}>
              {monogram}
            </Text>
          ) : (
            <SuitcaseRollingIcon size={28} color={tone.icon} />
          )}
        </View>
        <View className="flex-1 gap-1">
          <Text variant="label" numberOfLines={2}>
            {title}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <Badge label={status.label} tone={status.tone} />
            <Text variant="caption">{tripDetails(trip)}</Text>
          </View>
        </View>
      </Pressable>
      <DeleteButton {...props} title={title} variant="ghost" />
    </View>
  );
}

/** A group trip in the "Groupés" tab: tile, title, who is in it and the user's role. */
export function GroupTripRow({ trip, index }: { trip: TripListItem; index: number }) {
  const title = tripDisplayTitle(trip);
  const pending = isDestinationPending(trip.destination);
  const monogram = tripMonogram(trip);
  const tone = TILE_TONES[index % TILE_TONES.length];
  const group = trip.group ?? { memberCount: 1, members: [], ownerName: null };
  const isOwner = trip.groupRole === 'owner';
  const caption = pending
    ? 'Destination à définir'
    : groupRowCaption(isOwner ? 'owner' : 'member', group.memberCount, group.ownerName);
  const roleLabel = isOwner ? 'Organisateur' : 'Membre';

  return (
    <Pressable
      role="link"
      aria-label={`${title}, ${caption}, ${roleLabel}`}
      onPress={() => openTrip(trip.id)}
      className="flex-row items-center gap-3.5 border-b border-line py-3 active:opacity-80"
    >
      <View
        aria-hidden
        className={cn(
          'size-16 items-center justify-center overflow-hidden rounded-[14px]',
          pending ? 'bg-surface' : tone.tile,
        )}
      >
        {pending ? (
          <CompassIcon size={24} color={colors.brand} />
        ) : trip.coverImage ? (
          <Image source={trip.coverImage} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text variant="section" className={cn('text-[26px] leading-7', tone.text)}>
            {monogram}
          </Text>
        )}
      </View>
      <View className="flex-1 gap-1">
        <Text variant="label" numberOfLines={2}>
          {title}
        </Text>
        <View className="flex-row items-center gap-2">
          {!pending && group.members.length > 0 && (
            <AvatarStack
              names={group.members.map((m) => m.name)}
              extra={group.memberCount - group.members.length}
            />
          )}
          <Text
            variant="caption"
            numberOfLines={1}
            className={cn('flex-1', pending && 'font-sans-semibold text-brand')}
          >
            {caption}
          </Text>
        </View>
      </View>
      <Tag
        label={roleLabel}
        capitalize={false}
        className={cn(isOwner && 'bg-accent')}
        textClassName={cn('font-sans-semibold', isOwner ? 'text-brand' : 'text-ink')}
      />
    </Pressable>
  );
}

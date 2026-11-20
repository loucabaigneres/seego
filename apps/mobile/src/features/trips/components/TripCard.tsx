import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { formatDate } from '@/domain/date';
import { colors } from '@seego/ui';
import { Badge, cn, IconButton, Text } from '@/ui';
import { CaretRightIcon, TrashIcon } from '@/ui/icons';

import { tripDisplayTitle, tripStatusMeta } from '@/domain/trip-summary';

import type { TripListItem } from '../lib/merge-trips';

export interface TripCardProps {
  trip: TripListItem;
  onDelete: () => void;
  isDeleting: boolean;
}

export function TripCard({ trip, onDelete, isDeleting }: TripCardProps) {
  const status = tripStatusMeta(trip.status);
  const title = tripDisplayTitle(trip);
  const createdAt = formatDate(trip.createdAt);
  const groupLabel = trip.groupRole && `Groupe · ${trip.groupRole === 'owner' ? 'Hôte' : 'Membre'}`;

  return (
    <Pressable
      role="link"
      aria-label={`${title}, ${status.label}`}
      onPress={() => router.push({ pathname: '/trip/[tripId]', params: { tripId: trip.id } })}
      className="flex-row items-center gap-3 rounded-card border border-brand/15 bg-surface p-5 active:opacity-80"
    >
      <View className="flex-1 gap-2">
        <Text variant="label" numberOfLines={2}>
          {title}
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          <Badge label={status.label} tone={status.tone} />
          {groupLabel && <Badge label={groupLabel} tone="accent" />}
          {createdAt && <Text variant="caption">{createdAt}</Text>}
        </View>
      </View>
      {/* A group trip is deleted or left from its page: user.deleteTrip refuses it. */}
      {!trip.groupRole && (
        <IconButton
          label={`Supprimer ${title}`}
          icon={TrashIcon}
          onPress={onDelete}
          disabled={isDeleting}
          className={cn('-my-2', isDeleting && 'opacity-50')}
        />
      )}
      <CaretRightIcon size={20} color={colors.ink.muted} />
    </Pressable>
  );
}

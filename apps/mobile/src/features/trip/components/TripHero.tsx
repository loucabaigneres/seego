import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { tripDisplayTitle, tripFacts, tripStatusMeta } from '@/domain/trip-summary';
import type { RouterOutputs } from '@/lib/trpc';
import { colors } from '@seego/ui';
import { Badge, IconButton, PhotoScrim, Tag, Text } from '@/ui';
import {
  ArrowLeftIcon,
  HouseIcon,
  MapPinIcon,
  MapTrifoldIcon,
  PencilSimpleIcon,
} from '@/ui/icons';

function leaveTrip() {
  // Opened from a link, the trip has nothing to go back to.
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export interface TripHeroProps {
  trip: RouterOutputs['discovery']['getTrip']['trip'];
  coverImage: string | null;
  plannedCount: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Shown only to the trip's owner. */
  onRename?: () => void;
}

export function TripHero({ trip, coverImage, plannedCount, onLayout, onRename }: TripHeroProps) {
  const status = tripStatusMeta(trip.status);
  const facts = tripFacts(trip, plannedCount);

  return (
    <View onLayout={onLayout} className="h-72 overflow-hidden rounded-card bg-ink">
      {coverImage ? (
        <Image source={coverImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View className="absolute inset-0 items-center justify-center">
          <MapTrifoldIcon size={64} color={colors.ink.muted} />
        </View>
      )}
      <PhotoScrim edge="top" className="h-28" />
      <PhotoScrim edge="bottom" className="h-3/5" />

      <View className="absolute inset-x-0 top-0 flex-row items-center justify-between p-3">
        <View className="flex-row gap-2">
          <IconButton variant="scrim" label="Retour" icon={ArrowLeftIcon} onPress={leaveTrip} />
          {/* At the end of the creation flow, "Retour" walks back through the form and the deck. */}
          <IconButton
            variant="scrim"
            label="Accueil"
            icon={HouseIcon}
            onPress={() => router.dismissTo('/')}
          />
        </View>
        <View className="flex-row items-center gap-2">
          <Badge label={status.label} tone={status.tone} />
          {onRename && (
            <IconButton
              variant="scrim"
              label="Renommer le voyage"
              icon={PencilSimpleIcon}
              onPress={onRename}
            />
          )}
        </View>
      </View>

      <View className="absolute inset-x-0 bottom-0 gap-2 p-6">
        {trip.destination && (
          <View className="flex-row items-center gap-1.5">
            <MapPinIcon size={16} weight="fill" color={colors.accent} />
            <Text variant="caption" tone="inverse" numberOfLines={1}>
              {trip.destination}
            </Text>
          </View>
        )}
        <Text variant="title" tone="inverse" role="heading" numberOfLines={2}>
          {tripDisplayTitle(trip)}
        </Text>
        {facts.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {facts.map((fact) => (
              <Tag key={fact} label={fact} tone="photo" capitalize={false} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

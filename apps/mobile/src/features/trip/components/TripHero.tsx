import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { tripDisplayTitle, tripFacts, tripStatusMeta } from '@/domain/trip-summary';
import type { RouterOutputs } from '@/lib/trpc';
import { colors } from '@seego/ui';
import { Badge, IconButton, PhotoScrim, Tag, Text } from '@/ui';
import {
  ArrowLeftIcon,
  FilePdfIcon,
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
  /** Once the itinerary exists. */
  pdf?: { onExport: () => void; isExporting: boolean };
}

export function TripHero({
  trip,
  coverImage,
  plannedCount,
  onLayout,
  onRename,
  pdf,
}: TripHeroProps) {
  const status = tripStatusMeta(trip.status);
  const facts = tripFacts(trip, plannedCount);

  return (
    // Full bleed: it cancels the screen's margins and top padding.
    <View onLayout={onLayout} className="-mx-6 -mt-6 h-[392px] overflow-hidden bg-ink">
      {coverImage ? (
        <Image source={coverImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View className="absolute inset-0 items-center justify-center">
          <MapTrifoldIcon size={64} color={colors.ink.muted} />
        </View>
      )}
      <PhotoScrim edge="top" className="h-28" />
      <PhotoScrim edge="bottom" className="h-[70%]" />

      <View className="absolute inset-x-0 top-0 flex-row items-center justify-between p-4">
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
          {pdf && (
            <IconButton
              variant="scrim"
              label="Exporter en PDF"
              icon={FilePdfIcon}
              disabled={pdf.isExporting}
              aria-busy={pdf.isExporting}
              onPress={pdf.onExport}
              className={pdf.isExporting ? 'opacity-50' : undefined}
            />
          )}
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

      <View className="absolute inset-x-0 bottom-0 gap-2 px-6 pb-14">
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
              <Tag
                key={fact}
                label={fact}
                tone="photo"
                capitalize={false}
                className="border border-ink-inverse/35 bg-ink-inverse/15"
              />
            ))}
          </View>
        )}
      </View>

      {/* Top of the crema sheet the page seems to slide up on. */}
      <View className="absolute inset-x-0 bottom-0 h-7 rounded-t-sheet bg-background" />
    </View>
  );
}

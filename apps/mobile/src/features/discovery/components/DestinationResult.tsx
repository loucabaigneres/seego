import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { pluralize } from '@/domain/date';
import { countryFlag } from '@/domain/place';
import { colors } from '@seego/ui';
import { Badge, Card, IconButton, PhotoScrim, Tag, Text } from '@/ui';
import { CalendarIcon, XIcon } from '@/ui/icons';

import { confidenceLabel, confidencePercent, type Destination } from '../lib/recommendation';
import { LikedPlacesCarousel } from './LikedPlacesCarousel';
import { MatchRing } from './MatchRing';

export interface DestinationResultProps {
  destination: Destination;
  confidence: number;
  likeCount: number;
  seenCount: number;
  onClose: () => void;
}

/** Scrollable body of the result once a destination is found. */
export function DestinationResult({
  destination,
  confidence,
  likeCount,
  seenCount,
  onClose,
}: DestinationResultProps) {
  const percent = confidencePercent(confidence);
  const ambiances = destination.topSubcategories.slice(0, 8);

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pb-6">
      <View className="h-72 overflow-hidden rounded-card bg-ink">
        {destination.heroImage && (
          <Image
            source={destination.heroImage}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
        <PhotoScrim edge="bottom" className="h-full" />
        <IconButton
          variant="scrim"
          label="Fermer"
          icon={XIcon}
          onPress={onClose}
          className="absolute right-3 top-3"
        />
        <View className="absolute inset-x-0 bottom-0 gap-2 p-6">
          <Badge label="Ta destination idéale" tone="accent" />
          <Text variant="title" tone="inverse" role="heading">
            {destination.city}
          </Text>
          <Text variant="caption" tone="inverse">
            {[countryFlag(destination.country), destination.country].filter(Boolean).join(' ')}
          </Text>
        </View>
      </View>

      <Card className="flex-row items-center gap-4 p-4">
        <MatchRing percent={percent} />
        <View className="flex-1 gap-0.5">
          <Text variant="label">{confidenceLabel(percent)}</Text>
          <Text variant="caption">
            Basé sur tes {pluralize(likeCount, 'coup de cœur', 'coups de cœur')} parmi{' '}
            {pluralize(seenCount, 'lieu découvert', 'lieux découverts')}.
            {percent < 90 && ' Continue à swiper pour affiner.'}
          </Text>
        </View>
      </Card>

      {destination.likedHere.length > 0 && (
        <View className="gap-2.5">
          <Text variant="overline">Tes coups de cœur à {destination.city}</Text>
          <LikedPlacesCarousel places={destination.likedHere} />
        </View>
      )}

      {ambiances.length > 0 && (
        <View className="gap-2.5">
          <Text variant="overline">L’ambiance sur place</Text>
          <View className="flex-row flex-wrap gap-2">
            {ambiances.map((ambiance) => (
              <Tag key={ambiance.name} label={ambiance.name} />
            ))}
          </View>
        </View>
      )}

      <Card className="flex-row gap-3 p-4">
        <CalendarIcon size={24} color={colors.brand} />
        <View className="flex-1 gap-0.5">
          <Text variant="label">Et ensuite ?</Text>
          <Text variant="caption">
            Choisis tes dates, ton budget et ton rythme : on construit ton itinéraire jour par jour
            avec les lieux que tu as aimés.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

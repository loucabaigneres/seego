import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { pluralize } from '@/domain/date';
import { countryFlag } from '@/domain/place';
import { colors } from '@seego/ui';
import { IconButton, Text } from '@/ui';
import { ImageIcon, XIcon } from '@/ui/icons';

import { confidenceLabel, confidencePercent, type Destination } from '../lib/recommendation';
import { LikedPlacesThumbnails } from './LikedPlacesThumbnails';
import { MatchRing } from './MatchRing';

/** Ambiance pills under the liked places. */
const MAX_AMBIANCES = 6;

export interface DestinationResultProps {
  destination: Destination;
  confidence: number;
  likeCount: number;
  seenCount: number;
  onClose: () => void;
}

/** Scrollable body of the result once a destination is found, on the vino sheet. */
export function DestinationResult({
  destination,
  confidence,
  likeCount,
  seenCount,
  onClose,
}: DestinationResultProps) {
  const percent = confidencePercent(confidence);
  const ambiances = destination.topSubcategories.slice(0, MAX_AMBIANCES);
  const country = [countryFlag(destination.country), destination.country]
    .filter(Boolean)
    .join(' ');

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pb-6">
      <IconButton
        variant="scrim"
        label="Fermer"
        icon={XIcon}
        onPress={onClose}
        className="self-end"
      />

      {/* Polaroid of the city, over a tilted pesca print. */}
      <View className="-mt-6 h-64 w-56 self-center">
        <View className="absolute inset-x-2 inset-y-1.5 rotate-6 rounded-md bg-accent" />
        <View className="flex-1 -rotate-[4deg] gap-2.5 rounded-md bg-background p-2.5">
          <View className="flex-1 items-center justify-center overflow-hidden bg-ink">
            {destination.heroImage ? (
              <Image
                source={destination.heroImage}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <ImageIcon size={48} color={colors.ink.muted} />
            )}
          </View>
          <View className="flex-row items-baseline justify-between gap-2 px-1">
            <Text
              tone="brand"
              numberOfLines={1}
              className="flex-1 font-display text-[30px] leading-8"
            >
              {destination.city}
            </Text>
            {country ? (
              <Text variant="caption" numberOfLines={1} className="text-[10px] tracking-[1.4px]">
                {country}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="gap-1.5">
        <Text variant="overline" tone="accent">
          Ta destination idéale
        </Text>
        <Text
          variant="title"
          tone="inverse"
          role="heading"
          className="text-[52px] leading-[54px]"
        >
          {'C’est un\nmatch.'}
        </Text>
      </View>

      <View className="flex-row items-center gap-3.5">
        <MatchRing percent={percent} />
        <View className="flex-1 gap-0.5">
          <Text variant="label" tone="inverse" className="text-control">
            {confidenceLabel(percent)}
          </Text>
          <Text variant="caption" tone="inverse" className="opacity-75">
            D’après tes {pluralize(likeCount, 'coup de cœur', 'coups de cœur')} parmi{' '}
            {pluralize(seenCount, 'lieu', 'lieux')}.{percent < 90 && ' Continue pour affiner.'}
          </Text>
        </View>
      </View>

      {(destination.likedHere.length > 0 || ambiances.length > 0) && (
        <View className="gap-2.5">
          {destination.likedHere.length > 0 && (
            <>
              <Text variant="overline" tone="accent" className="opacity-80">
                Tes coups de cœur à {destination.city}
              </Text>
              <LikedPlacesThumbnails places={destination.likedHere} />
            </>
          )}
          {ambiances.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 pt-1">
              {ambiances.map((ambiance) => (
                <View
                  key={ambiance.name}
                  className="h-[30px] justify-center rounded-full border border-accent/45 px-3"
                >
                  <Text tone="accent" className="font-sans-medium text-[13px] capitalize">
                    {ambiance.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

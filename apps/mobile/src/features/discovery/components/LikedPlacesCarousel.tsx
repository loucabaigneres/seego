import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/ui';

import type { Destination } from '../lib/recommendation';

const TILE_WIDTH = 144;
const GAP = 12;

/** The places the user liked in the recommended city; each one opens its offer. */
export function LikedPlacesCarousel({ places }: { places: Destination['likedHere'] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={TILE_WIDTH + GAP}
      decelerationRate="fast"
      className="-mx-6"
      contentContainerClassName="gap-3 px-6"
    >
      {places.map((place) => (
        <Pressable
          key={place.id}
          role="link"
          aria-label={place.locationName ?? undefined}
          onPress={() => WebBrowser.openBrowserAsync(place.url)}
          style={{ width: TILE_WIDTH }}
          className="overflow-hidden rounded-field bg-surface-raised active:opacity-80"
        >
          <View className="h-24 bg-surface">
            <Image source={place.mainMediaUrl} style={{ flex: 1 }} contentFit="cover" />
          </View>
          <Text
            variant="caption"
            tone="default"
            numberOfLines={2}
            className="h-12 px-2.5 py-1.5 font-sans-semibold"
          >
            {place.locationName}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { Text } from '@/ui';

import type { Destination } from '../lib/recommendation';

/** Thumbnails shown before the rest is summed up in a "+N" tile. */
const MAX_THUMBNAILS = 4;

/** The places the user liked in the recommended city, as thumbnails; each one opens its offer. */
export function LikedPlacesCarousel({ places }: { places: Destination['likedHere'] }) {
  const shown = places.slice(0, MAX_THUMBNAILS);
  const rest = places.length - shown.length;

  return (
    <View className="flex-row gap-2">
      {shown.map((place) => (
        <Pressable
          key={place.id}
          role="link"
          aria-label={place.locationName ?? undefined}
          onPress={() => WebBrowser.openBrowserAsync(place.url)}
          className="size-[58px] overflow-hidden rounded-xl bg-ink active:opacity-80"
        >
          <Image source={place.mainMediaUrl} style={{ flex: 1 }} contentFit="cover" />
        </Pressable>
      ))}
      {rest > 0 && (
        <View
          aria-label={`Et ${rest} de plus`}
          className="size-[58px] items-center justify-center rounded-xl bg-accent/15"
        >
          <Text tone="accent" className="font-display text-[22px] leading-7">
            +{rest}
          </Text>
        </View>
      )}
    </View>
  );
}

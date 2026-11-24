import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/ui';

import type { Destination } from '../lib/recommendation';

/** Thumbnails shown before the rest is summed up in a "+N" tile. */
const MAX_THUMBNAILS = 4;

/** The places the user liked in the recommended city, as thumbnails; each one opens its offer. "+N" reveals the rest. */
export function LikedPlacesThumbnails({ places }: { places: Destination['likedHere'] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? places : places.slice(0, MAX_THUMBNAILS);
  const rest = places.length - shown.length;

  return (
    <View className="flex-row flex-wrap gap-2">
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
        <Pressable
          role="button"
          aria-label={`Voir les ${rest} autres`}
          onPress={() => setExpanded(true)}
          className="size-[58px] items-center justify-center rounded-xl bg-accent/15 active:opacity-80"
        >
          <Text tone="accent" className="font-display text-[22px] leading-7">
            +{rest}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

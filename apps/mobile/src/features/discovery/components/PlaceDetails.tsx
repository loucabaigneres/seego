import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { categoryMeta, cleanDescription, offerHost } from '@/domain/place';
import { colors } from '@/theme/tokens';
import { Badge, Tag, Text } from '@/ui';
import { ArrowSquareOutIcon, MapPinIcon } from '@/ui/icons';

import {
  placeCategory,
  placePrice,
  placeSubcategories,
  type DiscoveryPlace,
} from '../lib/discovery-place';

/** Past this length, "À propos" starts folded (same as the web). */
const LONG_DESCRIPTION = 260;
const FOLDED_LINES = 5;

/** Everything about a place under its photo, once its card is expanded. */
export function PlaceDetails({ place }: { place: DiscoveryPlace }) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const category = placeCategory(place);
  const price = placePrice(place);
  const tags = placeSubcategories(place);
  const description = cleanDescription(place.description);
  const isLong = description.length > LONG_DESCRIPTION;
  const location = [place.city, place.country].filter(Boolean).join(', ');
  const host = offerHost(place.url);

  return (
    <View className="gap-6">
      <View className="gap-1.5">
        {location ? (
          <View className="flex-row items-center gap-1.5">
            <MapPinIcon size={16} weight="fill" color={colors.primary.text} />
            <Text variant="caption" tone="primary" className="flex-1">
              {location}
            </Text>
          </View>
        ) : null}
        <Text variant="title" role="heading">
          {place.locationName}
        </Text>
        {(category || price) && (
          <View className="mt-1.5 flex-row flex-wrap gap-2">
            {category && <Badge label={categoryMeta(category).label} />}
            {price && (
              <View className="rounded-full bg-surface px-3 py-1">
                <Text variant="caption" tone="default">
                  Budget{' '}
                  <Text variant="caption" tone="primary">
                    {price}
                  </Text>
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {description ? (
        <View className="gap-2">
          <Text variant="overline">À propos</Text>
          <Text
            tone="secondary"
            numberOfLines={isLong && !isDescriptionOpen ? FOLDED_LINES : undefined}
          >
            {description}
          </Text>
          {isLong && (
            <Pressable
              role="button"
              aria-expanded={isDescriptionOpen}
              onPress={() => setIsDescriptionOpen((value) => !value)}
              hitSlop={8}
              className="self-start"
            >
              <Text variant="label" tone="brand">
                {isDescriptionOpen ? 'Voir moins' : 'Lire la suite'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {tags.length > 0 && (
        <View className="gap-2.5">
          <Text variant="overline">Ce qui t’attend</Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>
        </View>
      )}

      {place.url ? (
        <Pressable
          role="link"
          onPress={() => place.url && WebBrowser.openBrowserAsync(place.url)}
          className="min-h-14 flex-row items-center gap-3 rounded-field bg-surface-raised px-4 py-3 active:opacity-80"
        >
          <View className="flex-1">
            <Text variant="label">Voir l’offre</Text>
            {host && (
              <Text variant="caption" numberOfLines={1}>
                {host}
              </Text>
            )}
          </View>
          <ArrowSquareOutIcon size={20} color={colors.brand} />
        </Pressable>
      ) : null}
    </View>
  );
}

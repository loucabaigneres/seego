import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { categoryMeta, cleanDescription } from '@/domain/place';
import { colors } from '@seego/ui';
import { Tag, Text } from '@/ui';
import { MapPinIcon } from '@/ui/icons';

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
  const categoryInfo = category ? categoryMeta(category) : null;
  const price = placePrice(place);
  const tags = placeSubcategories(place);
  const description = cleanDescription(place.description);
  const isLong = description.length > LONG_DESCRIPTION;
  const location = [place.city, place.country].filter(Boolean).join(', ');

  return (
    <View className="gap-5">
      <View className="gap-1.5">
        {location ? (
          <View className="flex-row items-center gap-1.5">
            <MapPinIcon size={16} weight="fill" color={colors.brand} />
            <Text variant="caption" tone="brand" className="flex-1 font-sans-medium">
              {location}
            </Text>
          </View>
        ) : null}
        <Text variant="title" role="heading" className="text-[32px] leading-[34px]">
          {place.locationName}
        </Text>
        {(categoryInfo || price) && (
          <View className="mt-1.5 flex-row flex-wrap gap-2">
            {categoryInfo && (
              <View
                className="h-7 justify-center rounded-full px-3"
                style={{ backgroundColor: categoryInfo.colors.fill }}
              >
                <Text
                  variant="caption"
                  className="font-sans-semibold"
                  style={{ color: categoryInfo.colors.ink }}
                >
                  {categoryInfo.label}
                </Text>
              </View>
            )}
            {price && (
              <View className="h-7 flex-row items-center gap-1 rounded-full bg-surface px-3">
                <Text variant="caption" tone="default" className="font-sans-medium">
                  Budget
                </Text>
                <Text tone="brand" className="font-display text-[17px] leading-5">
                  {price}
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
            className="text-control leading-[22px]"
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

    </View>
  );
}

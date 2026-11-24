import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { categoryMeta, cleanDescription } from '@/domain/place';
import { colors } from '@seego/ui';
import { Text } from '@/ui';
import { ArrowSquareOutIcon, ArrowsLeftRightIcon, MapPinIcon } from '@/ui/icons';

import type { TripActivity } from '../hooks/useTrip';
import { CategoryIcon } from './category-icons';

export interface ActivityRowProps {
  activity: TripActivity;
  /** "Changer", next to "Voir l'offre"; also on a long press. */
  onReplace?: () => void;
}

/** A planned place: photo or category pictogram, category, name, address and its links. */
export function ActivityRow({ activity, onReplace }: ActivityRowProps) {
  const meta = categoryMeta(activity.category);
  const description = cleanDescription(activity.description);
  const { sourceUrl } = activity;

  return (
    <Pressable
      onLongPress={onReplace}
      disabled={!onReplace}
      accessibilityHint={onReplace ? 'Appui long pour remplacer ce lieu' : undefined}
      className="flex-row gap-3 rounded-field bg-surface p-3"
    >
      <View
        className="size-16 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: meta.colors.fill }}
      >
        {activity.mainMediaUrl ? (
          <Image
            source={activity.mainMediaUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <CategoryIcon category={activity.category} size={28} color={meta.colors.ink} />
        )}
      </View>

      <View className="flex-1 gap-1">
        <View
          className="self-start rounded-full px-2 py-0.5"
          style={{ backgroundColor: meta.colors.fill }}
        >
          <Text variant="overline" style={{ color: meta.colors.ink }}>
            {meta.label}
          </Text>
        </View>
        <Text variant="label">{activity.title}</Text>

        {activity.locationName && activity.locationName !== activity.title && (
          <View className="flex-row items-center gap-1">
            <MapPinIcon size={14} color={colors.brand} />
            <Text variant="caption" numberOfLines={1} className="flex-1">
              {activity.locationName}
            </Text>
          </View>
        )}

        {description !== '' && (
          <Text variant="caption" tone="secondary" numberOfLines={2}>
            {description}
          </Text>
        )}

        {(sourceUrl || onReplace) && (
          <View className="flex-row gap-3.5">
            {sourceUrl && (
              <Pressable
                role="link"
                onPress={() => WebBrowser.openBrowserAsync(sourceUrl)}
                hitSlop={8}
                className="flex-row items-center gap-1 py-1 active:opacity-80"
              >
                <Text variant="caption" tone="brand" className="font-sans-semibold">
                  Voir l’offre
                </Text>
                <ArrowSquareOutIcon size={14} color={colors.brand} />
              </Pressable>
            )}
            {onReplace && (
              <Pressable
                role="button"
                onPress={onReplace}
                hitSlop={8}
                className="flex-row items-center gap-1 py-1 active:opacity-80"
              >
                <ArrowsLeftRightIcon size={14} color={colors.brand} />
                <Text variant="caption" tone="brand" className="font-sans-semibold">
                  Changer
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { categoryMeta, cleanDescription } from '@/domain/place';
import { colors } from '@seego/ui';
import { Text } from '@/ui';
import { ArrowSquareOutIcon, MapPinIcon } from '@/ui/icons';

import type { TripActivity } from '../hooks/useTrip';

export function ActivityRow({ activity }: { activity: TripActivity }) {
  const meta = categoryMeta(activity.category);
  const description = cleanDescription(activity.description);
  const { sourceUrl } = activity;

  return (
    <View className="flex-row gap-3 rounded-field bg-surface p-3">
      <View
        className="size-[76px] items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: meta.colors.fill }}
      >
        {activity.mainMediaUrl ? (
          <Image
            source={activity.mainMediaUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <MapPinIcon size={28} color={meta.colors.ink} />
        )}
      </View>

      <View className="flex-1 gap-1">
        <View
          className="self-start rounded-full px-2.5 py-0.5"
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
          <Text variant="caption" numberOfLines={2}>
            {description}
          </Text>
        )}

        {sourceUrl && (
          <Pressable
            role="link"
            onPress={() => WebBrowser.openBrowserAsync(sourceUrl)}
            hitSlop={8}
            className="flex-row items-center gap-1 self-start py-1 active:opacity-80"
          >
            <Text variant="caption" tone="brand" className="font-sans-semibold">
              Voir l’offre
            </Text>
            <ArrowSquareOutIcon size={14} color={colors.brand} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

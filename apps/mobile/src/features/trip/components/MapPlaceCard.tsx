import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { categoryMeta } from '@/domain/place';
import { colors } from '@seego/ui';
import { Text } from '@/ui';
import { ArrowSquareOutIcon, XIcon } from '@/ui/icons';

import type { TripActivity } from '../hooks/useTrip';
import type { TripPin } from '../lib/map-pins';
import { stepLabel } from '../lib/steps';
import { CategoryIcon } from './category-icons';

export interface MapPlaceCardProps {
  pin: TripPin<TripActivity>;
  onClose: () => void;
}

/** The place behind the selected pin, laid over the bottom of the map. */
export function MapPlaceCard({ pin, onClose }: MapPlaceCardProps) {
  const { activity } = pin;
  const meta = categoryMeta(activity.category);
  const { sourceUrl } = activity;
  const where = [
    activity.locationName !== activity.title && activity.locationName,
    `jour ${pin.dayIndex}, étape ${pin.step} sur ${pin.stepCount}`,
  ].filter(Boolean);

  return (
    <View className="absolute inset-x-4 bottom-7 flex-row items-center gap-3.5 rounded-card bg-background p-3">
      <View
        className="size-[76px] items-center justify-center overflow-hidden rounded-[14px]"
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

      <View className="flex-1 gap-0.5">
        <Text variant="overline">
          <Text className="font-display tracking-normal text-brand">{stepLabel(pin.step)}</Text>
          {` · ${meta.label}`}
        </Text>
        <Text variant="label" numberOfLines={1}>
          {activity.title}
        </Text>
        <Text variant="caption" numberOfLines={2}>
          {where.join(' · ')}
        </Text>
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

      <Pressable
        role="button"
        aria-label="Fermer"
        onPress={onClose}
        className="size-11 items-center justify-center self-start rounded-full active:opacity-80"
      >
        <XIcon size={20} color={colors.ink.muted} />
      </Pressable>
    </View>
  );
}

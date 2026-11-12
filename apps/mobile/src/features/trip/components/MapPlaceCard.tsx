import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';
import { Badge } from '@/ui';
import { XIcon } from '@/ui/icons';

import type { TripActivity } from '../hooks/useTrip';
import { ActivityRow } from './ActivityRow';

export interface MapPlaceCardProps {
  activity: TripActivity;
  dayIndex: number;
  onClose: () => void;
}

/** The place behind the selected pin, laid over the bottom of the map. */
export function MapPlaceCard({ activity, dayIndex, onClose }: MapPlaceCardProps) {
  return (
    <View className="absolute inset-x-3 bottom-3 gap-1 rounded-card bg-background p-2">
      <View className="flex-row items-center justify-between pl-1">
        <Badge label={`Jour ${dayIndex}`} />
        <Pressable
          role="button"
          aria-label="Fermer"
          onPress={onClose}
          className="size-11 items-center justify-center rounded-full active:opacity-80"
        >
          <XIcon size={20} color={colors.ink.muted} />
        </Pressable>
      </View>
      <ActivityRow activity={activity} />
    </View>
  );
}

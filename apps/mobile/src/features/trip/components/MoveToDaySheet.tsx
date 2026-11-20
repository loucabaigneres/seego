import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { formatDate, pluralize } from '@/domain/date';
import { colors } from '@seego/ui';
import { Sheet, Text } from '@/ui';
import { CaretRightIcon } from '@/ui/icons';

import type { TripDay } from '../hooks/useTrip';

export interface MoveToDaySheetProps {
  /** Days the place can go to; `null` closes the sheet. */
  targets: TripDay[] | null;
  onPick: (dayId: string) => void;
  onClose: () => void;
}

/** "Déplacer vers…": the other days of the draft. The place goes to the end of the picked one. */
export function MoveToDaySheet({ targets, onPick, onClose }: MoveToDaySheetProps) {
  // Keeps the list while the closing animation plays.
  const [shown, setShown] = useState(targets);
  if (targets && targets !== shown) setShown(targets);

  return (
    <Sheet visible={targets !== null} onClose={onClose} title="Déplacer vers">
      <View className="gap-2">
        {shown?.map((day) => {
          const date = formatDate(day.targetDate, 'long');
          return (
            <Pressable
              key={day.id}
              role="button"
              onPress={() => onPick(day.id)}
              className="min-h-16 flex-row items-center gap-3 rounded-field bg-surface px-4 py-3 active:opacity-80"
            >
              <View className="flex-1 gap-0.5">
                <Text variant="label" tone="brand">
                  Jour {day.dayIndex}
                </Text>
                <Text variant="caption" numberOfLines={1}>
                  {[date, pluralize(day.activities.length, 'lieu', 'lieux')]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
              <CaretRightIcon size={20} color={colors.brand} />
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { parseIsoDate, pluralize } from '@/domain/date';
import { colors } from '@seego/ui';
import { Sheet, Text } from '@/ui';
import { CaretRightIcon } from '@/ui/icons';

import type { TripDay } from '../hooks/useTrip';

export interface MoveToDaySheetProps {
  /** Days the place can go to; `null` closes the sheet. */
  targets: TripDay[] | null;
  /** The place being moved and its current day. */
  subtitle?: string;
  onPick: (dayId: string) => void;
  onClose: () => void;
}

/** "dimanche 13 juillet": the year is the trip's. */
function dayLabel(iso: string | null): string {
  return iso
    ? parseIsoDate(iso).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : '';
}

/** "Déplacer vers…": the other days of the draft. The place goes to the end of the picked one. */
export function MoveToDaySheet({ targets, subtitle, onPick, onClose }: MoveToDaySheetProps) {
  // Keeps the list while the closing animation plays.
  const [shown, setShown] = useState({ targets, subtitle });
  if (targets && targets !== shown.targets) setShown({ targets, subtitle });

  return (
    <Sheet
      visible={targets !== null}
      onClose={onClose}
      title="Déplacer vers"
      subtitle={shown.subtitle}
    >
      <View className="gap-2">
        {shown.targets?.map((day) => {
          const date = dayLabel(day.targetDate);
          return (
            <Pressable
              key={day.id}
              role="button"
              onPress={() => onPick(day.id)}
              className="min-h-[68px] flex-row items-center gap-3.5 rounded-field bg-surface px-4 py-3 active:opacity-80"
            >
              <Text variant="section" tone="brand" className="text-2xl leading-[26px]">
                Jour {day.dayIndex}
              </Text>
              <Text variant="caption" numberOfLines={1} className="flex-1">
                {[date, pluralize(day.activities.length, 'lieu', 'lieux')]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <CaretRightIcon size={20} color={colors.brand} />
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

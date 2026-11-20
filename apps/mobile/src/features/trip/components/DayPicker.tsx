import { Pressable, ScrollView, View } from 'react-native';

import { formatDayMonth, pluralize } from '@/domain/date';
import { cn, Text } from '@/ui';

import { ALL_DAYS } from '../hooks/useDaySelection';
import type { TripDay } from '../hooks/useTrip';

export interface DayPickerProps {
  days: TripDay[];
  /** A day id, or `ALL_DAYS`. */
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  /** While editing: each tab counts its steps instead of giving its date. */
  stepCounts?: boolean;
}

/** Horizontal strip of day tabs, led by "Tous"; meant to stick to the top of the trip page. */
export function DayPicker({ days, selectedId, onSelect, stepCounts = false }: DayPickerProps) {
  return (
    // Full-bleed crema background so the timeline does not show through once stuck.
    <View className="-mx-6 bg-background py-3">
      <ScrollView
        horizontal
        role="tablist"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-6"
      >
        <DayTab
          label="Tous"
          caption={pluralize(days.length, 'jour')}
          selected={selectedId === ALL_DAYS}
          onPress={() => onSelect(ALL_DAYS)}
        />
        {days.map((day) => (
          <DayTab
            key={day.id}
            label={`Jour ${day.dayIndex}`}
            caption={
              stepCounts
                ? pluralize(day.activities.length, 'étape')
                : formatDayMonth(day.targetDate)
            }
            selected={day.id === selectedId}
            onPress={() => onSelect(day.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface DayTabProps {
  label: string;
  caption: string;
  selected: boolean;
  onPress: () => void;
}

function DayTab({ label, caption, selected, onPress }: DayTabProps) {
  return (
    <Pressable
      role="tab"
      aria-selected={selected}
      onPress={onPress}
      className={cn(
        'min-h-[52px] justify-center rounded-field px-3.5 py-1.5 active:opacity-80',
        selected ? 'bg-brand' : 'bg-surface',
      )}
    >
      <Text
        variant="caption"
        className={cn('font-sans-semibold', selected ? 'text-accent' : 'text-ink')}
      >
        {label}
      </Text>
      {caption !== '' && (
        <Text variant="caption" className={cn('text-xs', selected && 'text-ink-inverse/80')}>
          {caption}
        </Text>
      )}
    </Pressable>
  );
}

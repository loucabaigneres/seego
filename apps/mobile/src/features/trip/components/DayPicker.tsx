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
}

/** Horizontal strip of day tabs, led by "Tous"; meant to stick to the top of the trip page. */
export function DayPicker({ days, selectedId, onSelect }: DayPickerProps) {
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
            caption={formatDayMonth(day.targetDate)}
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
        'min-h-11 min-w-20 items-center justify-center rounded-field border px-4 py-1.5 active:opacity-80',
        selected ? 'border-brand bg-brand' : 'border-line-strong',
      )}
    >
      <Text variant="label" className={selected ? 'text-ink-inverse' : 'text-brand'}>
        {label}
      </Text>
      {caption !== '' && (
        <Text variant="caption" className={selected ? 'text-accent' : undefined}>
          {caption}
        </Text>
      )}
    </Pressable>
  );
}

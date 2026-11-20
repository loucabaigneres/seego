import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '@seego/ui';

import { parseIsoDate, pluralize, tripDurationDays } from '@/domain/date';
import { cn, DateField, Text } from '@/ui';
import { MinusIcon, PlusIcon, UsersThreeIcon, type AppIcon } from '@/ui/icons';

import type { TripConfig } from '../hooks/useTripConfig';
import { latestEndDate, TRAVELERS_RANGE } from '../lib/trip-config';

export type StepProps = Pick<TripConfig, 'values' | 'errors' | 'dispatch'>;

export function StepTravelers({ values, errors, dispatch }: StepProps) {
  const { startDate, endDate } = values;
  const days =
    startDate && endDate && endDate >= startDate ? tripDurationDays(startDate, endDate) : 0;

  return (
    <View className="gap-6">
      <View className="gap-2.5">
        <DateField
          label="Date de départ"
          value={startDate}
          minimumDate={new Date()}
          error={errors.startDate}
          onChange={(value) => dispatch({ type: 'set', field: 'startDate', value })}
        />
        <DateField
          label="Date de retour"
          value={endDate}
          placeholder={startDate ? 'Choisir une date' : 'Choisis d’abord le départ'}
          minimumDate={startDate ? parseIsoDate(startDate) : new Date()}
          maximumDate={startDate ? parseIsoDate(latestEndDate(startDate)) : undefined}
          error={errors.endDate}
          onChange={(value) => dispatch({ type: 'set', field: 'endDate', value })}
        />
        <TravelersRow
          value={values.numberOfPeople}
          onChange={(count) => dispatch({ type: 'setTravelers', count })}
        />
        {days > 0 && (
          <Text variant="caption" className="px-1">
            {pluralize(days, 'jour')} · {pluralize(days - 1, 'nuit')}
          </Text>
        )}
      </View>

      <View className="gap-2.5">
        <Text variant="label">Âge des voyageurs</Text>
        <View className="flex-row flex-wrap gap-2.5">
          {values.ages.map((age, index) => (
            <AgeField
              // Travellers have no identity of their own: their position is their key.
              key={index}
              index={index}
              value={age}
              onChange={(value) => dispatch({ type: 'setAge', index, value })}
            />
          ))}
        </View>
        {errors.ages && (
          <Text variant="caption" tone="brand">
            {errors.ages}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Card row with a +/- stepper: one adjustable control for screen readers. */
function TravelersRow({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { min, max } = TRAVELERS_RANGE;
  const display = pluralize(value, 'voyageur');
  const step = (delta: number) => {
    const next = value + delta;
    if (next >= min && next <= max) onChange(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      aria-label="Nombre de voyageurs"
      accessibilityValue={{ min, max, now: value, text: display }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        step(event.nativeEvent.actionName === 'increment' ? 1 : -1)
      }
      className="min-h-[72px] flex-row items-center gap-3.5 rounded-card bg-surface px-4 py-3.5"
    >
      <View className="size-10 items-center justify-center rounded-xl bg-background">
        <UsersThreeIcon size={20} color={colors.brand} />
      </View>
      <View className="flex-1">
        <Text variant="caption">Voyageurs</Text>
        <Text className="font-sans-semibold">{display}</Text>
      </View>
      <View className="flex-row items-center gap-1.5 rounded-full bg-background p-1">
        <StepButton
          icon={MinusIcon}
          label="Un voyageur de moins"
          disabled={value <= min}
          onPress={() => step(-1)}
        />
        <Text variant="section" className="w-7 text-center text-[24px] leading-[24px]">
          {value}
        </Text>
        <StepButton
          icon={PlusIcon}
          label="Un voyageur de plus"
          filled
          disabled={value >= max}
          onPress={() => step(1)}
        />
      </View>
    </View>
  );
}

interface StepButtonProps {
  icon: AppIcon;
  label: string;
  filled?: boolean;
  disabled: boolean;
  onPress: () => void;
}

function StepButton({ icon: Icon, label, filled = false, disabled, onPress }: StepButtonProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      // 34pt disc, 44pt touch target.
      hitSlop={5}
      className={cn(
        'size-[34px] items-center justify-center rounded-full active:opacity-80',
        filled ? 'bg-brand' : 'border-[1.5px] border-line-strong',
        disabled && 'opacity-30',
      )}
    >
      <Icon size={16} color={filled ? colors.accent : colors.brand} />
    </Pressable>
  );
}

interface AgeFieldProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
}

function AgeField({ index, value, onChange }: AgeFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const label = `Voyageur ${index + 1}`;

  return (
    <View
      className={cn(
        'h-[60px] min-w-[30%] flex-1 justify-center rounded-field border-[1.5px] px-4',
        isFocused ? 'border-brand bg-background' : 'border-transparent bg-surface',
      )}
    >
      <Text variant="caption" aria-hidden className="text-[13px] leading-[18px]">
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          aria-label={`Âge du voyageur ${index + 1}`}
          value={value}
          keyboardType="number-pad"
          maxLength={3}
          cursorColor={colors.brand}
          selectionColor={colors.brand}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChange}
          className="min-w-7 p-0 font-sans text-label text-ink"
        />
        <Text aria-hidden className="text-label">
          {' '}
          ans
        </Text>
      </View>
    </View>
  );
}

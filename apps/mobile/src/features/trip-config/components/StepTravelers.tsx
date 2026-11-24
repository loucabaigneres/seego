import { View } from 'react-native';

import { parseIsoDate, pluralize, tripDurationDays } from '@/domain/date';
import { DateField, NumberStepper, Text, TextField } from '@/ui';
import { UsersThreeIcon } from '@/ui/icons';

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
        <NumberStepper
          label="Voyageurs"
          icon={UsersThreeIcon}
          value={values.numberOfPeople}
          min={TRAVELERS_RANGE.min}
          max={TRAVELERS_RANGE.max}
          format={(count) => pluralize(count, 'voyageur')}
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
            <TextField
              // Travellers have no identity of their own: their position is their key.
              key={index}
              variant="filled"
              label={`Voyageur ${index + 1}`}
              aria-label={`Âge du voyageur ${index + 1}`}
              suffix="ans"
              value={age}
              keyboardType="number-pad"
              maxLength={3}
              onChangeText={(value) => dispatch({ type: 'setAge', index, value })}
              className="min-w-[30%] flex-1"
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

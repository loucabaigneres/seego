import { View } from 'react-native';

import { pluralize } from '@/domain/date';
import { DateField, NumberStepper, Text, TextField } from '@/ui';

import type { TripConfig } from '../hooks/useTripConfig';
import { DAYS_RANGE, TRAVELERS_RANGE } from '../lib/trip-config';

export type StepProps = Pick<TripConfig, 'values' | 'errors' | 'dispatch'>;

export function StepTravelers({ values, errors, dispatch }: StepProps) {
  return (
    <View className="gap-5">
      <DateField
        label="Date de départ"
        value={values.startDate}
        minimumDate={new Date()}
        error={errors.startDate}
        onChange={(value) => dispatch({ type: 'set', field: 'startDate', value })}
      />
      <NumberStepper
        label="Durée"
        value={values.durationDays}
        {...DAYS_RANGE}
        format={(count) => pluralize(count, 'jour')}
        onChange={(value) => dispatch({ type: 'set', field: 'durationDays', value })}
      />
      <NumberStepper
        label="Nombre de voyageurs"
        value={values.numberOfPeople}
        {...TRAVELERS_RANGE}
        format={(count) => pluralize(count, 'voyageur')}
        onChange={(count) => dispatch({ type: 'setTravelers', count })}
      />

      <View className="gap-3">
        <Text variant="label">Âge des voyageurs</Text>
        <View className="flex-row flex-wrap gap-3">
          {values.ages.map((age, index) => (
            <TextField
              // Travellers have no identity of their own: their position is their key.
              key={index}
              label={`Voyageur ${index + 1}`}
              value={age}
              keyboardType="number-pad"
              maxLength={3}
              onChangeText={(value) => dispatch({ type: 'setAge', index, value })}
              className="w-[30%]"
            />
          ))}
        </View>
        {errors.ages && (
          <Text variant="caption" tone="primary">
            {errors.ages}
          </Text>
        )}
      </View>
    </View>
  );
}

import { View } from 'react-native';

import { parseIsoDate, pluralize } from '@/domain/date';
import { DateField, NumberStepper, Text, TextField } from '@/ui';

import type { TripConfig } from '../hooks/useTripConfig';
import { latestEndDate, TRAVELERS_RANGE } from '../lib/trip-config';

export type StepProps = Pick<TripConfig, 'values' | 'errors' | 'dispatch'>;

export function StepTravelers({ values, errors, dispatch }: StepProps) {
  const { startDate } = values;
  return (
    <View className="gap-5">
      <DateField
        label="Date de départ"
        value={values.startDate}
        minimumDate={new Date()}
        error={errors.startDate}
        onChange={(value) => dispatch({ type: 'set', field: 'startDate', value })}
      />
      <DateField
        label="Date de retour"
        value={values.endDate}
        placeholder={startDate ? 'Choisir une date' : 'Choisis d’abord le départ'}
        minimumDate={startDate ? parseIsoDate(startDate) : new Date()}
        maximumDate={startDate ? parseIsoDate(latestEndDate(startDate)) : undefined}
        error={errors.endDate}
        onChange={(value) => dispatch({ type: 'set', field: 'endDate', value })}
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
          <Text variant="caption" tone="brand">
            {errors.ages}
          </Text>
        )}
      </View>
    </View>
  );
}

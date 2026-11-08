import { View } from 'react-native';

import { SegmentedControl, Text } from '@/ui';

import { BUDGET_OPTIONS, INTENSITY_OPTIONS, type ChoiceOption } from '../options';
import type { StepProps } from './StepTravelers';

export function StepStyle({ values, dispatch }: StepProps) {
  return (
    <View className="gap-6">
      <Choice
        label="Rythme souhaité"
        options={INTENSITY_OPTIONS}
        value={values.intensity}
        onChange={(value) => dispatch({ type: 'set', field: 'intensity', value })}
      />
      <Choice
        label="Budget moyen par personne"
        options={BUDGET_OPTIONS}
        value={values.averagePrice}
        onChange={(value) => dispatch({ type: 'set', field: 'averagePrice', value })}
      />
    </View>
  );
}

interface ChoiceProps<T extends string> {
  label: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function Choice<T extends string>({ label, options, value, onChange }: ChoiceProps<T>) {
  return (
    <View className="gap-3">
      <Text variant="label">{label}</Text>
      <SegmentedControl kind="radio" segments={options} value={value} onChange={onChange} />
      <Text variant="caption">{options.find((option) => option.value === value)?.hint}</Text>
    </View>
  );
}

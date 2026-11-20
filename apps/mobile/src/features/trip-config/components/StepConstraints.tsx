import { View } from 'react-native';

import { Chip, Text, TextField } from '@/ui';
import { CheckIcon, PlusIcon } from '@/ui/icons';

import type { ConstraintList } from '../lib/trip-config';
import { CONSTRAINT_GROUPS } from '../options';
import type { StepProps } from './StepTravelers';

const LISTS: ConstraintList[] = ['dietary', 'medical'];

export function StepConstraints({ values, dispatch }: StepProps) {
  return (
    <View className="gap-8">
      {LISTS.map((list) => {
        const group = CONSTRAINT_GROUPS[list];
        const customField = `${list}Custom` as const;
        return (
          <View key={list} className="gap-3">
            <Text variant="label">{group.title}</Text>
            <View className="flex-row flex-wrap gap-2">
              {group.options.map((option) => {
                const selected = values[list].includes(option.id);
                return (
                  <Chip
                    key={option.id}
                    label={option.label}
                    selected={selected}
                    // Same-size icons: the chip keeps its width when toggled.
                    icon={selected ? CheckIcon : PlusIcon}
                    onPress={() => dispatch({ type: 'toggle', list, id: option.id })}
                  />
                );
              })}
            </View>
            <TextField
              label={group.customLabel}
              placeholder={group.customPlaceholder}
              value={values[customField]}
              onChangeText={(value) => dispatch({ type: 'set', field: customField, value })}
            />
          </View>
        );
      })}
    </View>
  );
}

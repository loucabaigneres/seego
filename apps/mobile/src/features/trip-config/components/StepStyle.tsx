import { Pressable, View } from 'react-native';

import { cn, Text } from '@/ui';

import { BUDGET_OPTIONS, INTENSITY_OPTIONS, type ChoiceLevel, type ChoiceOption } from '../options';
import type { StepProps } from './StepTravelers';

const LEVELS: ChoiceLevel[] = [1, 2, 3];

export function StepStyle({ values, dispatch }: StepProps) {
  return (
    <View className="gap-6">
      <Choice
        label="Rythme souhaité"
        glyph="dots"
        options={INTENSITY_OPTIONS}
        value={values.intensity}
        onChange={(value) => dispatch({ type: 'set', field: 'intensity', value })}
      />
      <Choice
        label="Budget moyen par personne"
        glyph="euros"
        options={BUDGET_OPTIONS}
        value={values.averagePrice}
        onChange={(value) => dispatch({ type: 'set', field: 'averagePrice', value })}
      />
    </View>
  );
}

interface ChoiceProps<T extends string> {
  label: string;
  /** How each option's `level` is drawn: ●○○ to ●●●, or € to €€€. */
  glyph: 'dots' | 'euros';
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function Choice<T extends string>({ label, glyph, options, value, onChange }: ChoiceProps<T>) {
  return (
    <View className="gap-2.5">
      <Text variant="label">{label}</Text>
      <View role="radiogroup" aria-label={label} className="flex-row gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              onPress={() => onChange(option.value)}
              className={cn(
                'h-[108px] flex-1 justify-between rounded-card p-3.5 active:opacity-80',
                selected ? 'bg-brand' : 'bg-surface',
              )}
            >
              {glyph === 'dots' ? (
                <View aria-hidden className="h-7 flex-row items-center gap-1">
                  {LEVELS.map((dot) => (
                    <View
                      key={dot}
                      className={cn(
                        'size-[9px] rounded-full',
                        selected ? 'bg-accent' : 'bg-brand',
                        dot > option.level && 'opacity-25',
                      )}
                    />
                  ))}
                </View>
              ) : (
                <Text
                  aria-hidden
                  variant="section"
                  className={cn(
                    'text-[28px] leading-[28px]',
                    selected ? 'text-accent' : 'text-brand',
                  )}
                >
                  {'€'.repeat(option.level)}
                </Text>
              )}
              <Text
                className={cn(
                  'font-sans-semibold text-control',
                  selected ? 'text-ink-inverse' : 'text-ink',
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text variant="caption">{options.find((option) => option.value === value)?.hint}</Text>
    </View>
  );
}

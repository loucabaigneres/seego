import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { cn } from './cn';
import { MinusIcon, PlusIcon, type AppIcon } from './icons';
import { Text } from './Text';

export interface NumberStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** How the value reads, e.g. "7 jours". */
  format?: (value: number) => string;
  className?: string;
}

export function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
  format = String,
  className,
}: NumberStepperProps) {
  const display = format(value);
  const step = (delta: number) => {
    const next = value + delta;
    if (next >= min && next <= max) onChange(next);
  };

  return (
    <View className={cn('gap-2', className)}>
      <Text aria-hidden className="font-sans-medium text-caption text-ink-secondary">
        {label}
      </Text>
      {/* One adjustable control for screen readers: swipe up or down to change the value. */}
      <View
        accessible
        accessibilityRole="adjustable"
        aria-label={label}
        accessibilityValue={{ min, max, now: value, text: display }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) =>
          step(event.nativeEvent.actionName === 'increment' ? 1 : -1)
        }
        className="min-h-14 flex-row items-center justify-between rounded-field border border-line-strong bg-surface-raised px-1"
      >
        <StepButton icon={MinusIcon} label="Diminuer" disabled={value <= min} onPress={() => step(-1)} />
        <Text variant="label">{display}</Text>
        <StepButton icon={PlusIcon} label="Augmenter" disabled={value >= max} onPress={() => step(1)} />
      </View>
    </View>
  );
}

interface StepButtonProps {
  icon: AppIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function StepButton({ icon: Icon, label, disabled, onPress }: StepButtonProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'size-11 items-center justify-center rounded-full active:bg-surface',
        disabled && 'opacity-30',
      )}
    >
      <Icon size={20} color={colors.brand} />
    </Pressable>
  );
}

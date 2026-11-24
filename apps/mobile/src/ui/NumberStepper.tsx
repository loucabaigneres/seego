import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';

import { cn } from './cn';
import { MinusIcon, PlusIcon, type AppIcon } from './icons';
import { Text } from './Text';

export interface NumberStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** How the value reads, e.g. "3 voyageurs". */
  format?: (value: number) => string;
  icon: AppIcon;
  className?: string;
}

/** Card row with a +/- stepper: one adjustable control for screen readers. */
export function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
  format = String,
  icon: Icon,
  className,
}: NumberStepperProps) {
  const display = format(value);
  const step = (delta: number) => {
    const next = value + delta;
    if (next >= min && next <= max) onChange(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      aria-label={label}
      accessibilityValue={{ min, max, now: value, text: display }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        step(event.nativeEvent.actionName === 'increment' ? 1 : -1)
      }
      className={cn(
        'min-h-[72px] flex-row items-center gap-3.5 rounded-card bg-surface px-4 py-3.5',
        className,
      )}
    >
      <View className="size-10 items-center justify-center rounded-xl bg-background">
        <Icon size={20} color={colors.brand} />
      </View>
      <View className="flex-1">
        <Text variant="caption">{label}</Text>
        <Text className="font-sans-semibold">{display}</Text>
      </View>
      <View className="flex-row items-center gap-1.5 rounded-full bg-background p-1">
        <StepButton
          icon={MinusIcon}
          label="Diminuer"
          disabled={value <= min}
          onPress={() => step(-1)}
        />
        <Text variant="section" className="w-7 text-center text-[24px] leading-[24px]">
          {value}
        </Text>
        <StepButton
          icon={PlusIcon}
          label="Augmenter"
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

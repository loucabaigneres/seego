import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { ArrowLeftIcon } from './icons';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';

export interface StepHeaderProps {
  /** "Question 2 sur 4", "Étape 1 sur 3"… */
  label: string;
  backLabel: string;
  progress: number;
  segments: number;
  onBack: () => void;
}

/** Back button, step counter and segmented progress of a multi-step flow. */
export function StepHeader({ label, backLabel, progress, segments, onBack }: StepHeaderProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Pressable
          role="button"
          aria-label={backLabel}
          onPress={onBack}
          hitSlop={8}
          className="-ml-2 size-11 items-center justify-center rounded-full active:bg-surface"
        >
          <ArrowLeftIcon size={24} color={colors.ink.DEFAULT} />
        </Pressable>
        <Text variant="overline">{label}</Text>
      </View>
      <ProgressBar value={progress} segments={segments} />
    </View>
  );
}

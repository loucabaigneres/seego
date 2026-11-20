import { View } from 'react-native';

import { IconButton } from './IconButton';
import { ArrowLeftIcon } from './icons';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';

export interface StepHeaderProps {
  /** "Question 2 sur 4", "Étape 1 sur 3"… */
  label: string;
  backLabel: string;
  /** Share completed, between 0 and 1. */
  progress: number;
  onBack: () => void;
}

/** Back button, step counter and progress (one continuous bar, in %) of a multi-step flow. */
export function StepHeader({ label, backLabel, progress, onBack }: StepHeaderProps) {
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <IconButton label={backLabel} icon={ArrowLeftIcon} onPress={onBack} className="-ml-2" />
        <Text variant="overline">{label}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <ProgressBar value={progress} className="h-1.5 flex-1" />
        <Text variant="caption" className="min-w-10 text-right">
          {percent} %
        </Text>
      </View>
    </View>
  );
}

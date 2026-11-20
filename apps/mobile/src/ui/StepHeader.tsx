import { View } from 'react-native';

import { IconButton } from './IconButton';
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
        <IconButton label={backLabel} icon={ArrowLeftIcon} onPress={onBack} className="-ml-2" />
        <Text variant="overline">{label}</Text>
      </View>
      <ProgressBar value={progress} segments={segments} />
    </View>
  );
}

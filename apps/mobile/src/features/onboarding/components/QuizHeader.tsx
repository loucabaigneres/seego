import { View } from 'react-native';

import { IconButton, ProgressBar } from '@/ui';
import { ArrowLeftIcon } from '@/ui/icons';

export interface QuizHeaderProps {
  /** Read by screen readers, e.g. "Question 2 sur 4". */
  label: string;
  backLabel: string;
  /** Share completed, between 0 and 1. */
  progress: number;
  onBack: () => void;
}

/** Back arrow and a centred progress bar, balanced by an empty slot on the right. */
export function QuizHeader({ label, backLabel, progress, onBack }: QuizHeaderProps) {
  return (
    <View className="flex-row items-center">
      <IconButton label={backLabel} icon={ArrowLeftIcon} onPress={onBack} />
      <View
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(Math.max(progress, 0), 1) * 100)}
        className="mx-3 flex-1"
      >
        <ProgressBar value={progress} className="h-1.5" />
      </View>
      <View className="w-11" />
    </View>
  );
}

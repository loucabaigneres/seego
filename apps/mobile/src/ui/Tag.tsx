import { View } from 'react-native';

import { cn } from './cn';
import { Text } from './Text';

const TONES = {
  /** On crema or travertino. */
  neutral: { container: 'bg-surface', text: 'text-ink' },
  /** On photos: notte veil under crema text, as the charte requires. */
  photo: { container: 'bg-scrim', text: 'text-ink-inverse' },
} as const;

export interface TagProps {
  label: string;
  tone?: keyof typeof TONES;
  className?: string;
}

/**
 * Static descriptive pill ("plage", "vue mer"…). Not pressable, unlike `Chip`,
 * and in sentence case, unlike `Badge`.
 */
export function Tag({ label, tone = 'neutral', className }: TagProps) {
  return (
    <View className={cn('self-start rounded-full px-3 py-1', TONES[tone].container, className)}>
      <Text variant="caption" className={cn('font-sans-medium capitalize', TONES[tone].text)}>
        {label}
      </Text>
    </View>
  );
}

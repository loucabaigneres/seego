import { Pressable } from 'react-native';

import { colors } from '@seego/ui';
import { Text } from '@/ui';
import { ArrowRightIcon } from '@/ui/icons';

export interface DraftResumeProps {
  title: string;
  onPress: () => void;
}

/** "Pick up where you left off": the latest draft trip, under the two choices. */
export function DraftResume({ title, onPress }: DraftResumeProps) {
  return (
    <Pressable
      role="link"
      aria-label={`Reprendre le brouillon ${title}`}
      onPress={onPress}
      className="flex-row items-center gap-3 border-t border-line pt-3.5 active:opacity-80"
    >
      <Text numberOfLines={1} className="shrink font-display text-[22px] leading-[26px] text-brand">
        {title}
      </Text>
      <Text variant="caption" className="flex-1">
        Brouillon
      </Text>
      <Text variant="label" tone="brand" className="text-[15px] leading-5">
        Reprendre
      </Text>
      <ArrowRightIcon size={16} color={colors.brand} />
    </Pressable>
  );
}

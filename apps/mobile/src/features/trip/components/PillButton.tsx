import { Pressable } from 'react-native';

import { colors } from '@/theme/tokens';
import { Text } from '@/ui';
import type { AppIcon } from '@/ui/icons';

export interface PillButtonProps {
  label: string;
  icon: AppIcon;
  onPress: () => void;
}

/** Small outlined action of a planned place ("Changer", "Déplacer vers…"). */
export function PillButton({ label, icon: Icon, onPress }: PillButtonProps) {
  return (
    <Pressable
      role="button"
      onPress={onPress}
      hitSlop={4}
      className="min-h-9 flex-row items-center gap-1 self-start rounded-full border border-line-strong px-3 active:opacity-80"
    >
      <Icon size={16} color={colors.brand} />
      <Text variant="caption" tone="brand" className="font-sans-semibold">
        {label}
      </Text>
    </Pressable>
  );
}

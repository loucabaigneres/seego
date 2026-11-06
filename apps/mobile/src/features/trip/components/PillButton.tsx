import { Pressable } from 'react-native';

import { colors } from '@/theme/tokens';
import { cn, Text } from '@/ui';
import type { AppIcon } from '@/ui/icons';

export interface PillButtonProps {
  label: string;
  icon: AppIcon;
  onPress: () => void;
  /** Disables the button and says it is working ("Préparation…"). */
  loading?: boolean;
}

/** Small outlined action of a planned place ("Changer", "Déplacer vers…"). */
export function PillButton({ label, icon: Icon, onPress, loading = false }: PillButtonProps) {
  return (
    <Pressable
      role="button"
      onPress={onPress}
      disabled={loading}
      aria-busy={loading}
      hitSlop={4}
      className={cn(
        'min-h-9 flex-row items-center gap-1 self-start rounded-full border border-line-strong px-3 active:opacity-80',
        loading && 'opacity-50',
      )}
    >
      <Icon size={16} color={colors.brand} />
      <Text variant="caption" tone="brand" className="font-sans-semibold">
        {loading ? 'Préparation…' : label}
      </Text>
    </Pressable>
  );
}

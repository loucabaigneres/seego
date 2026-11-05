import { Pressable, type PressableProps } from 'react-native';

import { colors } from '@/theme/tokens';

import { cn } from './cn';
import type { AppIcon } from './icons';

const VARIANTS = {
  // Over a photo: a dark disc keeps the icon readable on any image.
  scrim: { container: 'bg-scrim active:opacity-80', icon: colors.ink.inverse, size: 20 },
  // On the page background, e.g. a header back arrow.
  ghost: { container: 'active:bg-surface', icon: colors.ink.DEFAULT, size: 24 },
} as const;

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  /** Read by screen readers: an icon alone says nothing. */
  label: string;
  icon: AppIcon;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

/** Round, icon-only button with a 44pt touch target. */
export function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const styles = VARIANTS[variant];

  return (
    <Pressable
      role="button"
      aria-label={label}
      hitSlop={8}
      className={cn(
        'size-11 items-center justify-center rounded-full',
        styles.container,
        className,
      )}
      {...props}
    >
      <Icon size={styles.size} color={styles.icon} />
    </Pressable>
  );
}

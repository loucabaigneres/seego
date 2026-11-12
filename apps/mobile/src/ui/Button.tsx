import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { colors } from '@seego/ui';

import { cn } from './cn';
import type { AppIcon } from './icons';
import { Spinner } from './Spinner';
import { Text } from './Text';

const VARIANTS = {
  // Vino with pesca text, like the onboarding choice icons.
  primary: { container: 'bg-brand', text: 'text-accent', icon: colors.accent, spinner: 'accent' },
  secondary: { container: 'bg-brand', text: 'text-accent', icon: colors.accent, spinner: 'accent' },
  // The one highlighted action of a screen (apricot, notte text).
  cta: { container: 'bg-cta', text: 'text-ink', icon: colors.ink.DEFAULT, spinner: 'ink' },
  outline: {
    container: 'border border-brand',
    text: 'text-brand',
    icon: colors.brand,
    spinner: 'brand',
  },
  ghost: { container: '', text: 'text-brand underline', icon: colors.brand, spinner: 'brand' },
} as const;

const SIZES = {
  md: 'min-h-14 px-6',
  sm: 'min-h-11 px-4',
} as const;

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  /** Phosphor icon rendered after the label. */
  icon?: AppIcon;
  /** Rendered before the label, e.g. a brand logo that must keep its own colours. */
  leading?: ReactNode;
  className?: string;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon: Icon,
  leading,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = VARIANTS[variant];

  return (
    <Pressable
      role="button"
      aria-disabled={isDisabled}
      aria-busy={loading}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-button active:opacity-80',
        styles.container,
        SIZES[size],
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading && <Spinner tone={styles.spinner} />}
      {!loading && leading}
      <Text variant="label" className={styles.text}>
        {label}
      </Text>
      {!loading && Icon && <Icon size={20} color={styles.icon} />}
    </Pressable>
  );
}

import { useState, type Ref } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { colors } from '@seego/ui';

import { cn } from './cn';
import { EyeIcon, EyeSlashIcon, type AppIcon } from './icons';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'className'> {
  label: string;
  error?: string;
  /** Phosphor icon shown before the input. */
  icon?: AppIcon;
  className?: string;
  /** Unit shown after the value, e.g. « ans ». */
  suffix?: string;
  /** `filled`: label inside a borderless surface box (compact grids). */
  variant?: 'outline' | 'filled';
  ref?: Ref<TextInputInstance>;
}

export function TextField({
  label,
  error,
  icon: Icon,
  className,
  suffix,
  variant = 'outline',
  editable = true,
  secureTextEntry = false,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const RevealIcon = isRevealed ? EyeSlashIcon : EyeIcon;

  const filled = variant === 'filled';
  // The input carries the label itself, so screen readers don't read it twice.
  const labelText = (
    <Text
      aria-hidden
      className={
        filled
          ? 'font-sans text-[13px] leading-[18px] text-ink-muted'
          : 'font-sans-medium text-caption text-ink-secondary'
      }
    >
      {label}
    </Text>
  );

  return (
    <View className={cn('gap-2', className)}>
      {!filled && labelText}
      <View
        className={cn(
          'rounded-field',
          filled
            ? cn(
                'h-[60px] justify-center border-[1.5px] px-4',
                error || isFocused ? 'border-brand bg-background' : 'border-transparent bg-surface',
              )
            : cn(
                'min-h-14 border bg-background',
                error || isFocused ? 'border-brand' : 'border-line-strong',
              ),
          !editable && 'opacity-50',
        )}
      >
        {filled && labelText}
        <View
          className={cn('flex-row items-center', !filled && 'min-h-14', Icon && !filled && 'pl-4')}
        >
          {Icon && <Icon size={20} color={isFocused ? colors.brand : colors.ink.muted} />}
          <TextInput
            aria-label={label}
            aria-invalid={!!error}
            aria-disabled={!editable}
            editable={editable}
            secureTextEntry={secureTextEntry && !isRevealed}
            placeholderTextColor={colors.ink.muted}
            cursorColor={colors.brand}
            selectionColor={colors.brand}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            className={cn(
              'font-sans text-ink',
              filled ? 'min-w-7 p-0 text-label' : 'min-h-14 px-4 text-body',
              !(filled && suffix) && 'flex-1',
              Icon && (filled ? 'pl-2' : 'pl-3'),
            )}
            {...props}
          />
          {suffix && (
            <Text aria-hidden className={cn('text-label', !filled && 'pr-4')}>
              {' '}
              {suffix}
            </Text>
          )}
          {secureTextEntry && (
            <Pressable
              role="button"
              aria-label={isRevealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={isRevealed}
              disabled={!editable}
              onPress={() => setIsRevealed((current) => !current)}
              className="size-11 items-center justify-center mr-1 active:opacity-60"
            >
              <RevealIcon size={20} color={colors.ink.muted} />
            </Pressable>
          )}
        </View>
      </View>
      {error && (
        <Text variant="caption" tone="brand">
          {error}
        </Text>
      )}
    </View>
  );
}

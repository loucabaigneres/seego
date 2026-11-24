import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@seego/ui';
import { cn, PhotoScrim, Spinner, Text } from '@/ui';
import { ArrowRightIcon, CaretRightIcon, type AppIcon } from '@/ui/icons';

export interface ChoiceCardProps {
  icon: AppIcon;
  title: string;
  description: string;
  onPress: () => void;
  /** Large photo card for the recommended path; compact travertino row otherwise. */
  featured?: boolean;
  /** Featured only. */
  photo?: string;
  badge?: string;
  /** Featured only: overline above the title ("4 questions · 1 minute"). */
  eyebrow?: string;
  /** Featured only: label of the inner button. */
  cta?: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
}

/** One of the two ways to start a trip on the home screen. */
export function ChoiceCard({
  icon: Icon,
  title,
  description,
  onPress,
  featured = false,
  photo,
  badge,
  eyebrow,
  cta,
  loading = false,
  loadingLabel,
  disabled = false,
}: ChoiceCardProps) {
  const isDisabled = disabled || loading;
  const pressableProps = {
    role: 'button',
    'aria-label': title,
    accessibilityHint: description,
    'aria-disabled': isDisabled,
    'aria-busy': loading,
    disabled: isDisabled,
    onPress,
  } as const;

  if (featured) {
    return (
      <Pressable
        {...pressableProps}
        className={cn(
          'h-[312px] overflow-hidden rounded-card bg-ink active:opacity-90',
          disabled && 'opacity-60',
        )}
      >
        {photo && (
          <Image
            source={photo}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={{ left: '50%', top: '30%' }}
          />
        )}
        <PhotoScrim edge="bottom" className="h-3/4" />

        {badge && (
          <View className="absolute left-4 top-4 h-7 justify-center rounded-full bg-accent px-3">
            <Text variant="caption" className="font-sans-semibold text-[13px] leading-4 text-brand">
              {badge}
            </Text>
          </View>
        )}

        <View className="absolute inset-x-5 bottom-5 gap-1.5">
          {eyebrow && (
            <Text variant="overline" tone="accent">
              {eyebrow}
            </Text>
          )}
          <Text className="font-display text-[40px] leading-[42px] text-ink-inverse">{title}</Text>
          <Text className="font-sans text-[15px] leading-[21px] text-ink-inverse/85">
            {description}
          </Text>
          <View className="mt-2.5 min-h-12 flex-row items-center justify-between gap-2 rounded-full bg-background px-6">
            <Text variant="label" tone="brand">
              {loading ? loadingLabel : cta}
            </Text>
            {loading ? <Spinner tone="brand" /> : <ArrowRightIcon size={20} color={colors.brand} />}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...pressableProps}
      className={cn(
        'flex-row items-center gap-4 rounded-card bg-surface px-5 py-[18px] active:opacity-90',
        disabled && 'opacity-60',
      )}
    >
      <View className="size-12 items-center justify-center rounded-full border-[1.5px] border-brand">
        <Icon size={24} color={colors.brand} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="section">{title}</Text>
        <Text variant="caption">{loading ? loadingLabel : description}</Text>
      </View>
      {loading ? <Spinner tone="brand" /> : <CaretRightIcon size={20} color={colors.brand} />}
    </Pressable>
  );
}

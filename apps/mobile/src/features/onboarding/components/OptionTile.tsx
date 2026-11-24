import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';
import { cn, Text } from '@/ui';
import { CheckCircleIcon, type AppIcon } from '@/ui/icons';

export interface OptionTileProps {
  icon: AppIcon;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionTile({ icon: Icon, title, description, selected, onPress }: OptionTileProps) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={selected}
      aria-label={title}
      accessibilityHint={description}
      onPress={onPress}
      className={cn(
        'min-h-11 flex-row items-center gap-3.5 rounded-card p-4 active:opacity-80',
        selected ? 'bg-brand' : 'bg-surface',
      )}
    >
      <Icon
        size={24}
        weight={selected ? 'fill' : 'regular'}
        color={selected ? colors.accent : colors.brand}
      />
      <View className="flex-1 gap-0.5">
        <Text
          variant="label"
          tone={selected ? 'accent' : 'default'}
          className="text-base leading-[21px]"
        >
          {title}
        </Text>
        <Text
          variant="caption"
          className={cn('text-[13px] leading-[18px]', selected && 'text-ink-inverse/80')}
        >
          {description}
        </Text>
      </View>
      {selected ? (
        <CheckCircleIcon size={24} weight="fill" color={colors.accent} />
      ) : (
        <View className="m-px size-[22px] rounded-full border-[1.5px] border-line-strong" />
      )}
    </Pressable>
  );
}

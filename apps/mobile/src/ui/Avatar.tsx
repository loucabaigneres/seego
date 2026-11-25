import { View } from 'react-native';

import { cn } from './cn';
import { Text } from './Text';

/** Cycled per member, in the order of the list: vino, oliva, pesca, travertino. */
const TONES = [
  { container: 'bg-brand', text: 'text-accent' },
  { container: 'bg-success', text: 'text-ink-inverse' },
  { container: 'bg-accent', text: 'text-brand' },
  { container: 'bg-surface', text: 'text-brand' },
] as const;

const SIZES = {
  sm: { box: 'size-[22px]', text: 'font-sans-semibold text-[10px] leading-3' },
  md: { box: 'size-[34px]', text: 'font-serif text-[15px] leading-[18px]' },
  lg: { box: 'size-[42px]', text: 'font-serif text-[19px] leading-6' },
  xl: { box: 'size-[72px]', text: 'font-serif text-[32px] leading-9' },
} as const;

export interface AvatarProps {
  name: string;
  /** Position in the member list: picks the tone. */
  index?: number;
  size?: keyof typeof SIZES;
  className?: string;
}

/** A member's initial in a coloured circle. Decorative: the name is always written next to it. */
export function Avatar({ name, index = 0, size = 'lg', className }: AvatarProps) {
  const tone = TONES[index % TONES.length];
  return (
    <View
      aria-hidden
      className={cn(
        'items-center justify-center rounded-full',
        SIZES[size].box,
        tone.container,
        className,
      )}
    >
      <Text className={cn(SIZES[size].text, tone.text)}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </Text>
    </View>
  );
}

export interface AvatarStackProps {
  names: string[];
  /** Members not drawn, shown as "+N". */
  extra?: number;
  size?: 'sm' | 'md';
  /** Border matching the background behind the stack, e.g. `border-surface`. */
  ringClassName?: string;
}

/** Overlapping initials: the first members of a group. */
export function AvatarStack({
  names,
  extra = 0,
  size = 'sm',
  ringClassName = 'border-background',
}: AvatarStackProps) {
  const overlap = size === 'sm' ? '-ml-1.5' : '-ml-2';
  const ring = cn('border-2', ringClassName);
  return (
    <View aria-hidden className="flex-row">
      {names.map((name, index) => (
        <Avatar
          key={`${name}-${index}`}
          name={name}
          index={index}
          size={size}
          className={cn(ring, index > 0 && overlap)}
        />
      ))}
      {extra > 0 && (
        <View
          className={cn(
            'items-center justify-center rounded-full bg-surface',
            SIZES[size].box,
            ring,
            overlap,
          )}
        >
          <Text className={cn(SIZES[size].text, 'font-sans-semibold text-brand')}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

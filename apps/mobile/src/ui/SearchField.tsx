import { TextInput, View } from 'react-native';

import { colors } from '@seego/ui';

import { cn } from './cn';
import { IconButton } from './IconButton';
import { MagnifyingGlassIcon, XIcon } from './icons';

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Also read by screen readers. */
  placeholder: string;
  className?: string;
}

/** A compact search input with a clear button, for filtering a list. */
export function SearchField({ value, onChangeText, placeholder, className }: SearchFieldProps) {
  return (
    <View
      className={cn(
        'min-h-12 flex-row items-center gap-2 rounded-full border border-line-strong bg-background pl-4',
        className,
      )}
    >
      <MagnifyingGlassIcon size={20} color={colors.ink.muted} />
      <TextInput
        role="searchbox"
        aria-label={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.ink.muted}
        cursorColor={colors.brand}
        selectionColor={colors.brand}
        autoCorrect={false}
        returnKeyType="search"
        className="min-h-12 flex-1 font-sans text-body text-ink"
      />
      {value ? (
        <IconButton label="Effacer la recherche" icon={XIcon} onPress={() => onChangeText('')} />
      ) : (
        <View className="w-3" />
      )}
    </View>
  );
}

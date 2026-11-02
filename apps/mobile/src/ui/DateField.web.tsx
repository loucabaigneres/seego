import { View } from 'react-native';

import { toIsoDate } from '@/domain/date';

import { cn } from './cn';
import type { DateFieldProps } from './DateField';
import { Text } from './Text';

/** The native picker has no web build: the browser's own date input stands in. */
export function DateField({ label, value, onChange, minimumDate, error, className }: DateFieldProps) {
  return (
    <View className={cn('gap-2', className)}>
      <Text aria-hidden className="font-sans-medium text-caption text-ink-secondary">
        {label}
      </Text>
      <input
        type="date"
        aria-label={label}
        aria-invalid={!!error}
        value={value ?? ''}
        min={minimumDate ? toIsoDate(minimumDate) : undefined}
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
        className={cn(
          'min-h-14 rounded-field border bg-surface-raised px-4 font-sans text-body text-ink',
          error ? 'border-primary-text' : 'border-line-strong',
        )}
      />
      {error && (
        <Text variant="caption" tone="primary">
          {error}
        </Text>
      )}
    </View>
  );
}

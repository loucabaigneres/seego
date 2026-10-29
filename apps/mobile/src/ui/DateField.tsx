import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { formatDate, parseIsoDate, toIsoDate } from '@/domain/date';
import { colors } from '@/theme/tokens';

import { Button } from './Button';
import { cn } from './cn';
import { CalendarIcon } from './icons';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface DateFieldProps {
  label: string;
  /** `YYYY-MM-DD`, null when empty. */
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  error?: string;
  className?: string;
}

/** A field that opens the system date picker: a dialog on Android, a sheet on iOS. */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Choisir une date',
  minimumDate,
  error,
  className,
}: DateFieldProps) {
  const [draft, setDraft] = useState<Date | null>(null);
  const current = value ? parseIsoDate(value) : (minimumDate ?? new Date());
  const display = value ? formatDate(current, 'long') : placeholder;

  const open = () => {
    if (Platform.OS !== 'android') {
      setDraft(current);
      return;
    }
    DateTimePickerAndroid.open({
      mode: 'date',
      value: current,
      minimumDate,
      onValueChange: (_, date) => onChange(toIsoDate(date)),
    });
  };

  return (
    <View className={cn('gap-2', className)}>
      <Text aria-hidden className="font-sans-medium text-caption text-ink-secondary">
        {label}
      </Text>
      <Pressable
        role="button"
        aria-label={`${label} : ${display}`}
        aria-invalid={!!error}
        onPress={open}
        className={cn(
          'min-h-14 flex-row items-center gap-3 rounded-field border bg-surface-raised px-4 active:opacity-80',
          error ? 'border-primary-text' : 'border-line-strong',
        )}
      >
        <CalendarIcon size={20} color={colors.brand} />
        <Text tone={value ? 'default' : 'muted'} className="flex-1">
          {display}
        </Text>
      </Pressable>
      {error && (
        <Text variant="caption" tone="primary">
          {error}
        </Text>
      )}

      {Platform.OS === 'ios' && (
        <Sheet visible={draft !== null} onClose={() => setDraft(null)} title={label}>
          {draft && (
            <DateTimePicker
              mode="date"
              display="inline"
              value={draft}
              minimumDate={minimumDate}
              locale="fr-FR"
              themeVariant="light"
              accentColor={colors.brand}
              onValueChange={(_, date) => setDraft(date)}
            />
          )}
          <Button
            label="Valider"
            className="mt-4"
            onPress={() => {
              if (draft) onChange(toIsoDate(draft));
              setDraft(null);
            }}
          />
        </Sheet>
      )}
    </View>
  );
}

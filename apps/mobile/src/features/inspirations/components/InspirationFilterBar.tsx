import { ScrollView, View } from 'react-native';

import { Button, Chip, SearchField } from '@/ui';
import { SlidersHorizontalIcon, XIcon } from '@/ui/icons';

import {
  activeFilterCount,
  PLATFORM_FILTERS,
  TYPE_FILTERS,
  type InspirationFilters,
} from '../lib/filters';

export interface InspirationFilterBarProps {
  filters: InspirationFilters;
  onChange: (filters: InspirationFilters) => void;
  onOpenFilters: () => void;
}

const labelOf = <T extends string>(options: readonly { value: T; label: string }[], value: T) =>
  options.find((option) => option.value === value)?.label ?? value;

/** Search, the "Filtres" button, and the active filters as chips to remove one by one. */
export function InspirationFilterBar({
  filters,
  onChange,
  onOpenFilters,
}: InspirationFilterBarProps) {
  const count = activeFilterCount(filters);
  const active = [
    ...(filters.platform
      ? [
          {
            key: filters.platform,
            label: labelOf(PLATFORM_FILTERS, filters.platform),
            remove: () => onChange({ ...filters, platform: null }),
          },
        ]
      : []),
    ...filters.types.map((type) => ({
      key: type,
      label: labelOf(TYPE_FILTERS, type),
      remove: () => onChange({ ...filters, types: filters.types.filter((t) => t !== type) }),
    })),
    ...filters.cities.map((city) => ({
      key: `city-${city}`,
      label: city,
      remove: () => onChange({ ...filters, cities: filters.cities.filter((c) => c !== city) }),
    })),
  ];

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <SearchField
          value={filters.query}
          onChangeText={(query) => onChange({ ...filters, query })}
          placeholder="Lieu, ville, #hashtag"
          className="flex-1"
        />
        <Button
          label={count > 0 ? `Filtres · ${count}` : 'Filtres'}
          variant={count > 0 ? 'primary' : 'outline'}
          size="sm"
          icon={SlidersHorizontalIcon}
          onPress={onOpenFilters}
          className="min-h-12"
        />
      </View>

      {active.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {active.map(({ key, label, remove }) => (
            <Chip
              key={key}
              label={label}
              selected
              icon={XIcon}
              role="button"
              aria-label={`Retirer le filtre ${label}`}
              onPress={remove}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

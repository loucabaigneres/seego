import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Button, Chip, Sheet, Text } from '@/ui';

import {
  activeFilterCount,
  NO_FILTERS,
  PLATFORM_FILTERS,
  SORT_ORDERS,
  toggle,
  TYPE_FILTERS,
  type InspirationFilters,
} from '../lib/filters';

export interface InspirationFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: InspirationFilters;
  /** Applied at once: the footer shows the live result count. */
  onChange: (filters: InspirationFilters) => void;
  /** Cities found in the user's inspirations, most frequent first. */
  cities: string[];
  resultCount: number;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 border-b border-line py-5">
      <Text variant="label">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

/** Platform, type, city and order of "Mes inspirations". */
export function InspirationFilterSheet({
  visible,
  onClose,
  filters,
  onChange,
  cities,
  resultCount,
}: InspirationFilterSheetProps) {
  const count = activeFilterCount(filters);
  const isDefault = count === 0 && filters.sort === NO_FILTERS.sort;

  return (
    <Sheet visible={visible} onClose={onClose} title="Filtres" className="px-0">
      <ScrollView className="px-6" contentContainerClassName="pb-2">
        <Section title="Réseau">
          {PLATFORM_FILTERS.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              selected={filters.platform === value}
              onPress={() =>
                onChange({ ...filters, platform: filters.platform === value ? null : value })
              }
            />
          ))}
        </Section>

        <Section title="Type">
          {TYPE_FILTERS.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              selected={filters.types.includes(value)}
              onPress={() => onChange({ ...filters, types: toggle(filters.types, value) })}
            />
          ))}
        </Section>

        {cities.length > 0 && (
          <Section title="Ville">
            {cities.map((city) => (
              <Chip
                key={city}
                label={city}
                selected={filters.cities.includes(city)}
                onPress={() => onChange({ ...filters, cities: toggle(filters.cities, city) })}
              />
            ))}
          </Section>
        )}

        <Section title="Trier par">
          {SORT_ORDERS.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              selected={filters.sort === value}
              role="radio"
              onPress={() => onChange({ ...filters, sort: value })}
            />
          ))}
        </Section>
      </ScrollView>

      <View className="flex-row gap-3 px-6 pt-4">
        <Button
          label={count > 0 ? `Tout effacer (${count})` : 'Tout effacer'}
          variant="outline"
          disabled={isDefault}
          // The search stays: it lives outside the sheet.
          onPress={() => onChange({ ...NO_FILTERS, query: filters.query })}
          className="flex-1"
        />
        <Button
          label={
            resultCount === 0
              ? 'Aucun résultat'
              : `Voir ${resultCount} inspiration${resultCount > 1 ? 's' : ''}`
          }
          variant="cta"
          onPress={onClose}
          className="flex-[1.4]"
        />
      </View>
    </Sheet>
  );
}

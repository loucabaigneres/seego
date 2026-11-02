import { View } from 'react-native';

import { formatDate } from '@/domain/date';
import { daySummary, inPlanningOrder } from '@/domain/trip';
import { cn, Text } from '@/ui';

import type { TripDay } from '../hooks/useTrip';
import { ActivityRow } from './ActivityRow';

/** One itinerary day as a vertical route: numbered stops joined by a line. */
export function DayTimeline({ day }: { day: TripDay }) {
  const activities = inPlanningOrder(day.activities);
  const date = formatDate(day.targetDate, 'long');
  const summary = daySummary(day.activities);

  return (
    <View className="gap-4">
      <View className="gap-0.5">
        <Text variant="section" role="heading">
          Jour {day.dayIndex}
          {date !== '' && <Text variant="section" tone="muted">{` · ${date}`}</Text>}
        </Text>
        {summary !== '' && <Text variant="caption">{summary}</Text>}
      </View>

      {activities.length === 0 ? (
        <Text variant="caption" className="rounded-field bg-surface px-4 py-3">
          Aucune activité ce jour.
        </Text>
      ) : (
        <View>
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1;
            return (
              <View key={activity.id} className="flex-row gap-3">
                <View className="items-center">
                  <View className="size-7 items-center justify-center rounded-full bg-brand">
                    <Text variant="caption" className="font-sans-bold text-ink-inverse">
                      {index + 1}
                    </Text>
                  </View>
                  {!isLast && <View className="w-px flex-1 bg-line-strong" />}
                </View>
                <View className={cn('flex-1', !isLast && 'pb-4')}>
                  <ActivityRow activity={activity} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

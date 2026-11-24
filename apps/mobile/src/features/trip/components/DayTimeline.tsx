import type { ReactNode } from 'react';
import { View } from 'react-native';

import { formatDate } from '@/domain/date';
import { categoryMeta } from '@/domain/place';
import { daySummary, inPlanningOrder } from '@/domain/trip';
import { cn, Text } from '@/ui';
import { PencilSimpleIcon } from '@/ui/icons';

import type { DayEdit } from '../hooks/usePlanningDraft';
import type { TripActivity, TripDay } from '../hooks/useTrip';
import { stepLabel } from '../lib/steps';
import { ActivityRow } from './ActivityRow';
import { EditControls } from './EditControls';
import { PillButton } from './PillButton';

export interface DayTimelineProps {
  day: TripDay;
  /** Edit mode: `day` is a draft day, already in its edited order. */
  edit?: { day: DayEdit; canChangeDay: boolean; changedIds: Set<string> };
  /** Outside edit mode: opens the replacement sheet for the place at that step. */
  onReplace?: (activity: TripActivity, step: number) => void;
  /** "Modifier" next to the day's title: starts editing the whole planning. */
  onEdit?: () => void;
}

/** One itinerary day as a vertical route: numbered stops joined by a line. */
export function DayTimeline({ day, edit, onReplace, onEdit }: DayTimelineProps) {
  const activities = edit ? day.activities : inPlanningOrder(day.activities);
  const date = formatDate(day.targetDate, 'long');
  const summary = daySummary(day.activities);

  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text variant="section" role="heading">
            Jour {day.dayIndex}
            {date !== '' && <Text variant="section" tone="muted">{` · ${date}`}</Text>}
          </Text>
          {summary !== '' && <Text variant="caption">{summary}</Text>}
        </View>
        {onEdit && <PillButton label="Modifier" icon={PencilSimpleIcon} onPress={onEdit} />}
      </View>

      {activities.length === 0 ? (
        <Text variant="caption" className="rounded-field bg-surface px-4 py-3">
          Aucune activité ce jour.
        </Text>
      ) : edit ? (
        <View className="gap-2.5">
          {activities.map((activity, index) => (
            <EditRow
              key={activity.id}
              activity={activity}
              step={index + 1}
              changed={edit.changedIds.has(activity.id)}
            >
              <EditControls
                activity={activity}
                isFirst={index === 0}
                isLast={index === activities.length - 1}
                canChangeDay={edit.canChangeDay}
                edit={edit.day}
              />
            </EditRow>
          ))}
        </View>
      ) : (
        <View>
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1;
            return (
              <View key={activity.id} className="flex-row gap-3">
                <View className="w-[30px] items-center">
                  <Text variant="section" tone="brand">
                    {stepLabel(index + 1)}
                  </Text>
                  {!isLast && <View className="mt-1.5 w-px flex-1 bg-line-strong opacity-50" />}
                </View>
                <View className={cn('flex-1', !isLast && 'pb-3.5')}>
                  <ActivityRow
                    activity={activity}
                    onReplace={onReplace && (() => onReplace(activity, index + 1))}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

interface EditRowProps {
  activity: TripActivity;
  step: number;
  /** Moved since the last save: outlined on crema. */
  changed: boolean;
  children: ReactNode;
}

function EditRow({ activity, step, changed, children }: EditRowProps) {
  return (
    <View
      className={cn(
        // The border is always there, so highlighting a row does not shift its content.
        'gap-2.5 rounded-field border-[1.5px] px-3.5 py-3',
        changed ? 'border-brand bg-background' : 'border-transparent bg-surface',
      )}
    >
      <View className="flex-row items-center gap-3">
        <Text variant="section" tone="brand" className="w-7">
          {stepLabel(step)}
        </Text>
        <View className="flex-1">
          <Text variant="label">{activity.title}</Text>
          <Text variant="caption">{categoryMeta(activity.category).label}</Text>
        </View>
      </View>
      <View className="pl-10">{children}</View>
    </View>
  );
}

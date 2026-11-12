import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';
import { cn, Text } from '@/ui';
import {
  ArrowsLeftRightIcon,
  CaretDownIcon,
  CaretUpIcon,
  TrashIcon,
  type AppIcon,
} from '@/ui/icons';

import type { DayEdit } from '../hooks/usePlanningDraft';
import type { TripActivity } from '../hooks/useTrip';
import { canRelocate } from '../lib/planning-edits';
import { PillButton } from './PillButton';

export interface EditControlsProps {
  activity: TripActivity;
  isFirst: boolean;
  isLast: boolean;
  /** False on a one-day trip: there is nowhere to move to. */
  canChangeDay: boolean;
  edit: DayEdit;
}

/** Reorder / move / remove buttons of one place while the planning is being edited. */
export function EditControls({ activity, isFirst, isLast, canChangeDay, edit }: EditControlsProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <IconButton
        icon={CaretUpIcon}
        label="Monter"
        disabled={isFirst}
        onPress={() => edit.moveUp(activity.id)}
      />
      <IconButton
        icon={CaretDownIcon}
        label="Descendre"
        disabled={isLast}
        onPress={() => edit.moveDown(activity.id)}
      />

      {canRelocate(activity) ? (
        <>
          {canChangeDay && (
            <PillButton
              label="Déplacer vers…"
              icon={ArrowsLeftRightIcon}
              onPress={() => edit.openMoveToDay(activity.id)}
            />
          )}
          <IconButton icon={TrashIcon} label="Supprimer" onPress={() => edit.remove(activity.id)} />
        </>
      ) : (
        <Text variant="caption">Commun à tout le séjour</Text>
      )}
    </View>
  );
}

interface IconButtonProps {
  icon: AppIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

function IconButton({ icon: Icon, label, onPress, disabled }: IconButtonProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      className={cn(
        'size-9 items-center justify-center rounded-full border border-line-strong active:opacity-80',
        disabled && 'opacity-35',
      )}
    >
      <Icon size={18} color={colors.brand} />
    </Pressable>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { pluralize } from '@/domain/date';
import { tripDisplayTitle, tripMonogram } from '@/domain/trip-summary';
import { colors } from '@seego/ui';
import { Button, cn, Notice, Sheet, Text } from '@/ui';
import {
  CheckCircleIcon,
  HeartIcon,
  LockSimpleIcon,
  MapTrifoldIcon,
  TrashIcon,
  type AppIcon,
} from '@/ui/icons';

import type { useDeleteTrip } from '../hooks/useDeleteTrip';

function Loss({ icon: Icon, label }: { icon: AppIcon; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <Icon size={16} color={colors.brand} />
      <Text className="flex-1 font-sans text-[15px] leading-5">{label}</Text>
    </View>
  );
}

/** "Supprimer ce voyage ?": what is lost, then a checkbox before the delete button unlocks. */
export function DeleteTripSheet({ deletion }: { deletion: ReturnType<typeof useDeleteTrip> }) {
  // Keeps the trip while the closing animation plays; a new trip starts unchecked.
  const [shown, setShown] = useState(deletion.pending);
  const [opened, setOpened] = useState(deletion.pending);
  const [confirmed, setConfirmed] = useState(false);
  // Each opening starts unchecked, even for the trip closed just before.
  if (deletion.pending !== opened) {
    setOpened(deletion.pending);
    if (deletion.pending) {
      setShown(deletion.pending);
      setConfirmed(false);
    }
  }
  if (!shown) return null;

  const title = tripDisplayTitle(shown);
  return (
    <Sheet visible={deletion.pending !== null} onClose={deletion.close}>
      <View className="gap-4">
        <View className="flex-row items-center gap-3.5">
          <View
            aria-hidden
            className="size-14 -rotate-[4deg] items-center justify-center rounded-xl bg-accent"
          >
            <Text variant="section" tone="brand" className="text-[22px] leading-[22px]">
              {tripMonogram(shown)}
            </Text>
          </View>
          <View className="flex-1">
            <Text variant="overline" tone="brand" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="section" role="heading">
              Supprimer ce voyage ?
            </Text>
          </View>
        </View>

        <View className="gap-2.5 rounded-field bg-surface p-4">
          <Text variant="overline">Ce qui disparaît</Text>
          {shown.daysCount > 0 && (
            <Loss
              icon={MapTrifoldIcon}
              label={`L’itinéraire de ${pluralize(shown.daysCount, 'jour')}${shown.stepsCount > 0 ? ` et ses ${pluralize(shown.stepsCount, 'étape')}` : ''}`}
            />
          )}
          {shown.likedCount > 0 && (
            <Loss
              icon={HeartIcon}
              label={`${shown.likedCount > 1 ? 'Les' : 'Le'} ${pluralize(shown.likedCount, 'lieu liké', 'lieux likés')} de ce voyage`}
            />
          )}
          <Loss icon={LockSimpleIcon} label="Impossible de le récupérer ensuite" />
        </View>

        <Pressable
          role="checkbox"
          aria-checked={confirmed}
          onPress={() => setConfirmed((value) => !value)}
          className={cn(
            'flex-row items-center gap-3 rounded-field border-[1.5px] px-4 py-3.5 active:opacity-80',
            confirmed ? 'border-brand bg-background' : 'border-transparent bg-surface',
          )}
        >
          {confirmed ? (
            <CheckCircleIcon size={24} weight="fill" color={colors.brand} />
          ) : (
            <View className="m-px size-[22px] rounded-full border-[1.5px] border-ink-muted" />
          )}
          <Text variant="label" className="flex-1">
            Je comprends, ce voyage sera supprimé définitivement
          </Text>
        </Pressable>

        {deletion.failed && (
          <Notice message="Impossible de supprimer ce voyage pour le moment. Réessaie." />
        )}

        <View className="gap-2.5">
          <Button
            label="Supprimer le voyage"
            leading={<TrashIcon size={20} color={colors.accent} />}
            disabled={!confirmed}
            loading={deletion.isDeleting}
            onPress={deletion.confirm}
          />
          <Button label="Garder le voyage" variant="outline" onPress={deletion.close} />
        </View>
      </View>
    </Sheet>
  );
}

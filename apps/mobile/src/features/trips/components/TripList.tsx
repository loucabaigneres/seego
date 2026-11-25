import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  Button,
  EmptyState,
  ErrorState,
  SegmentedControl,
  Skeleton,
  Text,
  type Segment,
} from '@/ui';
import { colors } from '@seego/ui';
import { AirplaneIcon, CompassIcon, MapTrifoldIcon, PlusIcon, UsersThreeIcon } from '@/ui/icons';

import { useDeleteTrip } from '../hooks/useDeleteTrip';
import { useMyTrips } from '../hooks/useMyTrips';
import type { TripListItem } from '../lib/merge-trips';
import { tripsOverline } from '../lib/trip-list';
import { DeleteTripSheet } from './DeleteTripSheet';
import { TripFeatureCard, TripRow } from './TripCard';

// shortcut: user.getTrips returns every trip and the list shows them 10 at a time; paginate in the API if accounts reach hundreds of trips.
const PAGE_SIZE = 10;

type Kind = 'solo' | 'group';

function kindSegments(groupCount: number): readonly Segment<Kind>[] {
  return [
    { value: 'solo', label: 'Mes voyages' },
    { value: 'group', label: groupCount > 0 ? `Groupés · ${groupCount}` : 'Groupés' },
  ];
}

export interface TripListProps {
  /** Join or start a group trip, shown above the "Groupés" view. */
  groupActions?: ReactNode;
  /** "Join with a code" link, under the empty state of an account with no trip at all. */
  joinLink?: ReactNode;
}

/** Decorative blank ticket: where the first trip will go. */
function BlankTicket() {
  return (
    <View
      aria-hidden
      className="h-[200px] w-[250px] -rotate-3 justify-between self-center rounded-card bg-surface p-[18px]"
    >
      <View className="flex-row items-start justify-between">
        <Text variant="overline" className="text-[10px]">
          Destination à définir
        </Text>
        <View className="h-[54px] w-11 items-center justify-center rounded border-[1.5px] border-line-strong">
          <AirplaneIcon size={20} color={colors.line.strong} />
        </View>
      </View>
      <View className="gap-2">
        <Text variant="title" className="text-[30px] leading-8 text-line-strong">
          Ta prochaine escapade
        </Text>
        <Text variant="caption" className="text-[10px] tracking-[1.4px] text-line-strong">
          00.00° N
        </Text>
      </View>
    </View>
  );
}

/** No trip at all, solo or group: the blank ticket and the two ways to get a first one. */
function NoTrips({ joinLink }: { joinLink?: ReactNode }) {
  return (
    <View className="gap-12 pt-6">
      <BlankTicket />
      <View className="items-center gap-2.5">
        <Text variant="title" role="heading" className="text-center text-[30px] leading-[34px]">
          Pas encore de voyage
        </Text>
        <Text tone="muted" className="max-w-[310px] text-center">
          Lance le quiz ou swipe quelques destinations pour créer ton premier itinéraire.
        </Text>
      </View>
      <View className="items-center gap-2.5">
        <Button
          label="Découvrir des destinations"
          icon={CompassIcon}
          onPress={() => router.navigate('/')}
          className="self-stretch"
        />
        {joinLink}
      </View>
    </View>
  );
}

/** The Trips tab: title, "Mes voyages" / "Groupés" switch, the latest trip large, then the rest. */
export function TripList({ groupActions, joinLink }: TripListProps) {
  const { trips, isLoading, hasFailed, retry } = useMyTrips();
  const deletion = useDeleteTrip();
  const [kind, setKind] = useState<Kind>('solo');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shown = trips.filter((trip) => (kind === 'group') === !!trip.groupRole);
  const [featured, ...others] = shown.slice(0, visibleCount);
  const hiddenCount = Math.max(shown.length - visibleCount, 0);
  const groupCount = trips.filter((trip) => trip.groupRole).length;

  const cardProps = (trip: TripListItem) => ({
    trip,
    onDelete: () => deletion.open(trip),
    isDeleting: deletion.deletingId === trip.id,
  });

  return (
    <View className="gap-6">
      <View className="gap-1">
        {!isLoading && !hasFailed && <Text variant="overline">{tripsOverline(trips)}</Text>}
        <Text variant="title" role="heading" className="text-[42px] leading-[44px]">
          Voyages
        </Text>
      </View>

      {isLoading ? (
        <View className="gap-3" aria-busy>
          <Skeleton className="h-12 rounded-full" />
          <Skeleton className="h-[180px] rounded-card" />
          <Skeleton className="h-[68px] rounded-field" />
        </View>
      ) : hasFailed ? (
        <ErrorState
          className="flex-none"
          title="Voyages indisponibles"
          message="Impossible de charger tes voyages. Vérifie ta connexion, puis on réessaie."
          onRetry={retry}
        />
      ) : trips.length === 0 ? (
        <NoTrips joinLink={joinLink} />
      ) : (
        <>
          <SegmentedControl
            segments={kindSegments(groupCount)}
            value={kind}
            variant="soft"
            onChange={(next) => {
              setKind(next);
              setVisibleCount(PAGE_SIZE);
            }}
          />
          {kind === 'group' && groupActions}
          {!featured &&
            (kind === 'solo' ? (
              <EmptyState
                className="flex-none rounded-card bg-surface py-10"
                icon={MapTrifoldIcon}
                title="Pas encore de voyage"
                description="Lance le quiz ou swipe quelques destinations pour créer ton premier itinéraire."
                action={{
                  label: 'Découvrir des destinations',
                  onPress: () => router.navigate('/'),
                }}
              />
            ) : (
              <EmptyState
                className="flex-none rounded-card bg-surface py-10"
                icon={UsersThreeIcon}
                title="Pas encore de voyage de groupe"
                description="Rejoins un ami avec son code, ou crée un voyage de groupe et invite tes amis."
              />
            ))}
          {featured && <TripFeatureCard {...cardProps(featured)} />}
          {others.length > 0 && (
            <View className="-mt-2">
              {others.map((trip, index) => (
                <TripRow key={trip.id} index={index} {...cardProps(trip)} />
              ))}
            </View>
          )}
          {hiddenCount > 0 && (
            <Button
              label={`Voir plus de voyages (${hiddenCount})`}
              variant="text"
              onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
            />
          )}
          {kind === 'solo' && featured && (
            <Button
              label="Planifier un nouveau voyage"
              variant="outline"
              icon={PlusIcon}
              onPress={() => router.navigate('/')}
            />
          )}
        </>
      )}
      <DeleteTripSheet deletion={deletion} />
    </View>
  );
}

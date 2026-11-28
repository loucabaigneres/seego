import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { TRIP_TITLE_MAX_LENGTH } from '@/domain/trip';
import { tripDisplayTitle, tripPickerDetails } from '@/domain/trip-summary';
import { colors } from '@seego/ui';
import {
  Button,
  cn,
  EmptyState,
  ErrorState,
  IconButton,
  Notice,
  Screen,
  Skeleton,
  Text,
  TextField,
} from '@/ui';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CircleIcon,
  MapPinIcon,
  SparkleIcon,
  SuitcaseRollingIcon,
  UsersThreeIcon,
  type AppIcon,
} from '@/ui/icons';

import { useCreateGroupTrip, useSoloTrips } from '../hooks/useCreateGroupTrip';

type Mode = 'scratch' | 'existing';


function ModeCard({
  icon: Icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: AppIcon;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={`${title}. ${description}`}
      onPress={onPress}
      className={cn(
        'flex-1 gap-2.5 rounded-card p-3.5 active:opacity-80',
        selected ? 'bg-brand' : 'bg-surface',
      )}
    >
      <Icon size={24} color={selected ? colors.accent : colors.brand} />
      <Text variant="label" className={cn('text-[15px] leading-5', selected && 'text-accent')}>
        {title}
      </Text>
      <Text variant="caption" className={cn(selected && 'text-ink-inverse opacity-80')}>
        {description}
      </Text>
    </Pressable>
  );
}

/** "Un voyage existant": pick which solo trip to open to friends. */
function SoloTripPicker({
  selectedId,
  onSelect,
  onStartFromScratch,
}: {
  selectedId: string | null;
  onSelect: (tripId: string) => void;
  onStartFromScratch: () => void;
}) {
  const { trips, isLoading, hasFailed, retry } = useSoloTrips();

  if (isLoading) {
    return (
      <View className="gap-2" aria-busy>
        <Skeleton className="h-16 rounded-field" />
        <Skeleton className="h-16 rounded-field" />
      </View>
    );
  }
  if (hasFailed) {
    return (
      <ErrorState
        className="flex-none"
        title="Voyages indisponibles"
        message="Impossible de charger tes voyages. Vérifie ta connexion, puis on réessaie."
        onRetry={retry}
      />
    );
  }
  if (trips.length === 0) {
    return (
      <EmptyState
        className="flex-none rounded-card bg-surface py-8"
        icon={SuitcaseRollingIcon}
        title="Pas de voyage à ouvrir"
        description="Tu n’as pas encore de voyage solo. Pars de zéro, le groupe choisira la destination."
        action={{ label: 'Partir de zéro', onPress: onStartFromScratch }}
      />
    );
  }

  return (
    <View role="radiogroup" aria-label="Voyage à ouvrir à tes amis" className="gap-1">
      <Text variant="label" className="text-[15px] leading-5">
        Quel voyage ouvrir ?
      </Text>
      {trips.map((trip) => {
        const selected = trip.id === selectedId;
        const title = tripDisplayTitle(trip);
        return (
          <Pressable
            key={trip.id}
            role="radio"
            aria-checked={selected}
            aria-label={title}
            onPress={() => onSelect(trip.id)}
            className="flex-row items-center gap-3 border-b border-line py-3 active:opacity-80"
          >
            <View className="flex-1 gap-0.5">
              <Text variant="label" numberOfLines={1}>
                {title}
              </Text>
              <Text variant="caption">{tripPickerDetails(trip)}</Text>
            </View>
            {selected ? (
              <CheckCircleIcon size={24} color={colors.brand} weight="fill" />
            ) : (
              <CircleIcon size={24} color={colors.line.strong} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** "Partir à plusieurs": name a new group trip, or open an existing one to friends. */
export function CreateGroupTrip() {
  const [mode, setMode] = useState<Mode>('scratch');
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [tripId, setTripId] = useState<string | null>(null);
  const { create, convert, isCreating, failed } = useCreateGroupTrip();

  const canSubmit = mode === 'scratch' ? title.trim().length > 0 : !!tripId;
  const submit = () => {
    if (!canSubmit || isCreating) return;
    if (mode === 'scratch') create({ title, destination });
    else if (tripId) convert(tripId);
  };

  const footer = (
    <View className="items-center gap-2.5 px-6 pb-2 pt-3">
      <View className="flex-row items-center gap-2">
        <UsersThreeIcon size={20} color={colors.brand} />
        <Text variant="caption">Tu organises : tu invites et tu gères le groupe.</Text>
      </View>
      {failed && <Notice message="Impossible de créer le voyage de groupe. Réessaie." />}
      <Button
        label="Créer le groupe"
        variant="cta"
        loading={isCreating}
        disabled={!canSubmit}
        onPress={submit}
        className="self-stretch"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentClassName="gap-6" footer={footer}>
        <IconButton
          label="Retour"
          icon={ArrowLeftIcon}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/trips'))}
          className="-ml-2.5"
        />
        <View className="gap-2">
          <Text variant="overline" tone="brand">
            Voyage de groupe
          </Text>
          <Text variant="title" role="heading" className="text-[38px] leading-10">
            Partir à plusieurs
          </Text>
          <Text tone="muted">Crée un voyage commun : tes amis le rejoignent avec un code.</Text>
        </View>

        <View role="radiogroup" aria-label="Point de départ" className="flex-row gap-2">
          <ModeCard
            icon={SparkleIcon}
            title="Partir de zéro"
            description="Le groupe choisit la destination ensemble."
            selected={mode === 'scratch'}
            onPress={() => setMode('scratch')}
          />
          <ModeCard
            icon={SuitcaseRollingIcon}
            title="Un voyage existant"
            description="Ouvre un de tes voyages à tes amis."
            selected={mode === 'existing'}
            onPress={() => setMode('existing')}
          />
        </View>

        {mode === 'scratch' ? (
          <View className="gap-5">
            <TextField
              label="Nom du voyage"
              placeholder="Ex. Les 30 ans de Sam"
              value={title}
              onChangeText={setTitle}
              maxLength={TRIP_TITLE_MAX_LENGTH}
              counter={
                title.length > TRIP_TITLE_MAX_LENGTH - 20
                  ? `${title.length} / ${TRIP_TITLE_MAX_LENGTH}`
                  : undefined
              }
              editable={!isCreating}
              returnKeyType="next"
            />
            <TextField
              label="Destination · facultatif"
              placeholder="À définir ensemble"
              icon={MapPinIcon}
              value={destination}
              onChangeText={setDestination}
              editable={!isCreating}
              returnKeyType="go"
              onSubmitEditing={submit}
            />
          </View>
        ) : (
          <SoloTripPicker
            selectedId={tripId}
            onSelect={setTripId}
            onStartFromScratch={() => setMode('scratch')}
          />
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

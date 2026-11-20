import { router } from 'expo-router';

import { ChoiceCard } from '@/features/home/components/ChoiceCard';
import { DraftResume } from '@/features/home/components/DraftResume';
import { HomeHero } from '@/features/home/components/HomeHero';
import { useStartDirectTrip } from '@/features/home/hooks/useStartDirectTrip';
import { useMyTrips } from '@/features/trips/hooks/useMyTrips';
import { tripDisplayTitle } from '@/domain/trip-summary';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Notice, Reveal, Screen } from '@/ui';
import { CompassIcon, ShuffleIcon } from '@/ui/icons';

// Rome, the Colosseum at dusk (Unsplash License, same photo as the web home). Photo: David Köhler
const GUIDE_PHOTO =
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&h=720&q=75';

export default function HomeScreen() {
  const directTrip = useStartDirectTrip();
  const { user, isSignedIn } = useAuthSession();
  // Optional shortcut: hidden while loading or on error, the Trips tab has the full states.
  const { trips } = useMyTrips({ enabled: isSignedIn });
  const draft = trips.find((trip) => trip.status === 'draft');

  return (
    <Screen scroll edges={['top']} contentClassName="gap-6 pt-3">
      <Reveal order={0}>
        <HomeHero userName={user?.name} />
      </Reveal>

      <Reveal order={1}>
        <ChoiceCard
          featured
          icon={CompassIcon}
          photo={GUIDE_PHOTO}
          badge="Recommandé"
          eyebrow="4 questions · 1 minute"
          title="Guide-moi"
          description="Ambiance, météo, compagnie : on vise juste du premier coup."
          cta="Lancer le quiz"
          onPress={() => router.push('/onboarding')}
        />
      </Reveal>
      <Reveal order={2}>
        <ChoiceCard
          icon={ShuffleIcon}
          title="Surprends-moi"
          description="Swipe direct sur nos destinations phares."
          loadingLabel="On prépare ton deck…"
          loading={directTrip.isStarting}
          disabled={!directTrip.isReady}
          onPress={directTrip.start}
        />
      </Reveal>

      {directTrip.hasFailed && (
        <Notice message="Impossible de préparer ton deck pour le moment. Vérifie ta connexion et réessaie." />
      )}

      {draft && (
        <Reveal order={3}>
          <DraftResume
            title={draft.destination?.trim() || tripDisplayTitle(draft)}
            onPress={() =>
              router.push({ pathname: '/trip/[tripId]', params: { tripId: draft.id } })
            }
          />
        </Reveal>
      )}
    </Screen>
  );
}

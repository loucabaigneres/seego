import { HomeHero } from '@/features/home/components/HomeHero';
import { HowItWorks } from '@/features/home/components/HowItWorks';
import { SampleItinerary } from '@/features/home/components/SampleItinerary';
import { StartChoices } from '@/features/home/components/StartChoices';
import { useStartDirectTrip } from '@/features/home/hooks/useStartDirectTrip';
import { track } from '@/lib/analytics';
import { seo } from '@/lib/seo';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: 'Seego — Ton prochain voyage, trouvé en un swipe',
      description:
        "Trouve ta prochaine escapade : swipe les lieux qui t'inspirent, Seego assemble l'itinéraire, les hébergements et les trajets.",
      path: '/',
    }),
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const directTrip = useStartDirectTrip();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <HomeHero
        actions={
          <StartChoices
            onGuide={() => {
              track('trip_start_clicked', { mode: 'guided', source: 'hero' });
              navigate({ to: '/onboarding' });
            }}
            onSurprise={() => {
              track('trip_start_clicked', { mode: 'surprise', source: 'hero' });
              directTrip.start();
            }}
            isSurpriseLoading={directTrip.isStarting}
          />
        }
      />
      <SampleItinerary
        onStart={() => {
          track('trip_start_clicked', { mode: 'guided', source: 'sample_itinerary' });
          navigate({ to: '/onboarding' });
        }}
      />
      <HowItWorks />
    </div>
  );
}

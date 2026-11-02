import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChoiceCard } from '@/features/home/components/ChoiceCard';
import { HomeHero } from '@/features/home/components/HomeHero';
import { useStartDirectTrip } from '@/features/home/hooks/useStartDirectTrip';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const directTrip = useStartDirectTrip();

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center bg-[#F2EDE8] px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <HomeHero />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          <ChoiceCard
            featured
            icon="🎯"
            badge="Recommandé"
            title="Guide-moi"
            description="4 questions express (ambiance, météo, compagnie) pour cibler nos meilleures propositions."
            cta="Lancer le quiz"
            onClick={() => navigate({ to: '/onboarding' })}
          />
          <ChoiceCard
            icon="🎲"
            title="Surprends-moi"
            description="Envie d'explorer sans filtre ? Swipe directement sur les lieux de nos destinations phares."
            cta="Swiper directement"
            loading={directTrip.isStarting}
            loadingLabel="Préparation du deck…"
            onClick={directTrip.start}
          />
        </div>
      </div>
    </div>
  );
}

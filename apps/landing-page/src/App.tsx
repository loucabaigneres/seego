import { Analytics } from '@vercel/analytics/react';
import { ArrowRight } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { BoardingPass } from './components/BoardingPass';
import { ConsentBanner } from './components/ConsentBanner';
import { DeparturesBoard } from './components/DeparturesBoard';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { SectionNav } from './components/SectionNav';
import { useWaitlistStatus } from './lib/waitlist';
import { FeatureRail } from './sections/FeatureRail';
import { IntroHero } from './sections/IntroHero';
import { JourneyHero } from './sections/JourneyHero';
import { Manifesto } from './sections/Manifesto';
import { SurveySection } from './sections/SurveySection';
import { TakeoffReel } from './sections/TakeoffReel';
import { useSmoothScroll } from './sections/useSmoothScroll';

const SECTIONS = [
  { id: 'top', label: 'Accueil' },
  { id: 'manifeste', label: 'Manifeste' },
  { id: 'voyage', label: 'Le voyage' },
  { id: 'escales', label: 'L’app' },
  { id: 'departs', label: 'Départs' },
  { id: 'avis', label: 'Ton avis' },
  { id: 'decollage', label: 'Décollage' },
  { id: 'faq', label: 'FAQ' },
  { id: 'embarquement', label: 'Embarquement' },
];

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-18 items-center justify-center bg-background/80 px-5 backdrop-blur-md sm:px-8">
      <a href="#top" className="group flex items-center gap-1.5">
        <span className="text-xl font-extrabold tracking-tight text-ink">Seego</span>
        <span className="h-2 w-2 rounded-full bg-cta transition group-hover:scale-125" />
      </a>
      {/* The logo stays centred; the call to action sits on the right */}
      <a
        href="#embarquement"
        className="group absolute right-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-ink-inverse transition hover:bg-cta hover:text-ink sm:right-8 sm:px-4 sm:py-2.5"
      >
        Me prévenir
        <ArrowRight
          className="hidden h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:block"
          aria-hidden="true"
        />
      </a>
    </header>
  );
}

/**
 * Seego landing page: smooth scroll, opening promise, scroll-lit manifesto, a pinned 3D journey,
 * sideways rail, departures board, survey, plane window and boarding pass.
 */
export default function App() {
  const { joinedEmail, markJoined } = useWaitlistStatus();
  const lenis = useSmoothScroll();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-background">
        <Header />
        <main>
          <IntroHero joinedEmail={joinedEmail} onJoined={markJoined} />
          <Manifesto />
          <JourneyHero />
          <FeatureRail />
          <DeparturesBoard />
          <SurveySection />
          <TakeoffReel>
            <Faq />
          </TakeoffReel>
          <BoardingPass joinedEmail={joinedEmail} onJoined={markJoined} />
        </main>
        <Footer />
        <SectionNav sections={SECTIONS} />
        <ScrollToTop
          onScrollTop={() =>
            lenis.current
              ? lenis.current.scrollTo(0, { duration: 1.8 })
              : window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        />
        <ConsentBanner />
        <Analytics />
      </div>
    </MotionConfig>
  );
}

import { Analytics } from '@vercel/analytics/react';
import { MotionConfig } from 'motion/react';
import { BoardingPass } from './components/BoardingPass';
import { ConsentBanner } from './components/ConsentBanner';
import { DeparturesBoard } from './components/DeparturesBoard';
import { Faq } from './components/Faq';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { GlobeSection } from './components/globe/GlobeSection';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScrollToTop } from './components/ScrollToTop';
import { SectionNav } from './components/SectionNav';
import { useWaitlistStatus } from './lib/waitlist';

export default function App() {
  const { joinedEmail, markJoined } = useWaitlistStatus();

  return (
    // reducedMotion="user": scroll reveals drop their movement when the OS asks for less motion.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-cream">
        <Header />
        <main>
          <Hero joinedEmail={joinedEmail} onJoined={markJoined} />
          <DeparturesBoard />
          <GlobeSection />
          <Features />
          <Faq />
          <BoardingPass joinedEmail={joinedEmail} onJoined={markJoined} />
        </main>
        <Footer />
        <SectionNav />
        <ScrollToTop />
        <ConsentBanner />
        <Analytics />
      </div>
    </MotionConfig>
  );
}

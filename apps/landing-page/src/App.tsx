import { Analytics } from '@vercel/analytics/react';
import { ConsentBanner } from './components/ConsentBanner';
import { CtaBand } from './components/CtaBand';
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
    <div className="min-h-screen overflow-x-clip bg-cream">
      <Header />
      <main>
        <Hero joinedEmail={joinedEmail} onJoined={markJoined} />
        <DeparturesBoard />
        <GlobeSection />
        <Features />
        <Faq />
        <CtaBand joinedEmail={joinedEmail} onJoined={markJoined} />
      </main>
      <Footer />
      <SectionNav />
      <ScrollToTop />
      <ConsentBanner />
      <Analytics />
    </div>
  );
}

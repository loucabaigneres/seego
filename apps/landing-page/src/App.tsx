import { Analytics } from '@vercel/analytics/react';
import { ConsentBanner } from './components/ConsentBanner';
import { CtaBand } from './components/CtaBand';
import { Faq } from './components/Faq';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScrollToTop } from './components/ScrollToTop';
import { ROUTES } from './lib/legal';
import { useWaitlistStatus } from './lib/waitlist';
import { LegalNotice } from './pages/LegalNotice';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

// No router: the site has only a handful of pages, and Vercel rewrites every path to
// index.html, so the current pathname is enough to pick the page (links do a full load).
const path = window.location.pathname.replace(/\/+$/, '') || ROUTES.home;

function Home() {
  const { joinedEmail, markJoined } = useWaitlistStatus();

  return (
    <>
      <Hero joinedEmail={joinedEmail} onJoined={markJoined} />
      <Features />
      <Faq />
      <CtaBand joinedEmail={joinedEmail} onJoined={markJoined} />
    </>
  );
}

function Page() {
  switch (path) {
    case ROUTES.privacy:
      return <PrivacyPolicy />;
    case ROUTES.legalNotice:
      return <LegalNotice />;
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>
        <Page />
      </main>
      <Footer />
      <ScrollToTop />
      <ConsentBanner />
      <Analytics />
    </div>
  );
}

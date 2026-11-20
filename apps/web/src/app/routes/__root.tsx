import { ConsentBanner } from '@/components/layout/ConsentBanner';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { GroupTripPopover } from '@/features/group-trip/components/GroupTripPopover';
import { useAnalyticsIdentity } from '@/hooks/useAnalyticsIdentity';
import { useClaimGuestTrips } from '@/hooks/useClaimGuestTrips';
import { DEFAULT_DESCRIPTION, seo } from '@/lib/seo';
import { createRootRoute, HeadContent, Outlet, useLocation } from '@tanstack/react-router';

export const Route = createRootRoute({
  // Defaults for every page; each route overrides what it needs.
  head: () =>
    seo({
      title: 'Seego — Ton prochain voyage, trouvé en un swipe',
      description: DEFAULT_DESCRIPTION,
      path: '/',
      canonical: false,
    }),
  component: RootLayout,
});

function RootLayout() {
  useClaimGuestTrips();
  useAnalyticsIdentity();
  // The swipe deck fills the viewport exactly, a footer would only add a useless scroll.
  const showFooter = useLocation().pathname !== '/discovery';

  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      {/* Keeps <head> in sync with the active route */}
      <HeadContent />
      <Navbar userActions={<GroupTripPopover />} />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
      <ConsentBanner />
    </div>
  );
}

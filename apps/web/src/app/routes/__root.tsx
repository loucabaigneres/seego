import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import { Navbar } from '@/components/layout/Navbar';
import { GroupTripPopover } from '@/features/group-trip/components/GroupTripPopover';
import { DEFAULT_DESCRIPTION, seo } from '@/lib/seo';
import { useClaimGuestTrips } from '@/hooks/useClaimGuestTrips';

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

  return (
    <div className="min-h-screen bg-[#F2EDE8] text-[#1a1a1a]">
      {/* Keeps <head> in sync with the active route */}
      <HeadContent />
      <Navbar userActions={<GroupTripPopover />} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

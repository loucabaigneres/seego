import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { useClaimGuestTrips } from '../hooks/useClaimGuestTrips';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  useClaimGuestTrips();

  return (
    <div className="min-h-screen bg-[#F2EDE8] text-[#1a1a1a]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

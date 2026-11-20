import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminSession, signOut } from '@/lib/auth-client';

/**
 * Pathless layout guarding the whole back-office: only Better Auth sessions with the
 * 'admin' role get through. This is a UX guard; the API enforces it with `adminProcedure`.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (!session) throw redirect({ to: '/login' });
    return { user: session.user };
  },
  component: AuthedLayout,
});

const NAV_LINKS = [
  { to: '/waitlist', label: 'Waitlist' },
  { to: '/admins', label: 'Administrateurs' },
] as const;

function AuthedLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    await navigate({ to: '/login' });
  };

  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span className="type-label text-primary">Seego Admin</span>
            <nav className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.to}
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link
                      to={link.to}
                      activeProps={{ 'aria-current': 'page', className: 'bg-muted' }}
                    />
                  }
                >
                  {link.label}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
              <LogOut data-icon="inline-start" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </>
  );
}

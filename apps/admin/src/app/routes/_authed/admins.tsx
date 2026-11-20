import { createFileRoute } from '@tanstack/react-router';
import { AdminsPage } from '@/features/admins/components/AdminsPage';

export const Route = createFileRoute('/_authed/admins')({
  component: AdminsRoute,
});

function AdminsRoute() {
  const { user } = Route.useRouteContext();
  return <AdminsPage currentUserId={user.id} />;
}

import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getAdminSession } from '@/lib/auth-client';

export const Route = createFileRoute('/login')({
  // Already signed in as an admin: go straight to the back-office.
  beforeLoad: async () => {
    if (await getAdminSession()) throw redirect({ to: '/waitlist' });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm onSuccess={() => void navigate({ to: '/waitlist' })} />
    </div>
  );
}

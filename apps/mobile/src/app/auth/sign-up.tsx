import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

export default function SignUpScreen() {
  return (
    <AuthLayout tab="sign-up" title="Bienvenue à bord.">
      <SignUpForm />
    </AuthLayout>
  );
}

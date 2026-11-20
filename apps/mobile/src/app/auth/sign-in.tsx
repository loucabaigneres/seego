import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { SignInForm } from '@/features/auth/components/SignInForm';

export default function SignInScreen() {
  return (
    <AuthLayout tab="sign-in" title="Bon retour, voyageur.">
      <SignInForm />
    </AuthLayout>
  );
}

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordScreen() {
  return (
    <AuthLayout
      overline="Ça arrive aux meilleurs"
      title="Mot de passe oublié ?"
      subtitle="Donne ton email : on t’envoie un lien pour en choisir un nouveau."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

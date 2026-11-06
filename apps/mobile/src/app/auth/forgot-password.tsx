import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordScreen() {
  return (
    <AuthLayout
      overline="Mot de passe oublié"
      title="Pas de panique"
      subtitle="Indique ton adresse email, on t’envoie un lien de réinitialisation."
      switchPrompt="Tu t’en souviens ?"
      switchCta="Retour à la connexion"
      switchHref="/auth/sign-in"
      showGoogle={false}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

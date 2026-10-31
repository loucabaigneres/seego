import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { AuthCard } from './AuthCard';
import { AuthField } from './AuthField';
import { SubmitButton } from './SubmitButton';

/** Asks for an e-mail address and sends the password reset link. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle={
        sent ? undefined : "Indique ton adresse email, on t'envoie un lien de réinitialisation."
      }
      footer={
        <Link to="/login" className="font-bold text-[#FF4D4D] hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      {sent ? (
        <p className="mt-4 text-sm text-[#555]">
          Si un compte existe avec cette adresse, tu vas recevoir un email avec un lien pour choisir
          un nouveau mot de passe.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AuthField label="Email" type="email" value={email} onChange={setEmail} />
          <SubmitButton loading={loading} label="Envoyer le lien" loadingLabel="Envoi en cours…" />
        </form>
      )}
    </AuthCard>
  );
}

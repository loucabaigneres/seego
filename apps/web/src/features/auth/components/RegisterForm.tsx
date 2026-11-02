import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import { AuthCard } from './AuthCard';
import { AuthField } from './AuthField';
import { SubmitButton } from './SubmitButton';
import { VerifyEmailModal } from './VerifyEmailModal';

const PASSWORD_MIN_LENGTH = 8;

export function RegisterForm({ redirect }: { redirect: string | undefined }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const { submit, goNext, stopLoading, setError, error, loading } = useAuthSubmit(redirect);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(
      (fetchOptions) => authClient.signUp.email({ name, email, password, fetchOptions }),
      {
        // The account exists but must confirm its e-mail with a code before signing in.
        onSuccess: () => {
          stopLoading();
          setShowVerify(true);
        },
      },
    );
  };

  const handleVerified = async () => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setShowVerify(false);
      setError(result.error.message ?? 'Email confirmé, mais connexion impossible. Connecte-toi.');
      return;
    }
    goNext();
  };

  return (
    <>
      <AuthCard
        title="Inscription"
        subtitle="Crée un compte pour sauvegarder tes itinéraires."
        error={error}
        footer={
          <>
            Déjà un compte ?{' '}
            <Link
              to="/login"
              search={{ redirect }}
              className="font-bold text-[#FF4D4D] hover:underline"
            >
              Se connecter
            </Link>
          </>
        }
      >
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <AuthField label="Nom complet" type="text" value={name} onChange={setName} />
          <AuthField label="Email" type="email" value={email} onChange={setEmail} />
          <AuthField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            minLength={PASSWORD_MIN_LENGTH}
          />
          <SubmitButton
            loading={loading}
            label="Créer mon compte"
            loadingLabel="Création en cours…"
          />
        </form>
      </AuthCard>

      {showVerify && (
        <VerifyEmailModal
          email={email}
          onVerified={handleVerified}
          onClose={() => setShowVerify(false)}
        />
      )}
    </>
  );
}

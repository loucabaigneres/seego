import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import { AuthCard } from './AuthCard';
import { AuthField } from './AuthField';
import { SubmitButton } from './SubmitButton';
import { VerifyEmailModal } from './VerifyEmailModal';

export function LoginForm({ redirect }: { redirect: string | undefined }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const { submit, goNext, fail, stopLoading, setError, error, loading } = useAuthSubmit(redirect);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit((fetchOptions) => authClient.signIn.email({ email, password, fetchOptions }), {
      // An account whose e-mail is not confirmed yet gets a fresh code instead of an error.
      onError: async (ctx) => {
        if (ctx.error.code === 'EMAIL_NOT_VERIFIED') {
          await authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' });
          setShowVerify(true);
          stopLoading();
        } else {
          fail(ctx.error.message);
        }
      },
    });
  };

  const handleVerified = async () => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setShowVerify(false);
      setError(result.error.message ?? 'Email confirmé, mais connexion impossible. Réessaie.');
      return;
    }
    goNext();
  };

  return (
    <>
      <AuthCard
        title="Connexion"
        subtitle="Connecte-toi pour retrouver et enregistrer tes voyages."
        error={error}
        footer={
          <>
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              search={{ redirect }}
              className="font-bold text-[#FF4D4D] hover:underline"
            >
              Créer un compte
            </Link>
          </>
        }
      >
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <AuthField label="Email" type="email" value={email} onChange={setEmail} />
          <AuthField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            hint={
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#FF4D4D] hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            }
          />
          <SubmitButton loading={loading} label="Se connecter" loadingLabel="Connexion en cours…" />
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

import { Link, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { AuthCard } from './AuthCard';
import { AuthField } from './AuthField';
import { SubmitButton } from './SubmitButton';

const PASSWORD_MIN_LENGTH = 8;

interface ResetPasswordFormProps {
  /** Token from the reset link; missing when the link is malformed. */
  token: string | undefined;
  /** Error code appended to the link by the API (e.g. an expired token). */
  linkError: string | undefined;
}

/** Chooses a new password from a reset link. */
export function ResetPasswordForm({ token, linkError }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);

    const result = await authClient.resetPassword({ newPassword: password, token });

    if (result.error) {
      setError(result.error.message ?? 'Une erreur est survenue.');
      setLoading(false);
      return;
    }

    navigate({ to: '/login' });
  };

  if (!token || linkError) {
    return (
      <AuthCard
        title="Nouveau mot de passe"
        footer={
          <Link to="/forgot-password" className="font-bold text-[#FF4D4D] hover:underline">
            Refaire une demande
          </Link>
        }
      >
        <p className="mt-4 text-sm text-[#555]">
          Ce lien est invalide ou a expiré. Fais une nouvelle demande de réinitialisation.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisis un nouveau mot de passe pour ton compte."
      error={error}
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <AuthField
          label="Nouveau mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          minLength={PASSWORD_MIN_LENGTH}
        />
        <SubmitButton loading={loading} label="Valider" loadingLabel="Enregistrement…" />
      </form>
    </AuthCard>
  );
}

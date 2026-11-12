import { useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';

import { authErrorMessage } from '../lib/errors';
import { finishSignIn } from '../lib/navigation';
import { OTP_LENGTH, sanitizeOtp } from '../lib/otp';

const RESEND_DELAY_S = 30;

interface Credentials {
  email: string;
  password: string;
}

/**
 * Confirms an e-mail address with the 6-digit code the API sends, then signs in with the
 * credentials just typed (kept in memory only). `onSignInFailed` reports a sign-in that fails
 * after a valid code, back on the form.
 */
export function useEmailVerification({
  onSignInFailed,
}: {
  onSignInFailed: (message: string) => void;
}) {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  /** Opens the code step; the API has just sent a code. */
  const open = (next: Credentials) => {
    setCredentials(next);
    setCode('');
    setError(null);
    setInfo(null);
    setCooldown(RESEND_DELAY_S);
  };

  const close = () => setCredentials(null);

  const verify = async (otp: string) => {
    if (!credentials) return;
    setIsVerifying(true);
    setError(null);
    setInfo(null);
    try {
      const verified = await authClient.emailOtp.verifyEmail({ email: credentials.email, otp });
      if (verified.error) {
        setError(authErrorMessage(verified.error));
        setCode('');
        return;
      }
      const signedIn = await authClient.signIn.email(credentials);
      close();
      if (signedIn.error) {
        onSignInFailed(
          // Signing up again with an existing, unconfirmed e-mail "succeeds" without changing its
          // password (Better Auth hides which e-mails have an account): the first one still holds.
          signedIn.error.code === 'INVALID_EMAIL_OR_PASSWORD'
            ? 'Ton email est confirmé, mais ce compte existait déjà avec un autre mot de passe. Connecte-toi avec celui-ci, ou passe par « Mot de passe oublié ».'
            : 'Email confirmé, mais connexion impossible. Connecte-toi.',
        );
        return;
      }
      await finishSignIn();
    } catch {
      setError(authErrorMessage(null));
    } finally {
      setIsVerifying(false);
    }
  };

  const changeCode = (raw: string) => {
    const next = sanitizeOtp(raw);
    setCode(next);
    setError(null);
    if (next.length === OTP_LENGTH) void verify(next);
  };

  const resend = async () => {
    if (!credentials || cooldown > 0) return;
    setError(null);
    setInfo(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: credentials.email,
      type: 'email-verification',
    });
    if (sendError) {
      setError('Impossible d’envoyer le code. Réessaie dans un instant.');
      return;
    }
    setInfo('Un nouveau code vient de t’être envoyé.');
    setCooldown(RESEND_DELAY_S);
  };

  return {
    isOpen: credentials !== null,
    email: credentials?.email ?? '',
    code,
    changeCode,
    error,
    info,
    isVerifying,
    cooldown,
    resend,
    open,
    close,
  };
}

export type EmailVerification = ReturnType<typeof useEmailVerification>;

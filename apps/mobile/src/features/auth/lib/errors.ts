export interface AuthError {
  code?: string;
  message?: string;
  status?: number;
}

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Email ou mot de passe incorrect.',
  INVALID_EMAIL: 'Cet email ne semble pas valide.',
  INVALID_PASSWORD: 'Mot de passe incorrect.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cet email. Connecte-toi plutôt.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Un compte existe déjà avec cet email. Connecte-toi plutôt.',
  PASSWORD_TOO_SHORT: 'Ton mot de passe est trop court.',
  PASSWORD_TOO_LONG: 'Ton mot de passe est trop long.',
  INVALID_OTP: 'Code invalide.',
  OTP_EXPIRED: 'Code expiré.',
  TOO_MANY_ATTEMPTS: 'Trop de tentatives. Demande un nouveau code.',
  INVALID_ORIGIN: "L'app n'est pas autorisée par le serveur. Préviens l'équipe.",
  // Apple / Google identity token sign-in.
  INVALID_TOKEN: 'La connexion a échoué. Réessaie.',
  // Also raised when the account or session cannot be created: only `account not linked`
  // (below) means an e-mail account already exists.
  OAUTH_LINK_ERROR: 'La connexion a échoué. Réessaie.',
};

/** Better Auth's `OAUTH_LINK_ERROR` message when the e-mail belongs to an account it won't link. */
const ACCOUNT_NOT_LINKED = 'account not linked';
const ACCOUNT_EXISTS = 'Un compte existe déjà avec cet email. Connecte-toi avec ton mot de passe.';

const FALLBACK = 'Impossible de te connecter pour le moment. Vérifie ta connexion et réessaie.';
const TOO_MANY_REQUESTS = 'Trop de tentatives. Patiente une minute avant de réessayer.';

export function authErrorMessage(error: AuthError | null | undefined): string {
  if (error?.status === 429) return TOO_MANY_REQUESTS;
  if (error?.code === 'OAUTH_LINK_ERROR' && error.message === ACCOUNT_NOT_LINKED) {
    return ACCOUNT_EXISTS;
  }
  return (error?.code && MESSAGES[error.code]) || FALLBACK;
}

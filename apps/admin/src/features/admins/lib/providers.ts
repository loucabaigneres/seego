const PROVIDER_LABELS: Record<string, string> = {
  credential: 'E-mail + mot de passe',
  google: 'Google',
  apple: 'Apple',
};

/** Human labels for Better Auth `account.providerId` values. */
export function providerLabel(providerId: string) {
  return PROVIDER_LABELS[providerId] ?? providerId;
}

/** Same comparison as the API: case and surrounding spaces are ignored. */
export function sameEmail(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

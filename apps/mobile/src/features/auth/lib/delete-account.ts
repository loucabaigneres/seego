import { isAppleCancel } from './apple';

/** Word to type to confirm; the API refuses anything else. */
export const DELETE_CONFIRMATION = 'SUPPRIMER';

/** Accepts the word whatever the case or surrounding spaces: what counts is the intent. */
export function isDeleteConfirmed(typed: string): boolean {
  return typed.trim().toUpperCase() === DELETE_CONFIRMATION;
}

/** The API answers `PRECONDITION_FAILED` when the session is too old to delete the account. */
export function isReauthRequired(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { data?: { code?: unknown } | null }).data?.code === 'PRECONDITION_FAILED'
  );
}

export interface AccountDeletionDeps {
  /** Whether the account signs in with Apple (its Apple token must then be revoked). */
  hasAppleAccount: () => Promise<boolean>;
  /** Native Apple sheet; `null` where Sign in with Apple is not available (Android, web). */
  requestAppleAuthorizationCode: (() => Promise<string | null>) | null;
  deleteAccount: (appleAuthorizationCode: string | undefined) => Promise<unknown>;
  /** Drops the local session and account data: the server one is already gone. */
  signOutLocally: () => Promise<void>;
}

export type AccountDeletionOutcome =
  | { status: 'deleted' }
  | { status: 'cancelled' }
  | { status: 'reauth-required' }
  | { status: 'failed' };

/**
 * Deletes the account from the device. An Apple account first re-authorizes with Apple: the
 * one-time code lets the API revoke the Apple token, and doubles as a last confirmation.
 * Never throws.
 */
export async function runAccountDeletion(
  deps: AccountDeletionDeps,
): Promise<AccountDeletionOutcome> {
  let appleAuthorizationCode: string | undefined;
  try {
    if (deps.requestAppleAuthorizationCode && (await deps.hasAppleAccount())) {
      appleAuthorizationCode = (await deps.requestAppleAuthorizationCode()) ?? undefined;
    }
  } catch (error) {
    if (isAppleCancel(error)) return { status: 'cancelled' };
    // Apple unavailable: delete anyway, the API skips the revocation.
  }

  try {
    await deps.deleteAccount(appleAuthorizationCode);
  } catch (error) {
    return isReauthRequired(error) ? { status: 'reauth-required' } : { status: 'failed' };
  }

  try {
    await deps.signOutLocally();
  } catch {
    // The account no longer exists: a stale local session cannot reach anything.
  }
  return { status: 'deleted' };
}

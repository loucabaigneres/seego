import { useCallback, useState } from 'react';
import { trpc } from './trpc';

// sessionStorage (not localStorage): the "already joined" hint should only last
// for the current tab/session, not be kept around for days.
const STORAGE_KEY = 'seego_waitlist_email';

/** Pragmatic email check — good enough to catch typos without rejecting valid addresses. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function readStoredEmail(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeEmail(email: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, email);
  } catch {
    // Private mode / storage disabled — non blocking.
  }
}

/**
 * Reads marketing attribution from the current URL / navigation context.
 *
 * `utm_content` falls back to the form's position (hero vs. footer) so we can
 * compare the conversion of the two sign-up forms even without a campaign URL.
 */
function collectAttribution(position: string) {
  const params = new URLSearchParams(window.location.search);
  const get = (key: string) => params.get(key)?.trim() || undefined;

  return {
    utmSource: get('utm_source'),
    utmMedium: get('utm_medium'),
    utmCampaign: get('utm_campaign'),
    utmTerm: get('utm_term'),
    utmContent: get('utm_content') ?? position,
    referrer: document.referrer || undefined,
    landingPageUrl: window.location.href,
  };
}

/**
 * Submits a waitlist sign-up through tRPC (type-safe, end-to-end).
 * `position` identifies which form was used ('hero' | 'footer').
 */
export async function submitWaitlist(email: string, position: string): Promise<void> {
  const normalized = email.trim().toLowerCase();

  await trpc.waitlist.join.mutate({
    email: normalized,
    ...collectAttribution(position),
  });

  storeEmail(normalized);
}

/** Tracks whether this visitor has already joined the waitlist (persisted for the session). */
export function useWaitlistStatus() {
  // Client-only SPA: reading sessionStorage lazily at init is safe (no SSR hydration).
  const [joinedEmail, setJoinedEmail] = useState<string | null>(() => readStoredEmail());

  const markJoined = useCallback((email: string) => {
    setJoinedEmail(email.trim().toLowerCase());
  }, []);

  return { joinedEmail, markJoined };
}

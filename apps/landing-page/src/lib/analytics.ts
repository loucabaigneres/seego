import posthog from 'posthog-js';
import { useSyncExternalStore } from 'react';
import { env } from '../env';

export type ConsentStatus = 'pending' | 'granted' | 'denied';

const posthogKey = env.VITE_POSTHOG_KEY;

/** Tracking only exists in production builds that were given a PostHog key. */
export const analyticsEnabled = import.meta.env.PROD && !!posthogKey;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * Starts PostHog in opted-out mode: nothing is captured and no cookie/localStorage entry
 * is written until the visitor accepts the consent banner (GDPR / ePrivacy).
 */
export function initAnalytics(): void {
  if (!analyticsEnabled || !posthogKey) return;

  posthog.init(posthogKey, {
    api_host: env.VITE_POSTHOG_HOST,
    defaults: '2026-01-30', // pageviews, autocapture and anonymous-profile defaults
    opt_out_capturing_by_default: true,
  });
}

/** Records a custom event. A no-op when tracking is off or the visitor has not consented. */
export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!analyticsEnabled) return;
  posthog.capture(name, properties);
}

export function acceptAnalytics(): void {
  posthog.opt_in_capturing();
  notify();
}

export function refuseAnalytics(): void {
  posthog.opt_out_capturing();
  notify();
}

/** Forgets the stored choice so the banner asks again ("Gérer mes cookies"). */
export function resetConsent(): void {
  posthog.clear_opt_in_out_capturing();
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getConsent(): ConsentStatus {
  return analyticsEnabled ? posthog.get_explicit_consent_status() : 'denied';
}

/** The visitor's current consent choice, kept in sync with PostHog. */
export function useConsent(): ConsentStatus {
  return useSyncExternalStore(subscribe, getConsent, getConsent);
}

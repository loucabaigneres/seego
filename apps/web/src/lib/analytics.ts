import { env } from '@/config/env';
import { type FirstTouch, firstTouch, firstTouchKeys } from '@/lib/attribution';
import posthog from 'posthog-js';
import { useSyncExternalStore } from 'react';

export type ConsentStatus = 'pending' | 'granted' | 'denied';

/** Tracking only exists in production builds that were given a PostHog key. */
export const analyticsEnabled = import.meta.env.PROD && !!env.VITE_POSTHOG_KEY;

/**
 * Every custom event the web app sends, with its properties. Event names are the contract
 * with the PostHog funnels and dashboards ("Seego Web — …"): rename one here and there.
 * Never put e-mail addresses or other personal data in these properties.
 */
export interface AnalyticsEvents {
  // Start of the journey (home page)
  trip_start_clicked: { mode: 'guided' | 'surprise'; source: 'hero' | 'sample_itinerary' };
  // "Guide-moi" quiz
  onboarding_step_completed: { step: number; total_steps: number; question: string };
  onboarding_completed: Record<string, never>;
  onboarding_failed: { message: string };
  // Swipe deck
  discovery_card_swiped: { liked: boolean; position: number; likes: number };
  discovery_card_detail_opened: { position: number };
  discovery_result_viewed: { likes: number; skips: number; trigger: 'goal' | 'manual' };
  discovery_restarted: { swipes: number };
  discovery_trip_saved: { likes: number; skips: number };
  // Trip configuration form and itinerary
  trip_configured: { duration_days: number; travelers: number; is_new_trip: boolean };
  trip_configuration_failed: { message: string };
  itinerary_generated: { source: 'trip_page' };
  itinerary_edited: Record<string, never>;
  activity_replaced: Record<string, never>;
  trip_pdf_downloaded: Record<string, never>;
  trip_save_clicked: { is_logged_in: boolean };
  trip_saved_to_account: Record<string, never>;
  trip_renamed: Record<string, never>;
  // Account
  signup_completed: { method: 'email' };
  email_verified: Record<string, never>;
  login_completed: { method: 'email' };
  logout: Record<string, never>;
  password_reset_requested: Record<string, never>;
  password_reset_completed: Record<string, never>;
  guest_trips_claimed: { count: number };
  profile_updated: Record<string, never>;
  // Group trips
  group_trip_created: Record<string, never>;
  group_invite_copied: { source: 'create_button' | 'invite_card' | 'popover' };
  group_trip_joined: { method: 'link' | 'code' };
  group_trip_join_failed: { method: 'link' | 'code'; message: string };
  group_member_removed: Record<string, never>;
  group_trip_deleted: Record<string, never>;
  // Social inspiration import
  inspiration_import_submitted: { platform: string };
  inspiration_imported: { platform: string };
  inspiration_import_failed: { platform: string; message: string };
  inspiration_added_to_trip: { count: number };
  inspiration_deleted: Record<string, never>;
}

export type AnalyticsEventName = keyof AnalyticsEvents;

/**
 * Starts PostHog in opted-out mode: nothing is captured and no cookie/localStorage entry
 * is written until the visitor accepts the consent banner (GDPR / ePrivacy).
 * A no-op in dev or when no key is configured.
 */
export function initAnalytics(): void {
  if (!analyticsEnabled || !env.VITE_POSTHOG_KEY) return;

  posthog.init(env.VITE_POSTHOG_KEY, {
    api_host: env.VITE_POSTHOG_HOST,
    defaults: '2026-01-30',
    opt_out_capturing_by_default: true,
    // Before an answer to the banner and after a refusal, events are still sent but without any
    // cookie or local storage (PostHog hashes the visitor server-side, salt rotated daily).
    // Requires cookieless mode to be enabled in the PostHog project settings.
    cookieless_mode: 'on_reject',
    // Anonymous visitors (guests) only get a person profile once they sign in.
    person_profiles: 'identified_only',
  });
  // Sent with every event: lets one PostHog project tell the web app from the landing page.
  posthog.register({ app: 'web' });
}

/** Records a custom event. A no-op when tracking is off. */
export function track<E extends AnalyticsEventName>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
): void {
  if (!analyticsEnabled) return;
  posthog.capture(event, properties);
}

/**
 * Links the current (possibly guest) browser to the signed-in account, so the funnels follow
 * one person from their first anonymous visit to their account. Only the user id is sent.
 */
export function identifyUser(userId: string, properties: { created_at?: string } = {}): void {
  if (!analyticsEnabled) return;
  if (posthog.get_distinct_id() === userId) return;
  posthog.identify(userId, { is_registered: true }, { ...storedFirstTouch(), ...properties });
}

/** The `first_*` super properties saved at consent time (survives reloads). */
function storedFirstTouch(): Partial<FirstTouch> {
  const stored: Partial<Record<keyof FirstTouch, string>> = {};
  for (const key of firstTouchKeys) {
    const value: unknown = posthog.get_property(key);
    if (typeof value === 'string') stored[key] = value;
  }
  return stored;
}

/** Forgets the identity on logout, so the next person on this device starts anonymous. */
export function resetAnalytics(): void {
  if (!analyticsEnabled) return;
  posthog.reset();
}

/** Short platform label from a social URL, never the URL itself. */
export function socialPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('instagram')) return 'instagram';
    if (host.includes('tiktok')) return 'tiktok';
    return 'other';
  } catch {
    return 'invalid';
  }
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function acceptAnalytics(): void {
  posthog.opt_in_capturing({ captureProperties: firstTouch });
  // Attached to every later event (signup, trip…), so funnels can be split by source.
  posthog.register_once(firstTouch);
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

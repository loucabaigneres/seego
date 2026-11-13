import posthog from 'posthog-js';
import { env } from '@/config/env';

/** Tracking only exists in production builds that were given a PostHog key. */
export const analyticsEnabled = import.meta.env.PROD && !!env.VITE_POSTHOG_KEY;

/** Starts PostHog. A no-op in dev or when no key is configured. */
export function initAnalytics(): void {
  if (!analyticsEnabled || !env.VITE_POSTHOG_KEY) return;

  posthog.init(env.VITE_POSTHOG_KEY, {
    api_host: env.VITE_POSTHOG_HOST,
    defaults: '2026-01-30',
  });
}

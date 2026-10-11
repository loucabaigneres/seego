import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Leads collected on the mobile-app teaser landing page (`apps/landing-page`).
 *
 * Modelled as marketing "leads" rather than plain subscribers so we can attribute
 * every sign-up to its acquisition channel. The UTM columns follow the standard
 * marketing convention; `referrer` / `landingPageUrl` give a fallback context when
 * the visitor arrived without UTM parameters. `utm_content` also lets us tell apart
 * the two sign-up forms on the page (hero vs. footer) to compare their conversion.
 *
 * `email` is unique so repeat sign-ups are idempotent (handled with
 * `onConflictDoNothing` on insert).
 */
export const waitlistLeads = pgTable(
  'waitlist_leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),

    // UTM parameters (marketing attribution)
    utmSource: varchar('utm_source', { length: 100 }), // ex: 'instagram', 'tiktok', 'linkedin', 'google'
    utmMedium: varchar('utm_medium', { length: 100 }), // ex: 'paid_social', 'organic_social', 'cpc', 'email'
    utmCampaign: varchar('utm_campaign', { length: 150 }), // ex: 'summer_launch_2026', 'beta_testers'
    utmTerm: varchar('utm_term', { length: 150 }), // ex: paid keywords or audience tag
    utmContent: varchar('utm_content', { length: 150 }), // ex: 'hero', 'footer', 'video_ad_variation_b'

    // Navigation context (useful when no UTM parameter is present)
    referrer: text('referrer'), // origin URL (ex: 'https://l.instagram.com/')
    landingPageUrl: text('landing_page_url'), // exact landing URL

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('waitlist_email_idx').on(table.email),
    index('waitlist_source_idx').on(table.utmSource),
    index('waitlist_campaign_idx').on(table.utmCampaign),
  ],
);

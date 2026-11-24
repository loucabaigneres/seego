# Seego - Landing Page

Teaser / "coming soon" landing page for **Seego** (https://www.seego.fr). Presents the
product as a scroll-driven journey (intro, manifesto, globe, app features, web app, departures
board, survey, take-off, FAQ, boarding pass) and captures e-mail sign-ups for the launch waitlist.

## Stack

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`), colours, fonts and type scale from `@seego/ui`
  (`@seego/ui/css` + `@seego/ui/fonts.css`)
- **motion** for animations, **lenis** for smooth scrolling, **three** + `d3-geo` /
  `topojson-client` / `world-atlas` for the dotted globe
- **lucide-react** for icons
- **tRPC client** for the waitlist, **PostHog** (with consent) + **Vercel Analytics**
- No router: Vercel rewrites every path to `index.html` and `App.tsx` picks the page from the
  pathname (`/`, `/confidentialite`, `/mentions-legales`)

## Development

```bash
cp .env.example .env
pnpm --filter "@seego/landing-page" dev
```

Served on **http://localhost:5174** (`strictPort`, the `web` app owns `5173`).

```bash
pnpm --filter "@seego/landing-page" build      # type-check + production build to dist/
pnpm --filter "@seego/landing-page" preview    # preview the production build
pnpm --filter "@seego/landing-page" typecheck
pnpm --filter "@seego/landing-page" lint
```

| Variable            | Notes                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `VITE_API_URL`      | Seego API, the form posts to `${VITE_API_URL}/trpc` (defaults to `http://localhost:3000`) |
| `VITE_POSTHOG_KEY`  | Public `phc_…` key. Tracking only runs in production builds with a key                    |
| `VITE_POSTHOG_HOST` | Defaults to the EU cloud (`https://eu.i.posthog.com`)                                     |

## Waitlist CTA

The e-mail form lives in [`src/components/WaitlistForm.tsx`](src/components/WaitlistForm.tsx)
and its logic in [`src/lib/waitlist.ts`](src/lib/waitlist.ts).

- Sign-ups are submitted through **tRPC** (`waitlist.join`) to the Seego API, type-safe end to
  end. The client lives in [`src/lib/trpc.ts`](src/lib/trpc.ts).
- Each sign-up is stored as a **lead** with marketing attribution: the UTM parameters
  from the URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
  plus `referrer` and `landing_page_url`.
- There are two forms, in the hero (`IntroHero`) and in the boarding pass at the end
  (`BoardingPass`). They report their position (`hero` / `footer`) as `utm_content` when no
  campaign `utm_content` is in the URL, so their conversion can be compared.
- The visitor's e-mail is kept in `sessionStorage` only: returning visitors see a confirmation
  state instead of the form for the current session, and no longer.

Leads are visible in the back-office (`apps/admin`, page Waitlist).

## Analytics

[`src/lib/analytics.ts`](src/lib/analytics.ts) starts PostHog opted out: nothing is captured and
nothing is stored until the visitor accepts the consent banner (`ConsentBanner`). Every event is
tagged `app: 'landing'`, so the web app and the landing page can share one PostHog project. The
custom events (`AnalyticsEvents` in that file) are the contract with the PostHog funnels: never
put the e-mail address in them.

## Instagram bio link

`https://www.seego.fr/ig` is a temporary redirect (in [`vercel.json`](vercel.json)) to
`/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&utm_campaign=beta_launch`, so the bio
shows a clean seego.fr link instead of a URL shortener. The source, medium and content are the
exact values Instagram appends to bio links: keep them identical, so the duplicated parameters
agree whichever comes first, while links shared outside the bio stay attributed. Only
`utm_campaign` is ours. The web app has the same `/ig` redirect (`app.seego.fr/ig`).

## Legal pages

`/mentions-legales` and `/confidentialite` read the publisher details from
[`src/lib/legal.ts`](src/lib/legal.ts). Values in `[brackets]` still have to be filled in
before going live; keep them in sync with `apps/web/src/features/legal/lib/legal.ts`.

## Structure

```text
src/
├── App.tsx                 # Header, section list, page selection (home / legal)
├── main.tsx                # Entry point
├── env.ts                  # Validated VITE_* variables
├── index.css               # Tailwind + @seego/ui tokens and fonts, animations
├── sections/               # The home page, in scroll order: IntroHero, Manifesto, JourneyHero,
│                           # JourneyGlobe, FeatureRail, WebAppSection, SurveySection, TakeoffReel…
├── components/             # WaitlistForm, BoardingPass, DeparturesBoard, Faq, ConsentBanner,
│   │                       # SectionNav, PhoneMockup, Reveal, ScrollToTop, Footer
│   ├── globe/              # Three.js globe (geometry, land dots, scene)
│   └── legal/              # Layout of the legal pages
├── pages/                  # LegalNotice, PrivacyPolicy
└── lib/                    # waitlist, trpc, analytics, legal, photos (Unsplash), useScrub
```

## Deployment

Vercel, through the **manual** workflow `.github/workflows/deploy-landing-page.yml`
(`workflow_dispatch`): it is not part of the `main` / `develop` CD. `public/` holds the favicons,
the Open Graph image, `robots.txt` and `sitemap.xml`.

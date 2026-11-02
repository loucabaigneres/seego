# @seego/landing-page

Teaser / "coming soon" landing page for **Seego**, the mobile travel app. Presents the
product and captures e-mail sign-ups for the launch waitlist.

## Stack

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`), brand tokens aligned with `apps/web`
- **lucide-react** for icons
- Single-page static site — no router, no runtime backend dependency

## Development

```bash
pnpm --filter @seego/landing-page dev
```

Served on **http://localhost:5174** (the `web` app owns `5173`).

```bash
pnpm --filter @seego/landing-page build      # type-check + production build to dist/
pnpm --filter @seego/landing-page preview     # preview the production build
pnpm --filter @seego/landing-page lint
```

## Waitlist CTA

The e-mail form lives in [`src/components/WaitlistForm.tsx`](src/components/WaitlistForm.tsx)
and its logic in [`src/lib/waitlist.ts`](src/lib/waitlist.ts).

- Sign-ups are submitted through **tRPC** (`waitlist.join`) to the Seego API — fully
  type-safe end to end. The client lives in [`src/lib/trpc.ts`](src/lib/trpc.ts); set
  `VITE_API_URL` (see [`.env.example`](.env.example)) to point at the API.
- Each sign-up is stored as a **lead** with marketing attribution: the UTM parameters
  from the URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
  plus `referrer` and `landing_page_url`.
- The two forms (hero and footer) report their position as `utm_content` when no
  campaign `utm_content` is in the URL, so their conversion can be compared.
- The visitor's e-mail is kept in `sessionStorage` only, so the confirmation state
  lasts for the current session and no longer.

Returning visitors who already joined see a confirmation state instead of the form.

## Structure

```text
src/
├── App.tsx                 # Layout + shared waitlist state
├── main.tsx                # Entry point
├── index.css               # Tailwind import + Seego brand tokens & animations
├── lib/waitlist.ts         # Validation, submission, local persistence hook
└── components/
    ├── Header.tsx
    ├── Hero.tsx            # Headline + e-mail CTA + social proof + phone mockup
    ├── WaitlistForm.tsx    # The e-mail capture form (light / dark tone)
    ├── SocialProof.tsx     # "Déjà N membres inscrits"
    ├── PhoneMockup.tsx     # Decorative app preview (swipe deck)
    ├── Features.tsx
    ├── Faq.tsx             # Accordion FAQ
    ├── CtaBand.tsx         # Secondary CTA with the waitlist form
    ├── ScrollToTop.tsx     # Floating back-to-top button
    └── Footer.tsx
```

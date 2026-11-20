# @seego/ui

Single source of truth for the Seego charte (colors, typography, radii, spacing). Pure TypeScript — no React / React Native.

- Mobile (Tailwind v3 / NativeWind): `tailwind.config.ts` uses `tailwindTheme()` from `@seego/ui/tailwind`; code imports `colors`, `fonts`… from `@seego/ui`.
- Web (Tailwind v4): `@import '@seego/ui/css'` — `src/theme.css` is generated.

After changing a token: `pnpm --filter @seego/ui generate:css` (a test fails if `theme.css` is stale).

Not covered (static files, update by hand): `apps/mobile/app.json` splash / adaptive icon background (`crema`), `apps/web/index.html` `theme-color`.

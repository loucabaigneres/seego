# Seego - Mobile

Expo (SDK 57) + Expo Router + NativeWind app. Same journey and design as `apps/web`, rebuilt for native.
Bundle ID `fr.seego.app` (iOS), package `com.seego.app` (Android), scheme `seego://`.

## Run

Expo Go is not supported: fonts are embedded natively (`expo-font` config plugin) and Sign in with
Apple and maps are native modules. You need a **development build**.

```bash
cp .env.example .env              # see the comments in the file
pnpm --filter "@seego/mobile" android   # npx expo run:android: builds, installs, starts Metro
pnpm --filter "@seego/mobile" ios       # npx expo run:ios (macOS + Xcode)
```

Once the build is installed, just start Metro: `pnpm --filter @seego/mobile start`.
Rebuild (`npx expo prebuild --clean`, then `run:android|ios`) only after changing `app.json` /
`app.config.ts` plugins, a native dependency or `GOOGLE_MAPS_API_KEY`.

| Script            | What it does                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `start`/`dev`     | Metro dev server for the development build                                                                         |
| `android` / `ios` | Native build + install + Metro                                                                                     |
| `typegen`         | Regenerates Expo Router typed routes (`.expo/types/router.d.ts`)                                                   |
| `typecheck`       | `typegen` then `tsc --noEmit`                                                                                      |
| `lint`            | ESLint (shared config, React Hooks, architecture rules)                                                            |
| `test`            | Jest (`jest-expo`): unit tests of pure logic, e.g. `pnpm --filter @seego/mobile exec jest src/domain/date.test.ts` |

### Environment

| Variable              | Notes                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | Keep `http://localhost:3000` in development: on a device or emulator, `src/lib/api-url.ts` swaps `localhost` for the IP of the machine serving Expo. Use a public URL with `expo start --tunnel`. |
| `EXPO_PUBLIC_WEB_URL` | Web app URL, opened by the "forgot password" e-mail link (must be the API's `FRONTEND_URL`)                                                                                                       |
| `GOOGLE_MAPS_API_KEY` | Android only (Maps SDK for Android), read by `app.config.ts` at prebuild. iOS uses Apple Maps                                                                                                     |

Variables are validated with Zod in `src/env.ts`.

## Authentication

The app signs in through the API's Better Auth with the `@better-auth/expo` plugin: the session
lives in SecureStore.

- **Email / password** (with OTP e-mail verification) works on every target, including a LAN IP.
- **Sign in with Apple**: iOS only, native sheet (`expo-apple-authentication`). The identity token
  is sent to the API, which checks it with `APPLE_APP_BUNDLE_IDENTIFIER`. The button is hidden
  where Apple sign-in is unavailable.
- **Google** uses the browser redirect flow, so Google must reach the API's callback
  (`<BETTER_AUTH_URL>/api/auth/callback/google`, listed in the Google Cloud Console). Google
  refuses private IPs, so:
  - **iOS simulator**: `http://localhost:3000` works as is.
  - **Android emulator or USB device**: `adb reverse tcp:3000 tcp:3000`.
  - **Physical iPhone**: expose the API through an HTTPS tunnel (e.g. `ngrok http 3000`), set the
    tunnel URL as `BETTER_AUTH_URL` (API) and `EXPO_PUBLIC_API_URL` (mobile), and add
    `<tunnel>/api/auth/callback/google` to the Google console.
- The API trusts the app scheme `seego://` and, in development, Expo dev URLs (`exp://`) and the
  web preview (`http://localhost:8081`). See `apps/api/src/lib/auth.ts`.

## Where things go

```
src/
  app/            Routes only (expo-router): (tabs) home / trips / profile, auth, onboarding,
                  discovery, inspiration, trip, join, settings. Thin screens: compose components,
                  call one feature hook.
  features/<x>/   One folder per feature: auth, onboarding, discovery, home, inspirations, trip,
                  trip-config, trips, group-trip, profile
    components/   UI specific to the feature, one component per file
    hooks/        useXxx: tRPC calls + state orchestration
    lib/          Pure functions (business rules), each with a *.test.ts
  ui/             Design-system primitives (Text, Button, Card, Chip, Sheet, states…), written
                  in-house on NativeWind: no third-party UI kit. Icons in ui/icons.ts (Phosphor)
  hooks/          Generic hooks reused across features (useAuthSession, useHardwareBack)
  domain/         Pure domain helpers shared across features (dates, places, search, trips), with tests
  lib/            tRPC client, Better Auth client, API URL resolution, storage, guest id
  env.ts          Validated environment variables
```

Colours, typography, radii and spacing come from the shared `@seego/ui` package (exposed to
NativeWind through `tailwindTheme()` in `tailwind.config.ts`): it is the only place a colour value
may appear.

## Development build: platform notes

### iOS (macOS)

Xcode with an iOS simulator. `npx expo run:ios` builds and installs; Sign in with Apple needs the
`usesAppleSignIn` capability (already in `app.json`) and a signed-in Apple ID on the simulator.

### Android (Windows)

**Prerequisites (once)**

- Android Studio (SDK + an emulator), JDK **17** (`winget install Microsoft.OpenJDK.17`): JDK 24+ breaks the CMake step.
- Windows long paths enabled (admin PowerShell, then reboot):
  `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force`
- Replace the SDK's ninja 1.10 with 1.12.1 (pnpm paths exceed 260 chars, old ninja fails with
  `build.ninja still dirty after 100 tries`): unzip `ninja-win.zip` from ninja-build v1.12.1 into
  `%LOCALAPPDATA%\Android\Sdk\cmake\3.22.1\bin`.
- `JAVA_HOME` → JDK 17 and `ANDROID_HOME` → `%LOCALAPPDATA%\Android\Sdk` (env vars or per terminal).
- For the map screens, a `GOOGLE_MAPS_API_KEY` restricted to `com.seego.app` and the keystore SHA-1.

## Rules

0. Code flows one way: **shared → features → app**, enforced by ESLint (`no-restricted-imports`).
   Shared folders (`domain`, `hooks`, `lib`, `ui`, `env.ts`) never import from `features` or `app`;
   a feature never imports another feature nor `app` (code needed by several features moves to
   the shared folders; a screen in `src/app` composes features); outside its own folder a feature
   reaches code through the `@/` alias, never `../../`.
1. No business logic in `app/` screens or in components: put it in `features/*/lib`, with a test.
2. No hard-coded colours: use token classes (`bg-primary`, `text-ink-muted`, `rounded-card`) or the values exported by `@seego/ui`.
3. API types come from `RouterOutputs` / `RouterInputs` (`@/lib/trpc`), never from relative imports into `apps/api`.
4. Every query renders its loading, error (with retry) and empty states using `@/ui`.
5. UI copy is French and uses "tu".
6. Follow the charte (DA V1, Sept. 2026): vino for actions, albicocca (`cta`) as the sparse secondary accent, no shadows,
   no emojis in the UI, icons from `@/ui/icons` (Phosphor), serif for titles, sans for actions.

# Seego — mobile

Expo (SDK 57) + Expo Router app. Same journey and design as `apps/web`, rebuilt for native.

## Run

```bash
cp .env.example .env   # then set EXPO_PUBLIC_API_URL (see comments in the file)
pnpm --filter @seego/mobile start
```

| Script      | What it does                                   |
| ----------- | ---------------------------------------------- |
| `start`     | Expo dev server (Expo Go, emulator, simulator) |
| `typecheck` | `tsc --noEmit`                                 |
| `lint`      | ESLint (shared config + React Hooks rules)     |
| `test`      | Jest (`jest-expo`) — unit tests of pure logic  |

## Where things go

```
src/
  app/            Routes only (expo-router). Thin screens: compose components, call one feature hook.
  features/<x>/   One folder per feature (onboarding, discovery, trip, …)
    components/   UI specific to the feature, one component per file
    hooks/        useXxx: tRPC calls + state orchestration
    lib/          Pure functions (business rules), each with a *.test.ts
  ui/             Design-system primitives (Text, Button, Card, Chip, Sheet, states…), written
                  in-house on NativeWind: no third-party UI kit
  hooks/          Generic hooks reused across features (useHardwareBack…)
  theme/tokens.ts Colours, radii, shadows — the only place a colour value may appear
  lib/            tRPC client, env, storage, guest id
```

## Development build (Android, Windows)

Expo Go no longer works (fonts are embedded natively by the `expo-font` config plugin).

**Prerequisites (once)**

- Android Studio (SDK + an emulator), JDK **17** (`winget install Microsoft.OpenJDK.17`): JDK 24+ breaks the CMake step.
- Windows long paths enabled (admin PowerShell, then reboot):
  `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force`
- Replace the SDK's ninja 1.10 with 1.12.1 (pnpm paths exceed 260 chars, old ninja fails with
  `build.ninja still dirty after 100 tries`): unzip `ninja-win.zip` from ninja-build v1.12.1 into
  `%LOCALAPPDATA%\Android\Sdk\cmake\3.22.1\bin`.
- `JAVA_HOME` → JDK 17 and `ANDROID_HOME` → `%LOCALAPPDATA%\Android\Sdk` (env vars or per terminal).

**Run**

```bash
npx expo run:android            # builds, installs on the emulator, starts Metro
npx expo prebuild --clean       # only after changing app.json plugins or a native dependency
```

## Rules

0. Code flows one way: **shared → features → app**, enforced by ESLint (`no-restricted-imports`).
   Shared folders (`domain`, `hooks`, `lib`, `theme`, `ui`) never import from `features` or `app`;
   a feature never imports another feature nor `app` (code needed by several features moves to
   the shared folders; a screen in `src/app` composes features); outside its own folder a feature
   reaches code through the `@/` alias, never `../../`.
1. No business logic in `app/` screens or in components: put it in `features/*/lib`, with a test.
2. No hard-coded colours: use token classes (`bg-primary`, `text-ink-muted`, `rounded-card`) or `theme/tokens`.
3. API types come from `RouterOutputs` / `RouterInputs` (`@/lib/trpc`), never from relative imports into `apps/api`.
4. Every query renders its loading, error (with retry) and empty states using `@/ui`.
5. UI copy is French and uses "tu".
6. Follow the charte (DA V1, Sept. 2026): vino for actions, albicocca (`cta`) as the sparse secondary accent, no shadows,
   no emojis in the UI, icons from `@/ui/icons` (Phosphor), serif for titles, sans for actions.

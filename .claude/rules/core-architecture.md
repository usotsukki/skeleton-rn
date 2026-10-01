---
paths:
  - src/**/*.{ts,tsx}
---

# Core Architecture

## Stack

Expo 57, React Native 0.86, React 19 (React Compiler enabled), Expo Router, NativeWind, Supabase (auth + client), Zustand (sync state), TanStack React Query (server state), Jest + RNTL.

## Source Layout & Ownership

Feature split. Folder map, hard rules, old → new path table and the per-feature playbook: `docs/source-architecture.md`.

- `src/app` — Expo Router routes and layouts only. Route files re-export a screen from a feature barrel (`export { HomeScreen as default } from '@app/features/home'`). No page logic, no repository calls.
- `src/app-shell` — root chrome: global overlays (`components/`: AppAlert, Toast, AnimatedSplash, ErrorFallback), drawer (`drawer/`), tab stack options. May import feature barrels.
- `src/features/<feature>` — `auth, home, map, settings, skia`. Screens at the feature root as `<Name>Screen.tsx`; `components/`, `hooks/`, `api/` as needed; colocated `__tests__/`. Public API via `features/<x>/index.ts` (hooks first, screens last). Private files import each other relatively.
  - `auth/api` — auth boundary; `index.ts` is the facade. `authErrorMessages.ts` maps API errors to i18n (no side effects, test in isolation from `supabase.ts`). `auth/forms.ts` holds the auth form schemas and `formOptions`.
- `src/shared` — feature-blind primitives and infrastructure. Must not import features or app-shell.
  - `ui` — pure props-driven UI kit (`AppButton`, `TextField`, `CachedList`, …). `form` — `useAppForm`, field adapters, submit behavior. `svg` — icons.
  - `hooks` — feature-blind hooks only (alert, toast, haptics, pull-to-refresh, feature flags, screen tracking, tab insets). Non-hook logic belongs in `shared/utils` or a private helper in the hook file.
  - `api/supabase` — Supabase client and session helpers (deep links for auth recovery). `database.types.ts` is generated (`yarn backend:types`); never edit it by hand.
  - `api/db` — repository errors and assertions. `api/query` — query client, persister, retry policy, slow-query watchdog.
  - `api/analytics` — PostHog boundary: the client (`posthog`, disabled without a token), typed events (`trackEvent`; add names to `events.ts`, never raw strings), the feature-flag registry (`FEATURE_FLAGS`), and `syncAnalyticsUser` (identify by user id only; sign-out reset keeps the opt-out). Flag hooks live in `shared/hooks/useFeatureFlag.ts`.
  - `env` — client env: every `EXPO_PUBLIC_*` read statically (release inlining); schema in `clientEnvSchema.ts`.
  - `storage` — MMKV instances and schema; `persistStorage.ts` (`createPersistStorage`, use it for every persisted store); `authStorage.ts` (session + auth store, AES-256 on iOS/Android with the key in Keychain/Keystore; keep secrets there, not in the plain instances).
  - `theme` — design tokens: `colors` (use `useThemeColors()` in components — no static palette), `brand.ts` (from `assets/brand/brand.json`), `themeStore.ts`.
  - `translations` — i18n resources and wiring. `utils` — generic helpers and validators (`email`, `password`).
- `src/test` — Jest setup (`setup.ts`), `render.tsx`, `queryClient.ts`.
- Constants belong next to the owning component, screen, or feature.
- Outside `src`: `metro/` (bundler-only: native-module stubs, `releaseEnvGuard`, `androidMapsConfig`; not app runtime), `supabase/` (local stack config, `migrations/` — schema source of truth; every user-owned table gets RLS by owner, see the `notes` sample — and `seed.sql`), `plugins/` (Expo config plugins), `assets/brand` (icon/splash sources → `scripts/generate-brand-assets.cjs`), `keystores/` (per-machine debug key, gitignored — `scripts/generate-debug-keystore.sh`).

Boundaries are enforced by `yarn lint:architecture` (`scripts/check-feature-boundaries.cjs`, part of `yarn check`): shared ↛ features/app-shell; features ↛ app-shell; cross-feature imports use the barrel or `/api`, `/hooks/*`, `/components/*`, `/types`, `/utils`; `src/app` and app-shell use barrels only; pre-split paths (`@app/api`, `@app/components`, `@app/hooks`, `@app/screens`, …) are denied.

## State Rules

- Default to local screen or feature stores. Feature stores live in the feature; only feature-blind stores go in `shared`.
- Server state in React Query, sync/client state in Zustand.

## Forbidden Regressions

Do not reintroduce: the layer-split trees (`src/api`, `src/components`, `src/hooks`, `src/screens`, `src/store`, `src/utils`), a single `src/types/domain.ts` god file, feature workflows in `src/shared`, non-hook modules under `shared/hooks`, or generic buckets (`common`, `misc`, `helpers`) when ownership is clear.

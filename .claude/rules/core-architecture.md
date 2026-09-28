---
paths:
  - src/**/*.{ts,tsx}
---

# Core Architecture

## Stack

Expo 57, React Native 0.86, React 19 (React Compiler enabled), Expo Router, NativeWind, Supabase (auth + client), Zustand (sync state), TanStack React Query (server state), Jest + RNTL.

## Source Layout & Ownership

- `src/app` — route files and layout wiring only. Keep thin. No page logic or repository calls.
- `src/screens` — page composition and screen orchestration.
- `src/components/shared` — pure props-driven UI only. If it depends on feature-specific hooks/stores, move it to the feature folder.
- `src/components/drawer` — app shell drawer (example of `components/<feature>`).
- `src/components/<feature>` — feature-owned workflows and UI.
- `src/features/<feature>` — optional feature module with `ui/`, `model/`, `lib/`. Add when a domain outgrows `screens` + `api` (not required in the minimal tree).
- `src/hooks` — hooks only. Non-hook logic belongs in `src/api/*`, `src/utils/*`, or as a private helper inside a hook file.
- `src/api/auth` — auth boundary. `index.ts` is the public facade. `authErrorMessages.ts` maps API errors to i18n (no side effects, test in isolation from `supabase.ts`).
- `src/api/supabase` — Supabase client, session-adjacent helpers (e.g. deep links for auth recovery). `database.types.ts` is generated (`yarn backend:types`); never edit it by hand.
- Outside `src`: `supabase/` — local stack config, `migrations/` (schema source of truth; every user-owned table gets RLS by owner, see the `notes` sample), `seed.sql` (local dev user).
- `src/api/db` — repository and storage boundaries.
- `src/api/analytics` — PostHog boundary: the client (`posthog`, disabled without a token), typed events (`trackEvent`; add names to `events.ts`, never raw strings), the feature-flag registry (`FEATURE_FLAGS`), and `syncAnalyticsUser` (identify by user id only; sign-out reset keeps the opt-out). Flag hooks live in `src/hooks/useFeatureFlag.ts`.
- `src/theme` — design tokens: `colors` (use `useThemeColors()` in components — no static palette), `brand.ts` (from `assets/brand/brand.json`).
- `src/env` — client env: every `EXPO_PUBLIC_*` read statically (release inlining); schema in `clientEnvSchema.ts`.
- `src/store` — shared Zustand stores (`themeStore`) and `createPersistStorage` (MMKV-backed `persist` storage; use it for every persisted store).
- `src/components/auth`, `src/components/svg` — auth form building blocks, SVG icons.
- `src/translations` — i18n resources and app-side translation wiring.
- `src/metro` — bundler-only files (e.g. native-module stubs for web/CI), not app runtime.
- `src/storage` — on-device storage schema and access where applicable.
- `src/types` — split by domain. Add to existing files before creating new buckets. **Optional in the minimal tree;** introduce when a domain needs shared types.
- `src/utils` — generic helpers. `src/utils/test-utils` for Jest setup and shared mocks.
- Constants belong next to the owning component, screen, or feature.
- Outside `src`: `plugins/` (Expo config plugins), `assets/brand` (icon/splash sources → `scripts/generate-brand-assets.cjs`), `keystores/` (per-machine debug key, gitignored — `scripts/generate-debug-keystore.sh`).

## State Rules

- Default to local screen or feature stores over `src/store`.
- Server state in React Query, sync/client state in Zustand.

## Forbidden Regressions

Do not reintroduce: a single `src/types/domain.ts` god file, feature workflows in `src/components/shared`, non-hook modules under `src/hooks`.

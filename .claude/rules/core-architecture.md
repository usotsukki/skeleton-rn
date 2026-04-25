---
paths:
  - src/**/*.{ts,tsx}
---

# Core Architecture

## Stack

Expo 55, React Native 0.83, React 19 (React Compiler enabled), Expo Router, NativeWind, Zustand (sync state), TanStack React Query (server state), Jest + RNTL.

## Source Layout & Ownership

- `src/app` — route files and layout wiring only. Keep thin. No page logic or repository calls.
- `src/screens` — page composition and screen orchestration.
- `src/components/shared` — pure props-driven UI only. If it depends on feature-specific hooks/stores, move it to the feature folder.
- `src/components/<feature>` — feature-owned workflows and UI.
- `src/features/<feature>` — feature module with `ui/`, `model/`, `lib/` subfolders.
- `src/hooks` — hooks only. Non-hook logic belongs in `src/api/*`, `src/utils/*`, or as a private helper inside a hook file.
- `src/api/auth` — auth boundary. `index.ts` is the public facade.
- `src/api/db` — repository and storage boundaries.
- `src/types` — split by domain. Add to existing files before creating new buckets.
- `src/utils` — generic helpers. `src/utils/test-utils` for Jest setup and shared mocks.
- Constants belong next to the owning component, screen, or feature.

## State Rules

- Default to local screen or feature stores over `src/store`.
- Server state in React Query, sync/client state in Zustand.

## Forbidden Regressions

Do not reintroduce: a single `src/types/domain.ts` god file, feature workflows in `src/components/shared`, non-hook modules under `src/hooks`.

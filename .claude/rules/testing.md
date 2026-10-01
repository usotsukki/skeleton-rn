---
paths:
  - '**/__tests__/**/*.{ts,tsx}'
  - '**/*.test.{ts,tsx}'
  - src/test/**/*
---

# Testing

- Jest with `jest-expo`, React Native Testing Library
- Shared setup: `src/test/setup.ts`
- `yarn test` sets `TZ=UTC`. If running jest directly: `TZ=UTC jest src metro scripts`.

## Harness (automatic, `setup.ts`)

- Real network is blocked: any `fetch` rejects with `Unexpected network request in a test: <url>`. Mock what the test needs.
- After each test: real timers, zustand stores back to their initial (pre-hydration) state (`__mocks__/zustand.ts`), MMKV mock emptied, TanStack online/focus managers reset, test query clients destroyed, spies restored.
- Render screens with `renderWithAppProviders` (`src/test/render.tsx`); build clients with `createTestQueryClient`.

## Async Rules (RNTL 14)

- `render`, `renderHook`, `fireEvent`, `act`, `rerender`, `unmount` are async: always `await` them (lint enforces `fireEvent`).
- Do not wrap `fireEvent` in `act()`.
- Use `waitFor` for async assertions. One assertion per `waitFor`.
- Prefer `findBy*` for elements that appear asynchronously.

## Stable Mocks

Mocked hook return values used in dependency arrays must be stable references. Unstable identities (e.g. `useTranslation().t`, toast hooks in `useEffect` deps) cause loops and flaky tests.

## Shared Mock Sources

Before adding a test-local mock, check `src/test/setup.ts`. Add reusable mocks there if multiple tests need them. Do not duplicate global mocks unless the test needs a targeted override.

## Parent Tests

For screen/container tests: mock heavy child components rather than every deep dependency. Focus on parent behavior.

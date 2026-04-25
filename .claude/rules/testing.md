---
paths:
  - '**/__tests__/**/*.{ts,tsx}'
  - '**/*.test.{ts,tsx}'
  - src/utils/test-utils/**/*
---

# Testing

- Jest with `jest-expo`, React Native Testing Library
- Shared setup: `src/utils/test-utils/setup.ts`
- Shared mocks: `src/utils/test-utils/mocks.ts` (when present)
- `yarn test` sets `TZ=UTC`. If running jest directly: `TZ=UTC jest src`.

## Async Rules

- Do not wrap `fireEvent` in `act()`.
- Use `waitFor` for async assertions. One assertion per `waitFor`.
- Prefer `findBy*` for elements that appear asynchronously.

## Stable Mocks

Mocked hook return values used in dependency arrays must be stable references. Unstable identities (e.g. `useTranslation().t`, toast hooks in `useEffect` deps) cause loops and flaky tests.

## Shared Mock Sources

Before adding a test-local mock, check `setup.ts` and `mocks.ts` in `src/utils/test-utils/`. Add reusable mocks there if multiple tests need them. Do not duplicate global mocks unless the test needs a targeted override.

## Parent Tests

For screen/container tests: mock heavy child components rather than every deep dependency. Focus on parent behavior.

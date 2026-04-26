# Expo Skeleton

A small, opinionated [Expo](https://expo.dev/) (SDK 55) + [Expo Router](https://docs.expo.dev/router/introduction/) template for building production apps. The layout separates **routes** (`src/app`), **screens** (composition and orchestration), **shared UI** (`src/components/shared`), and **data boundaries** (`src/api/*`, React Query, Zustand) so you can extend it without tearing out demo cruft.

**Stack (high level):** React 19, React Native 0.83, TypeScript, NativeWind (Tailwind), Supabase auth, TanStack React Query, Zustand, MMKV, Sentry, i18next.

Conventions and file ownership live in [`.claude/rules/core-architecture.md`](.claude/rules/core-architecture.md) (and related rule files). Treat that as the source of truth for where new code belongs.

## Prerequisites

- **Node.js** (LTS recommended)
- **Yarn Classic** v1 — `packageManager` in `package.json` is `yarn@1.22.1`
- **Xcode** (iOS) / **Android Studio** (Android) when running native dev clients
- A **.env** file at the project root (see [Environment variables](#environment-variables)) for local and EAS runs that read secrets via `dotenv -e .env`

## Install and run (dev client)

```bash
yarn
yarn start
# In another terminal, after prebuild if needed:
yarn ios
# or
yarn android
```

First time or after native dependency changes, rebuild native projects:

```bash
yarn ios:rebuild
# or
yarn android:rebuild
```

`yarn start` runs `expo start --dev-client` (custom dev client, not Expo Go only).

## Quality gate (before you merge or tag)

Yarn 1 reserves the name `yarn check` for a **different** command (lockfile / `node_modules` integrity). For this project’s **lint + tests**, run:

```bash
yarn run check
```

This runs `tsc`, ESLint, Prettier, and Jest on `src/`. Failing the gate means the tree is not in the shape this template is meant to ship.

**Other checks:**

- `yarn lint:format:check` — Prettier without writing
- `yarn duplication:check` — copy/paste report ([jscpd](https://github.com/kucherenko/jscpd))

## Environment variables

Configure via a root **`.env`** (not committed). The app reads **`EXPO_PUBLIC_*`** values at build time. Examples used in the codebase (see `src/env/index.ts` and `app.config.ts`):

| Variable (examples)                                                     | Purpose                         |
| ----------------------------------------------------------------------- | ------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`                                              | Supabase project URL            |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                                  | Supabase anon / publishable key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Sign-In (native + web)   |
| `EXPO_PUBLIC_SENTRY_DSN`                                                | Sentry (optional)               |
| `EXPO_PUBLIC_EAS_PROJECT_ID`                                            | EAS / updates                   |
| `EXPO_PUBLIC_NODE_ENV`, `EXPO_PUBLIC_ENABLE_DEV_MODE`                   | Dev / test / prod behavior      |

This template does not ship a backend. Point Supabase and OAuth credentials at **your** project and configure redirect URLs in the Supabase dashboard to match your app’s scheme and domains.

## Project layout (`src/`)

| Area                    | Role                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `src/app`               | **Routes only** — thin files that render screens; layouts for `(auth)` vs `(app)` (drawer + tabs). |
| `src/screens`           | Screen content: forms, layout, navigation hooks.                                                   |
| `src/components/shared` | Reusable, mostly props-driven UI (buttons, fields, modals, etc.).                                  |
| `src/components/drawer` | App-shell drawer content.                                                                          |
| `src/api/auth`          | Auth facade; Supabase + OAuth token helpers.                                                       |
| `src/api/supabase`      | Supabase client, deep-link handling.                                                               |
| `src/api/db`            | Data-layer errors / repository-style boundaries.                                                   |
| `src/hooks`             | Shared hooks (auth, splash, toasts, etc.).                                                         |
| `src/store`             | Zustand stores (e.g. theme) + MMKV-backed persistence where used.                                  |
| `src/theme`             | Tokens (e.g. colors).                                                                              |
| `src/translations`      | i18next JSON and wiring.                                                                           |
| `src/utils`             | Generic helpers, validators, Sentry helpers, Jest `test-utils`.                                    |
| `src/storage`           | On-device storage schema / access where applicable.                                                |
| `src/metro`             | Metro-only shims (e.g. map stub for web or CI).                                                    |

`src/types/` and `src/features/` are **conventions** for larger apps; they are not required in the minimal tree. Add them when a domain outgrows `screens` + `api`.

## Scripts (from `package.json`)

| Script                                      | What it does                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn start`                                | Expo dev server (dev client).                                                                                                           |
| `yarn run check`                            | **Lint + test** (project gate).                                                                                                         |
| `yarn test`                                 | Jest, `src/` only, `TZ=UTC`.                                                                                                            |
| `yarn ios` / `yarn android`                 | Run on device/simulator (after native project exists).                                                                                  |
| `yarn ios:rebuild` / `yarn android:rebuild` | Prebuild + run.                                                                                                                         |
| `yarn test-e2e`                             | [Maestro](https://maestro.mobile.dev/) flows under `e2e/*.yaml` (add flows yourself; the template does not ship Detox or YAML samples). |
| `yarn eas-ios` / `yarn eas-android`         | EAS build (see `eas.json` + `.env`).                                                                                                    |
| `yarn eas-run`                              | `eas build:run` — pass platform, e.g. `yarn eas-run ios` (uses `.env` via `dotenv-cli`).                                                |
| `yarn nuke`                                 | **Destructive** — deep clean of deps and native artifacts (use sparingly).                                                              |

`postinstall` runs [`patch-package`](https://github.com/ds300/patch-package); add patches under `patches/` if you need to fix upstream packages.

## Testing

- **Unit / component:** Jest + React Native Testing Library. Setup: `src/utils/test-utils/setup.ts`. Run `yarn test` or `yarn run check`.
- **E2E:** Optional Maestro; place `e2e/*.yaml` and run `yarn test-e2e` (expects Maestro, `idb`, and a simulator; see `scripts/run-maestro-tests.sh`).

## Internationalization

[i18next](https://www.i18next.com/) with JSON resources under `src/translations/languages/`. Add keys in both (or all) language files to avoid missing-copy issues.

## Error reporting

[Sentry](https://docs.sentry.io/platforms/react-native/) is integrated when `EXPO_PUBLIC_SENTRY_DSN` is set. Tune sampling and environment in your Sentry project.

## CI and EAS

**GitHub Actions:** On push to `main`, [`.github/workflows/lint-and-test.yml`](.github/workflows/lint-and-test.yml) installs deps and runs `yarn lint`, `yarn test`, and `yarn duplication:check`. Extend or duplicate that workflow for pull requests if you use branch-based review.

**EAS:** [EAS](https://docs.expo.dev/eas/) profiles live in `eas.json`. Use `dotenv-cli` to load `.env` for the `eas-*` scripts in `package.json` when building or deploying.

## License

This template is private / internal unless you add a public license. Add a `LICENSE` file when you publish a fork.

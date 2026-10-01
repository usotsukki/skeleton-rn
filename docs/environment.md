# Environment and backend

Configuration is split between `app.json`, `app.config.ts`, `env.rules.json`, and your uncommitted root `.env` (start from `cp .env.example .env`).

The app reads public build-time values through `EXPO_PUBLIC_*`. `env.rules.json` controls which variables must be non-empty when `EXPO_PUBLIC_NODE_ENV=production`, with separate maps for client runtime env and app config env. Expo inlines only static `process.env.EXPO_PUBLIC_X` reads; add new keys to `src/shared/env/clientEnvSchema.ts` and read them in `src/shared/env/index.ts` (a test enforces the static reads).

## Variables

App identity and build:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_NODE_ENV` | `development`, `testing`, or `production` |
| `EXPO_PUBLIC_ENABLE_DEV_MODE` | Enables dev-mode behavior in non-dev builds |
| `EXPO_PUBLIC_APP_NAME` | App display name override (`app.json` otherwise) |
| `EXPO_PUBLIC_APP_SLUG` | Expo slug override |
| `EXPO_PUBLIC_APP_SCHEME` | Deep link / OAuth scheme |
| `EXPO_PUBLIC_IOS_BUNDLE_ID` | iOS bundle identifier override |
| `EXPO_PUBLIC_IOS_BUNDLE_ID_TESTING` | Optional testing bundle id (default `<bundle id>.test`) |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Android package override |
| `EXPO_PUBLIC_ANDROID_PACKAGE_TESTING` | Optional testing package (default `<package>.test`) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project id and Updates URL |
| `EXPO_PUBLIC_EAS_OWNER` | Expo account owner |
| `APPLE_TEAM_ID` | Apple Developer Team ID (production iOS builds) |

Services:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (`yarn backend:start` writes the local one to `.env.local`) |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Sign-In web client id; Android shows the Google button only when it is set |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Sign-In iOS client id; `app.config.ts` also derives the iOS URL scheme from it (required for production native builds) |
| `GOOGLE_MAPS_API_KEY_ANDROID` | Android Maps SDK key (Map demo; required for production Android builds while the demo is kept) |
| `GOOGLE_MAPS_API_KEY_IOS` | iOS Maps SDK key (same) |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional Sentry DSN; unset = no error reporting |
| `SENTRY_AUTH_TOKEN` | Sentry org token (`org:ci`) for source-map upload; builds without it skip the upload |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Sentry org and project slugs for the upload |
| `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` | Optional PostHog project token (`phc_…`, public). Unset = analytics and feature flags disabled |
| `EXPO_PUBLIC_POSTHOG_HOST` | Optional PostHog ingestion host; defaults to `https://eu.i.posthog.com` (use `https://us.i.posthog.com` for US cloud) |

Expo CLI flags in `.env.example`: `EXPO_NO_GIT_STATUS=1` skips the uncommitted-changes prompt before prebuild, `EXPO_NO_REDIRECT_PAGE=1` opens dev builds without the chooser page.

Template hooks the demo doesn't read yet (exported from `src/shared/env`): `EXPO_PUBLIC_BASE_API_URL` (your own API), `EXPO_PUBLIC_LOG_DEBUG` and `EXPO_PUBLIC_LOG_LEVEL` (logging switches). Remove them from `clientEnvSchema.ts`, `env.rules.json` and `eas.json` if you don't need them.

<!-- #region template:map -->
Map keys and their production requirement disappear when you remove the Map demo with `yarn setup`.
<!-- #endregion template:map -->

## GitHub Actions

`lint-and-test.yml` needs nothing. The EAS workflows (`eas-update.yml` on every push to `main`, `eas-build.yml` by hand) need:

- Secret `EXPO_TOKEN` (expo.dev → Account settings → Access tokens).
- Repository variables mirroring the production `EXPO_PUBLIC_*` values (`EXPO_PUBLIC_EAS_PROJECT_ID`, `EXPO_PUBLIC_EAS_OWNER`, `EXPO_PUBLIC_APP_*`, bundle ids/packages; see the `env:` block of each workflow). Production builds fail fast when a required one is missing.

Until EAS is set up, disable the two EAS workflows (GitHub → Actions → workflow → Disable). A push that changes `expo.version` anywhere in its commits skips the OTA update (the new runtime version needs a build first; start one from `eas-build.yml`, builds are manual). So does a push whose previous tip can't be found, such as the first push. Any other push to `main` publishes one.

CI caches `node_modules` (keyed on `yarn.lock`, `package.json`, `.yarnrc.yml`, `.nvmrc` and `patches/`) and the lint caches, and runs Jest in two shards whose coverage is merged into the job summary (`scripts/coverage-summary.cjs`). If branch protection requires checks, require the `Lint` and both `Test (shard N/2)` jobs (GitHub may list them prefixed with `Lint and test /`).

## Local backend

Development uses a local Supabase stack (`supabase/`, Docker):

| Command | What it does |
| --- | --- |
| `yarn backend:start` | Starts auth, database, REST and an email catcher (`http://127.0.0.1:54324`); `--full` adds Studio, storage and realtime. Writes the URL and publishable key to `.env.local` |
| `yarn backend:stop` | Stops the stack and removes the `.env.local` override |
| `yarn backend:reset` | Re-applies `supabase/migrations` and `supabase/seed.sql` (drops local data) |
| `yarn backend:types` | Regenerates `src/shared/api/supabase/database.types.ts` |

- Schema lives in `supabase/migrations`. The `notes` table is a sample of a user-owned table with row level security (no client code uses it yet); replace it with your own.
- `.env.local` outranks `.env`, also in local release builds. A production bundle that points at a local backend fails with a message; run `yarn backend:stop` before building a release.
- The stack listens on all network interfaces with well-known local credentials. Stop it on untrusted networks.
- Physical devices can't reach `127.0.0.1` on your machine; use a simulator or emulator. On an Android emulator the dev app swaps `127.0.0.1` for `10.0.2.2` (the emulator's name for your machine) by itself.

<!-- #region template:map -->
Android Maps keys are installed during prebuild. After changing `GOOGLE_MAPS_API_KEY_ANDROID`, run `yarn android:rebuild`; `yarn dev android` recompiles an existing native project. The map fallback reads a flag built from the generated Android manifest, so changing the env alone cannot enable a map whose native key is missing.
<!-- #endregion template:map -->

## Hosted project

1. Create a Supabase project, then link the CLI and push the schema:

   ```bash
   yarn supabase login
   yarn supabase link --project-ref <project-ref>
   yarn supabase db push
   ```

2. Put the project URL and publishable key in `.env` and in EAS env.
3. Auth → URL Configuration: add `<scheme>://**` (password recovery and email links).
4. Auth → Providers:
   - **Google**: enable; Client IDs = the web client id and the iOS client id (comma-separated).
   - **Apple** (native iOS sign-in): enable; Client IDs = the app's bundle id. No secret key is needed for the native flow. `app.config.ts` sets `usesAppleSignIn`, so EAS adds the Sign in with Apple capability to the App ID on the next build.
5. Auth tokens are stored on the device in an encrypted MMKV instance whose key lives in the iOS Keychain / Android Keystore (`src/shared/storage/authStorage.ts`).

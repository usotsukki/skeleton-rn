# Environment and backend

Configuration is split between `app.json`, `app.config.ts`, `env.rules.json`, and your uncommitted root `.env`.

The app reads public build-time values through `EXPO_PUBLIC_*`. `env.rules.json` controls which variables must be non-empty when `EXPO_PUBLIC_NODE_ENV=production`, with separate maps for client runtime env and app config env.

Core variables:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_APP_NAME` | App display name override |
| `EXPO_PUBLIC_APP_SLUG` | Expo slug override |
| `EXPO_PUBLIC_APP_SCHEME` | Deep link / OAuth scheme |
| `EXPO_PUBLIC_IOS_BUNDLE_ID` | iOS bundle identifier |
| `EXPO_PUBLIC_IOS_BUNDLE_ID_TESTING` | Optional testing bundle id |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Android package id |
| `EXPO_PUBLIC_ANDROID_PACKAGE_TESTING` | Optional testing package id |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon / publishable key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Sign-In web client id |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Sign-In iOS client id; `app.config.ts` also derives the iOS URL scheme from it (required for production native builds) |
| `GOOGLE_MAPS_API_KEY_ANDROID` | Android maps key |
| `GOOGLE_MAPS_API_KEY_IOS` | iOS maps key |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional Sentry DSN |
| `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` | Optional PostHog project token (`phc_…`, public). Unset = analytics and feature flags disabled |
| `EXPO_PUBLIC_POSTHOG_HOST` | Optional PostHog ingestion host; defaults to `https://eu.i.posthog.com` (use `https://us.i.posthog.com` for US cloud) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project id and Updates URL |
| `EXPO_PUBLIC_EAS_OWNER` | Expo account owner |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `EXPO_PUBLIC_NODE_ENV` | `development`, `testing`, or `production` |
| `EXPO_PUBLIC_ENABLE_DEV_MODE` | Enables dev-mode behavior |

## Local backend

Development uses a local Supabase stack (`supabase/`, Docker):

| Command | What it does |
| --- | --- |
| `yarn backend:start` | Starts auth, database, REST and an email catcher (`http://127.0.0.1:54324`); `--full` adds Studio, storage and realtime. Writes the URL and publishable key to `.env.local` |
| `yarn backend:stop` | Stops the stack and removes the `.env.local` override |
| `yarn backend:reset` | Re-applies `supabase/migrations` and `supabase/seed.sql` (drops local data) |
| `yarn backend:types` | Regenerates `src/api/supabase/database.types.ts` |

- Schema lives in `supabase/migrations`. The `notes` table is a sample of a user-owned table with row level security; replace it with your own.
- `.env.local` outranks `.env`, also in local release builds. A production bundle that points at a local backend fails with a message; run `yarn backend:stop` before building a release.
- The stack listens on all network interfaces with well-known local credentials. Stop it on untrusted networks.
- Physical devices can't reach `127.0.0.1` on your machine; use a simulator or emulator. On an Android emulator the dev app swaps `127.0.0.1` for `10.0.2.2` (the emulator's name for your machine) by itself.

## Hosted project

For production, create your own Supabase project, push the migrations (`yarn supabase db push`), add OAuth providers, and configure redirect URLs to match your app scheme and production domains.

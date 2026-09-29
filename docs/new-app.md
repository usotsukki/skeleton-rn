# From template to your app

The [readme](../readme.md#start-a-new-app) covers creating the app and running it. This is the full checklist for turning it into a product.

- Open the new app's folder as the project root in your editor or agent, so its rules, hooks and scripts apply.
- Set the app identity: `yarn rename "<Name>" <slug> <scheme> <bundle-id>` (updates `package.json`, `app.json` and `supabase/config.toml`; values in `.env` override `app.json`).
- Set `.env` values for Supabase, OAuth, maps, EAS, Apple team, Sentry, PostHog, and production env requirements.
- Analytics: create a PostHog project, set `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` (and the host for US cloud) locally and in EAS env. Add events to `src/api/analytics/events.ts` and flags to `featureFlags.ts` (then gate with `useFeatureGate`); delete the `template-demo` flag and the Home demo row. Analytics are on by default with a Settings opt-out; if you need opt-in consent (e.g. EU users), start the client opted out (`defaultOptIn: false`).
- Tune `env.rules.json` so production fails fast when required product config is missing.
- Confirm redirect URLs in Supabase for email recovery and OAuth callbacks.
- Rebrand icon and splash: edit `assets/brand/skull.svg` (any 24×24 stroke icon, e.g. from Lucide) and `assets/brand/brand.json` (gradient, splash color, icon size), regenerate with `scripts/generate-brand-assets.cjs` (see its header), then mirror `splashBackground` / `splashIconSize` in the `expo-splash-screen` entry of `app.json` (a test fails if they drift). Native rebuild required.
- Replace the demo clips under `docs/media` (the readme embeds them).
- Generate your own Android debug key with `./scripts/generate-debug-keystore.sh` (gitignored, stays on your machine; the shared React Native debug key's SHA-1 is usually already claimed in Google Cloud for common package names). Register its SHA-1 and the EAS keystore SHA-1 (expo.dev → Credentials → Android) as Android OAuth clients in the same Google Cloud project as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, or Android Google Sign-In fails with "Android clients and Web clients must be in the same project".
- Keep or remove `"private": true` in `package.json` based on your publishing needs.
- Update EAS owner/project values and build profiles for your release process.
- Add product screens under `src/screens` and route to them from `src/app`. To land somewhere other than Home after sign-in, change `HOME_ROUTE` in `src/utils/navigation.ts` and put `LANDING_SCREEN_TEST_ID` on that screen's root view.

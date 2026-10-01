# From template to your app

The [readme](../readme.md#start-a-new-app) covers creating the app and running it. This is the full checklist for turning it into a product. Open the new app's folder as the project root in your editor or agent, so its rules, hooks and scripts apply.

## 1. Identity and clutter: `yarn setup`

`yarn setup` asks for the app identity (name, slug, URL scheme, bundle id; it runs `yarn rename` and resets the version to `1.0.0`), then which demos and starter packages to remove, shows the plan and applies it. It edits only what each module owns, updates `yarn.lock`, and records removed modules in `scripts/setup/removed.json`. Run it on a clean git tree, then `yarn fix && yarn check` and `npx expo prebuild --clean`.

```bash
yarn setup --list                          # modules and what they remove
yarn setup --remove map,skia --dry-run     # preview
yarn setup --keep notifications --yes      # remove everything else without prompts
```

| Module | Removes |
| --- | --- |
| `map` | Map tab, `react-native-maps` and its plugin, the Google Maps keys and their production requirement, the Metro maps stub |
| `skia` | Skia tab and `@shopify/react-native-skia` |
| `list-demo` | Home → list states demo |
| `feature-flag-demo` | Home row showing the `template-demo` PostHog flag (the flag registry stays: register your own flags there) |
| `component-gallery` | Home sections showing every UI primitive (the profile card stays) |
| Starter extras | `expo-location`, `expo-image-picker`, `expo-document-picker`, `expo-image-manipulator`, `expo-video`, `expo-sqlite`, `expo-screen-orientation`, datetimepicker, `expo-notifications`, `luxon`, `es-toolkit`, `@expo/ui`: installed for new apps, unused by the demo |
| `template-docs` | Replaces this template's readme with a short app readme and deletes `docs/media` |

Prefer doing it by hand? Each module's files, packages, plugins, strings and env keys are listed in `scripts/setup/modules.cjs`; shared code is marked with `#region template:<id>` comments.

Still yours to change after setup: the `LICENSE` holder, the titles of `CLAUDE.md` and `AGENTS.md`, `"private": true` in `package.json`, and env overrides in `.env` (`EXPO_PUBLIC_APP_*`, `EXPO_PUBLIC_IOS_BUNDLE_ID`, `EXPO_PUBLIC_ANDROID_PACKAGE` win over `app.json`).

### Starter extras you keep

| Package | Before you ship it |
| --- | --- |
| `expo-location` | Add the plugin with `locationWhenInUsePermission` (and Android permissions you need) to `app.json` |
| `expo-image-picker` | Add the plugin with `photosPermission` / `cameraPermission` strings |
| `expo-notifications` | Configure push credentials in EAS; the iOS `remote-notification` background mode is already set in `app.config.ts` |
| Others | Work as installed |

App Store review rejects binaries that link a privacy-sensitive API without its purpose string, so remove what you don't use.

## 2. Configuration

- `cp .env.example .env`, then fill Supabase, OAuth, EAS, Apple team, Sentry and PostHog values ([environment.md](environment.md) lists every variable).
- Tune `env.rules.json` so production fails fast when required product config is missing.
- Update EAS owner/project values (`eas init`) and build profiles for your release process.

## 3. Services

- **Supabase**: create the hosted project, `yarn supabase login`, `yarn supabase link --project-ref <ref>`, `yarn supabase db push`; redirect URL `<scheme>://**`; Google and Apple providers ([environment.md → Hosted project](environment.md#hosted-project)).
- **Google Sign-In**: web, iOS and Android OAuth clients in one Google Cloud project. Generate your own Android debug key with `./scripts/generate-debug-keystore.sh` (gitignored; the shared React Native debug key's SHA-1 is usually already claimed). Register its SHA-1 and the EAS keystore SHA-1 (expo.dev → Credentials → Android) as Android OAuth clients in the same project as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, or Android Google Sign-In fails with "Android clients and Web clients must be in the same project".
- **Apple Sign-In** (iOS): enable the Apple provider in Supabase with the bundle id as client id; EAS adds the capability on build.
- **Google Maps** (if you kept the Map demo): Maps SDK for Android and iOS keys in `GOOGLE_MAPS_API_KEY_ANDROID` / `GOOGLE_MAPS_API_KEY_IOS`, restricted to your package + SHA-1 and bundle id.
- **Analytics**: create a PostHog project, set `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` (and the host for US cloud) locally and in EAS env. Add events to `src/shared/api/analytics/events.ts` and flags to `featureFlags.ts` (then gate with `useFeatureGate`); delete the `template-demo` flag once you have your own. Analytics are on by default with a Settings opt-out; if you need opt-in consent (e.g. EU users), start the client opted out (`defaultOptIn: false`).
- **Sentry**: `EXPO_PUBLIC_SENTRY_DSN`, plus `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` for source maps, locally and in EAS.

## 4. GitHub Actions

`lint-and-test.yml` needs nothing. The EAS workflows need the `EXPO_TOKEN` secret and the repository variables listed in [environment.md → GitHub Actions](environment.md#github-actions); disable them (GitHub → Actions → workflow → Disable) until EAS is set up. Every push to `main` that doesn't change `expo.version` publishes an OTA update; a version change skips it so a build can go first.

## 5. Brand

Edit `assets/brand/skull.svg` (any 24×24 stroke icon, e.g. from Lucide) and `assets/brand/brand.json` (gradient, splash color, icon size), regenerate with `scripts/generate-brand-assets.cjs` (see its header), then mirror `splashBackground` / `splashIconSize` in the `expo-splash-screen` entry of `app.json` (a test fails if they drift). Native rebuild required. Replace or remove the demo clips under `docs/media` if you kept the template readme.

## 6. Build features

Add product features under `src/features/<feature>` (screens as `<Name>Screen.tsx`, exported from the feature's `index.ts`) and route to them from `src/app`; see [source-architecture.md](source-architecture.md). To land somewhere other than Home after sign-in, change `HOME_ROUTE` in `src/shared/utils/navigation.ts` and put `LANDING_SCREEN_TEST_ID` on that screen's root view.

## Shipping native changes

The runtime version follows `expo.version` (`runtimeVersion.policy: appVersion`). When a change adds a native module or config plugin, bump the version (`yarn increment-version minor`) and ship a build before any OTA update: an older binary must not receive JS that needs native code it doesn't have.

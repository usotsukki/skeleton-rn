---
name: new-app-setup
description: Checklist for turning a fork of this template into a new app — identity and demo removal (`yarn setup`), brand assets, debug keystore, Google / Apple Sign-In, Supabase auth config, EAS env and GitHub Actions, Sentry, MCP scoping — plus safe handling of cloud consoles (Google Cloud, Supabase, expo.dev) in the browser. Use when setting up or rebranding an app from skeleton, or when auth/build config across these services is out of sync.
---

# New app setup

The fork's folder must be the session root (its rules, hooks, agents and scripts don't load from a parent directory). Work top to bottom; verify each step before the next. Never read `.env*` directly — use values via `npx dotenv -e .env.local -e .env -- …` (first file wins, like Expo; `-e .env` alone for the hosted values) and print only matches/prefixes.

## 1. Identity and demo removal

- Ask the user which demos and starter packages to keep (`yarn setup --list`), preview with `--dry-run`, then apply with their answers: `yarn setup --identity "<Name>" <slug> <scheme> <bundle-id> --remove <ids> --yes` (clean tree; it runs `yarn rename`, resets the version to 1.0.0, updates `yarn.lock`). Then `yarn fix && yarn check` and `npx expo prebuild --clean`.
- Identity only: `yarn rename "<Name>" <slug> <scheme> <bundle-id>` sets `package.json` name, `app.json` (name, slug, scheme, bundle id, package — unique, `com.<org>.<app>`), the local Supabase `project_id` and `yarn.lock`. Env overrides win over `app.json`: `EXPO_PUBLIC_APP_*`, `EXPO_PUBLIC_IOS_BUNDLE_ID`, `EXPO_PUBLIC_ANDROID_PACKAGE`.
- EAS: `eas init`, then `EXPO_PUBLIC_EAS_PROJECT_ID` / `EXPO_PUBLIC_EAS_OWNER`.

## 2. Brand

Edit `assets/brand/skull.svg` (any 24×24 stroke icon) + `assets/brand/brand.json`, regenerate (`scripts/generate-brand-assets.cjs` header), mirror `splashBackground`/`splashIconSize` in `app.json` (brand test enforces). Native rebuild, then `release-check`.

## 3. Google Sign-In (all clients in ONE Google Cloud project)

- Web client → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`; iOS client → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (iOS URL scheme derives from it).
- Android OAuth clients (package + SHA-1), one per signing key: each developer's debug key (`./scripts/generate-debug-keystore.sh` — per machine, gitignored), each EAS keystore (`eas credentials -p android`), Play app signing key later.
- Errors: "Android clients and Web clients must be in the same project" → Android client is in another project; "Invalid key value: <base64>" → no client for that SHA-1 (decode: `echo <b64> | base64 -d | xxd -p`).

## 4. Supabase

Development runs on the local stack with no project (`yarn backend:start`; schema in `supabase/migrations`, types via `yarn backend:types`). For the hosted project (user creates it): `yarn supabase login`, `yarn supabase link --project-ref <ref>`, `yarn supabase db push` (a hosted write: ask first). URL + publishable key in `.env` and EAS. Auth → URL Configuration: `<scheme>://**`. Google provider Client IDs: web + iOS only. Apple provider Client IDs: the bundle id (native flow, no secret); `usesAppleSignIn` makes EAS add the capability. Copy `.mcp.example.json` → `.mcp.json` (gitignored) with the new `project_ref`.

## 4b. Google Maps (only if the Map demo stays)

Maps SDK for Android / iOS keys → `GOOGLE_MAPS_API_KEY_ANDROID` / `GOOGLE_MAPS_API_KEY_IOS` locally and in EAS; restrict them to the package + SHA-1s and the bundle id. Production builds require them while the demo exists (`env.rules.json`).

## 5. EAS env, GitHub Actions & Sentry

- GitHub: secret `EXPO_TOKEN` and repository variables from the `env:` blocks of `.github/workflows/eas-*.yml`; until then, ask the user to disable those two workflows (a push to `main` otherwise fails or publishes an update).

- Mirror `.env` into EAS production/development. `EXPO_PUBLIC_*` → visibility **sensitive/plaintext** (secret can't be read back or changed). Delete unused vars.
- Sentry: org auth token (`org:ci`) in `SENTRY_AUTH_TOKEN` locally and in EAS; verify with `sentry-cli info` and a release build upload.

## Browser console safety

- Multiple Google accounts: open consoles with `authuser=<n>`; never change account security settings (2SV etc.) — ask the user.
- Read values with page JS or element refs, not coordinate clicks; screenshot and confirm no rows are selected before any page with Delete/Remove actions; create/edit only what the user approved.

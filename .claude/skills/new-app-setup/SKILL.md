---
name: new-app-setup
description: Checklist for turning a fork of this template into a new app — identifiers, brand assets, debug keystore, Google Sign-In OAuth clients, Supabase auth config, EAS env, Sentry, MCP scoping — plus safe handling of cloud consoles (Google Cloud, Supabase, expo.dev) in the browser. Use when setting up or rebranding an app from skeleton, or when auth/build config across these services is out of sync.
---

# New app setup

Work top to bottom; verify each step before the next. Never read `.env*` directly — use values via `npx dotenv -e .env.local -e .env -- …` (first file wins, like Expo; `-e .env` alone for the hosted values) and print only matches/prefixes.

## 1. Identity

- `app.json` / env: name, slug, scheme, `EXPO_PUBLIC_IOS_BUNDLE_ID`, `EXPO_PUBLIC_ANDROID_PACKAGE` (unique package — `com.<org>.<app>`), `package.json` name.
- EAS: `eas init`, then `EXPO_PUBLIC_EAS_PROJECT_ID` / `EXPO_PUBLIC_EAS_OWNER`.

## 2. Brand

Edit `assets/brand/skull.svg` (any 24×24 stroke icon) + `assets/brand/brand.json`, regenerate (`scripts/generate-brand-assets.cjs` header), mirror `splashBackground`/`splashIconSize` in `app.json` (brand test enforces). Native rebuild, then `release-check`.

## 3. Google Sign-In (all clients in ONE Google Cloud project)

- Web client → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`; iOS client → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (iOS URL scheme derives from it).
- Android OAuth clients (package + SHA-1), one per signing key: each developer's debug key (`./scripts/generate-debug-keystore.sh` — per machine, gitignored), each EAS keystore (`eas credentials -p android`), Play app signing key later.
- Errors: "Android clients and Web clients must be in the same project" → Android client is in another project; "Invalid key value: <base64>" → no client for that SHA-1 (decode: `echo <b64> | base64 -d | xxd -p`).

## 4. Supabase

Development runs on the local stack with no project (`yarn backend:start`; schema in `supabase/migrations`, types via `yarn backend:types`). For the hosted project: URL + publishable key in `.env` and EAS. Auth → URL Configuration: `<scheme>://**`. Google provider Client IDs: web + iOS only. Copy `.mcp.example.json` → `.mcp.json` (gitignored) with the new `project_ref`.

## 5. EAS env & Sentry

- Mirror `.env` into EAS production/development. `EXPO_PUBLIC_*` → visibility **sensitive/plaintext** (secret can't be read back or changed). Delete unused vars.
- Sentry: org auth token (`org:ci`) in `SENTRY_AUTH_TOKEN` locally and in EAS; verify with `sentry-cli info` and a release build upload.

## Browser console safety

- Multiple Google accounts: open consoles with `authuser=<n>`; never change account security settings (2SV etc.) — ask the user.
- Read values with page JS or element refs, not coordinate clicks; screenshot and confirm no rows are selected before any page with Delete/Remove actions; create/edit only what the user approved.

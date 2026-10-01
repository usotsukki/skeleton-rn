---
name: release-check
description: Verify a change in a local RELEASE build (not dev) — env inlining, config plugins, native deps, launch/splash behavior, crashes, Sentry source-map upload. Use when changing how env is read, app.config.ts/app.json plugins, native dependencies, or launch/splash code, and before claiming such work is done.
---

# Release check

Dev builds hide release bugs (runtime `process.env` polyfill, dev launcher, no Hermes bytecode). This skill proves the release path.

## When

Required for: `src/shared/env/**`, `metro/**`, `app.config.ts`, `app.json` plugins, `plugins/**`, native dependency adds/removals, splash/launch code. Not for pure JS UI changes.

## 1. Build (Android is the fastest full check)

```bash
export LANG=en_US.UTF-8 JAVA_HOME=$(/usr/libexec/java_home -v 17) ANDROID_HOME=$HOME/Library/Android/sdk
# No SENTRY_AUTH_TOKEN → the upload is skipped by app.config.ts; with the token it runs, so test it.
# Local backend running (.env.local)? The bundle fails by design: yarn backend:stop first, or
# ALLOW_LOCAL_BACKEND_IN_RELEASE=true to test the release build against the local stack.
npx expo run:android --variant release --no-bundler --device <AVD name>   # run in background
```

iOS: `yarn iosr` (Release configuration). A failing Sentry upload (403) means the token lacks `org:ci`/`project:releases`.

## 2. Bundle sanity

Hermes bundle is binary — use `grep -a`:

```bash
grep -a -c '<a known EXPO_PUBLIC value prefix>' android/app/build/generated/assets/react/release/index.android.bundle
```

0 → env not inlined (check `src/shared/env/index.ts` reads each key statically).

A release bundle must not point at this machine: `grep -a -c -E '127\.0\.0\.1:54321|10\.0\.2\.2:54321' <bundle>` → expect 0 (unless built with `ALLOW_LOCAL_BACKEND_IN_RELEASE=true`).

## 3. Cold launch + crash check

Delegate to the `device-check` agent: force-stop, record the cold launch of the **release** app from the launcher (Android `monkey`; iOS `simctl launch`, not the dev-client URL), frame strip, then `adb logcat -d -b crash` (expect no `FATAL`). Pass criteria: native splash → app with no gap/jump, no crash, expected first screen.

## 4. Report

Build exit code, bundle check, crash count, key frames, Sentry upload line (`Uploaded files to Sentry`) — or what failed with the log excerpt.

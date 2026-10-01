# Dev Commands

Agent-runnable scripts. EAS and destructive utilities are user-only and not listed here.

## Run the app

- `yarn dev [ios|android]` — local backend + Metro on a free port + native dev build, in one command (multi-minute on the first build; run in background). Restarts this project's Metro when one is already running (it inlined the env it started with); picks the next free port when another app holds 8081.
- `yarn dev:stop` — stops this project's Metro and the local backend. Run it when the task ends, or report what is still running.
- `yarn dev:port` — port of this project's running Metro (exit 1 when none).
- `yarn start` — Metro only (port 8081 or `RCT_METRO_PORT`).

## Verify (after edits)

- `yarn lint:ts` — `tsc --noEmit` (incremental). Run after any TS change.
- `yarn lint:js` — eslint, `--max-warnings=0`
- `yarn lint:format` — prettier check (read-only)
- `yarn lint:architecture` — feature-boundary check (`scripts/check-feature-boundaries.cjs`; layout in `docs/source-architecture.md`)
- `yarn lint:unused` — knip (unused files / deps / exports; config in `knip.jsonc`)
- `yarn fix` — prettier write + eslint `--fix`
- `yarn test` — jest, `TZ=UTC` baked in
- `yarn test:coverage` — jest with coverage
- `TZ=UTC jest src/path` — single file / pattern
- `yarn check` — `lint && test`. Merge gate; read-only.
- `yarn duplication:check` — jscpd duplication report
- `yarn e2e:sign-in` — Maestro sign-in with the `.env.e2e` test user (`maestro/flows/sign-in.yaml`; no-op when signed in; `--android` for the Android package; `MAESTRO_DEVICE=<udid|serial>` with several devices). Agent-runnable against the local stack; it exits 1 when the Supabase host isn't local, and the flow asserts the app's `backend-local` marker before typing. Fails fast (exit 1, names the pid) when another Maestro process holds the driver port 7001 (iOS and Android); `--free-port` stops that Maestro process first (it is usually another session's `maestro mcp` server, which loses its Maestro tools). Stops after `E2E_TIMEOUT` seconds (default 300). `--hosted` sends the credentials to the hosted project: user-run.

## Fork setup

- `yarn rename "<Name>" <slug> <scheme> <bundle-id>` — app identity in `package.json`, `app.json`, `supabase/config.toml`, then `yarn.lock` (via `yarn install --mode=update-lockfile`). Rewrites tracked files: run it only when the user asks.
- `yarn setup` — identity plus removal of demos and starter packages (manifest `scripts/setup/modules.cjs`, code marked `#region template:<id>`, removed ids recorded in `scripts/setup/removed.json`). Agents: `yarn setup --list`, `--dry-run` freely; applying (`--remove/--keep … --yes`) deletes code, so only when the user asks. Refuses a dirty tree without `--force`.

## Local backend (Supabase in Docker)

- `yarn backend:start` — starts Docker if needed, runs the minimal stack (auth, database, REST, email catcher; `--full` adds Studio, storage, realtime), writes the Supabase URL and publishable key to `.env.local`, creates `.env.e2e` when missing. Cold start pulls images (minutes); warm starts take seconds. Restart Metro afterwards.
- `yarn backend:stop` — stops the stack and removes the `.env.local` override, so `.env` applies again.
- `yarn backend:reset` — re-applies `supabase/migrations` and `supabase/seed.sql` (drops local data).
- `yarn backend:types` — regenerates `src/shared/api/supabase/database.types.ts` after a migration.

## Gotchas

- **Yarn 4** (Corepack, `nodeLinker: node-modules`): no `-s`/`--silent`; scripts run in Yarn's own shell, so quote globs (`run-p 'lint:*'`); CI and EAS use `yarn install --immutable`.
- Don't smoke-test lint-staged with `--diff`: it stages the files it touches.
- `yarn ios` / `yarn android` / `:rebuild` / `expo prebuild` are allowed (multi-minute; run in background). Only rebuild when native deps or config plugins changed; JS-only changes just need Metro (`yarn start`). `expo prebuild` recreates `ios/`/`android/` by default (SDK 57); `--no-clean` keeps them.
- Native builds on macOS: Xcode 26.4+ (older fails in `expo-modules-jsi` headers), `LANG=en_US.UTF-8` (CocoaPods), JDK 17 for Android (`JAVA_HOME=$(/usr/libexec/java_home -v 17)`); `expo run:android --device` takes the AVD name.
- The Bash tool's shell may be zsh: quote globs (`--include='*.ts'`) and run array-heavy scripts with `bash -c`.
- `.env.local` outranks `.env` in Expo CLI (every mode except `test`), including local release builds. A production bundle with a local or private Supabase host fails (`metro/releaseEnvGuard.js`; `yarn iosr` checks first): run `yarn backend:stop`, or set `ALLOW_LOCAL_BACKEND_IN_RELEASE=true` to test a release build against the local stack.
- Builds without `SENTRY_AUTH_TOKEN` skip the Sentry upload (`app.config.ts`); with the token they upload as before.
- `yarn ios` uses `--no-bundler` and always opens the app on port 8081. With another app's Metro there, use `yarn dev`.
- `yarn nuke` is destructive (clears node_modules, pods, Xcode caches). User-only.

# Dev Commands

Agent-runnable scripts. EAS and destructive utilities are user-only and not listed here.

## Start metro

- `yarn start`

## Verify (after edits)

- `yarn lint:ts` — `tsc --noEmit` (incremental). Run after any TS change.
- `yarn lint:js` — eslint, `--max-warnings=0`
- `yarn lint:format` — prettier check (read-only)
- `yarn lint:unused` — knip (unused files / deps / exports; config in `knip.jsonc`)
- `yarn fix` — prettier write + eslint `--fix`
- `yarn test` — jest, `TZ=UTC` baked in
- `yarn test:coverage` — jest with coverage
- `TZ=UTC jest src/path` — single file / pattern
- `yarn check` — `lint && test`. Merge gate; read-only.
- `yarn duplication:check` — jscpd duplication report
- `yarn e2e:sign-in` — Maestro sign-in with the `.env.e2e` test user (`maestro/flows/sign-in.yaml`; no-op when signed in; `--android` for the Android package; `MAESTRO_DEVICE=<udid|serial>` with several devices). User-run: it sends credentials to the hosted Supabase project.

## Gotchas

- **Yarn 4** (Corepack, `nodeLinker: node-modules`): no `-s`/`--silent`; scripts run in Yarn's own shell, so quote globs (`run-p 'lint:*'`); CI and EAS use `yarn install --immutable`.
- Don't smoke-test lint-staged with `--diff`: it stages the files it touches.
- `yarn ios` / `yarn android` / `:rebuild` / `expo prebuild` are allowed (multi-minute; run in background). Only rebuild when native deps or config plugins changed; JS-only changes just need Metro (`yarn start`). `expo prebuild` recreates `ios/`/`android/` by default (SDK 57); `--no-clean` keeps them.
- Native builds on macOS: Xcode 26.4+ (older fails in `expo-modules-jsi` headers), `LANG=en_US.UTF-8` (CocoaPods), JDK 17 for Android (`JAVA_HOME=$(/usr/libexec/java_home -v 17)`); `expo run:android --device` takes the AVD name.
- The Bash tool's shell may be zsh: quote globs (`--include='*.ts'`) and run array-heavy scripts with `bash -c`.
- `yarn nuke` is destructive (clears node_modules, pods, Xcode caches). User-only.

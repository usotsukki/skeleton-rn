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
- `yarn run check` — `lint && test`. Merge gate; read-only.
- `yarn duplication:check` — jscpd duplication report

## Gotchas

- **Yarn 1:** the built-in command `yarn check` is **not** the script above. It validates `node_modules` vs the lockfile. For lint + test, use **`yarn run check`**.
- Don't smoke-test lint-staged with `--diff`: it stages the files it touches.
- `yarn ios` / `yarn android` / `:rebuild` / `expo prebuild` are allowed (multi-minute; run in background). Only rebuild when native deps or config plugins changed; JS-only changes just need Metro (`yarn start`).
- `yarn nuke` is destructive (clears node_modules, pods, Xcode caches). User-only.

# Dev Commands

Agent-runnable scripts. Build / EAS / sim-rebuild / destructive utilities are user-only and not listed here.

## Start metro

- `yarn start`

## Verify (after edits)

- `yarn lint:ts` — `tsc --skipLibCheck --noEmit`. Run after any TS change.
- `yarn lint:js` — eslint
- `yarn test` — jest, `TZ=UTC` baked in
- `TZ=UTC jest src/path` — single file / pattern
- `yarn run check` — `lint && test`. Pre-commit / merge gate.
- `yarn duplication:check` — jscpd duplication report

## Gotchas

- **Yarn 1:** the built-in command `yarn check` is **not** the script above. It validates `node_modules` vs the lockfile. For lint + test, use **`yarn run check`**.
- `yarn ios` / `:rebuild` are user-only (multi-min block). Ask before suggesting.
- `yarn nuke` is destructive (clears node_modules, pods, Xcode caches). User-only.

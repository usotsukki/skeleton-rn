# Skeleton Claude Guide

Skeleton is an Expo / React Native template (SDK 55, RN 0.83, React 19, Expo Router, NativeWind).

## Source Of Truth

- `.claude/rules/core-architecture.md` — file placement and ownership
- `.claude/rules/react-components.md` — component conventions
- `.claude/rules/testing.md` — Jest + RNTL conventions
- `.claude/rules/commands.md` — agent-runnable scripts

## Repo Commands

See `.claude/rules/commands.md` (auto-loaded). Quick hits: `yarn start`, `yarn run check`, `yarn test`, `yarn lint`.

On Yarn 1, **`yarn check` is a built-in** (lockfile / install verification), not the `lint && test` script. Use **`yarn run check`** for the project gate.

## Safety & Constraints

- **`.env*` and secret files are blocked in `settings.json`.** Ask the user for env info.
- **Git read-only by default.** See `.claude/rules/git-safety.md`.
- Do not claim a task complete if the verification command exited non-zero or was skipped — disclose output.
- MCPs and device automation opt-in, task-specific. Local repo truth first. Routing: `.claude/rules/mcp-routing.md`.
- Do not substitute a different abstraction than what was requested (e.g. a hook when a component was asked for). If unsure, ask.

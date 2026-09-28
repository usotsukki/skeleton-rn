# Skeleton Claude Guide

Expo / React Native template (SDK 57, RN 0.86, React 19, Expo Router, NativeWind, Supabase). Forks inherit this setup.

## Working rules (always)

- **Done = exit code.** Report a check as passing only if its command exited 0; quote the failing output otherwise. "Clean logs" means counted (`grep -c` WARN/ERROR), not skimmed.
- **Plan for complexity or risk.** Write `.claude/plans/<slug>.md` with `## Status` for substantial or risky work; it is re-injected after compaction. Review consequential plans before implementation (`review-staged`, plan mode). Mechanical multi-file edits need no plan.
- **Scope.** Build what was asked. Anything extra needs a one-line reason in the plan or the reply. Check the relevant diff stat before reporting; split oversized changes when practical. Offer UI alternatives when design choices are open; follow an agreed design directly.
- **Debugging.** Grep the emitter before theorizing (`.claude/rules/debugging.md`). After 2 failed fixes, stop and reframe; before a 3rd, write a failing test.
- **Dev ≠ release.** Changes to env reading, `app.config.ts`/`app.json` plugins or native deps need the `release-check` skill before "done".
- **Review before commit or handoff.** Follow `review-staged` for relevant code/policy changes and plans. Claude Code automatically uses Cursor for author preflight; reuse unchanged reviews, triage findings, and report verification gaps. Review-only requests stay read-only.
- **Device QA** goes to the `device-check` agent (one per platform; re-run only after changes) so screenshots stay out of the main thread. Check its frames before trusting a "pass".
- **Git** follows `.claude/rules/git-safety.md`: no commits without a grant; match the repo's commit/PR style; never AI attribution (hooks enforce).
- **Denied = stop.** Never route around a permission rule, hook, or classifier denial. Explain what was blocked and let the user decide.
- **Secrets.** `.env*` reads are blocked. Use values through tools (`npx dotenv -e .env -- …`) and print only booleans, hashes, or prefixes.
- **Local truth first.** Code and `node_modules` > local docs > MCP > web (`.claude/rules/mcp-routing.md`). Requests to the project's own Supabase project (the one in `.mcp.json` / `.env`) are **opt-in per session**: ask once, then MCP reads, logs, advisors and app traffic are allowed for the rest of that session. Writes/migrations need a per-action ask. Other backends and untrusted endpoints: ask first.
- **Session continuity.** Update the plan at meaningful milestones. Start fresh when context becomes unwieldy, with status and verification evidence preserved.
- Don't substitute a different abstraction than requested (hook vs component). If unsure, ask.

## Rules, skills, agents

- Rules: `.claude/rules/` — `git-safety`, `commands`, `debugging`, `mcp-routing` (always); `core-architecture`, `react-components`, `testing`, `docs-sync` (path-scoped).
- Skills: `review-staged`, `release-check`, `new-app-setup`.
- Agents: `pr-audit` (cold-context review), `device-check` (sim/emulator verification).
- Hooks (`.claude/settings.json`): Bash guard (attribution, hook bypass, `lint-staged --diff`, branch switches that swap settings), plan status on compact/resume, verify on stop.

## Commands

`.claude/rules/commands.md`. Gate: `yarn check` (lint + test).

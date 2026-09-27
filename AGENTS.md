# Skeleton — Agent Guide

Tool-agnostic entry point for AI coding agents (Codex, Cursor, Claude Code). Skeleton is an Expo / React Native template — fork into a product repo, then layer product code on top.

Stack: Expo 55, React Native 0.83, React 19 (React Compiler), Expo Router, NativeWind, Zustand, TanStack React Query, Supabase, Jest + RNTL.

## Working rules

The always-on rules live in [CLAUDE.md](CLAUDE.md) ("Working rules") and apply to every tool: done = exit code, plan for complexity/risk, scope discipline, emitter-first debugging, release check for env/config/native changes, review before relevant commits or handoffs, git only with a grant and never AI attribution, never route around a denied action, secrets via tools only.

## Rules (`.claude/rules/`, canonical)

| Rule | Loaded |
| --- | --- |
| [git-safety](.claude/rules/git-safety.md) | Always — grant model, commit/PR style |
| [commands](.claude/rules/commands.md) | Always — scripts and gotchas |
| [debugging](.claude/rules/debugging.md) | Always — emitter gate, reframe after 2 failed fixes |
| [mcp-routing](.claude/rules/mcp-routing.md) | Always — MCP/CLI/dashboard routing |
| [core-architecture](.claude/rules/core-architecture.md) | Editing `src/**` |
| [react-components](.claude/rules/react-components.md) | Editing components/screens |
| [testing](.claude/rules/testing.md) | Editing tests / setup |
| [docs-sync](.claude/rules/docs-sync.md) | Editing docs / rules / skills / agents |

## Skills and agents

- Skills (`.claude/skills/`): `review-staged` (plan/code/policy review + author triage; automatic Cursor preflight in Claude Code), `release-check` (release build, bundle, cold launch), `new-app-setup` (fork checklist, console safety).
- Agents (`.claude/agents/`): `pr-audit` (read-only plan/change review), `device-check` (sim/emulator verification).
- Asked to review as Cursor/Codex? Review directly with the `pr-audit` checklist — no subagents, no `cursor-agent` calls. Distinguish self-review from an independent or cross-model review; review alone does not authorize edits.

## Enforced (not just prose)

- `.claude/settings.json`: `.env*` read deny, destructive git deny list, Bash guard hook (AI attribution, hook bypass, `lint-staged --diff`, settings-swapping branch switches), plan status on compact/resume, verify-on-stop.
- `.husky/commit-msg`: commitlint + AI-attribution rejection for every tool.

Do not duplicate detailed procedures here; update the owning rule, skill, agent contract, or `CLAUDE.md`.

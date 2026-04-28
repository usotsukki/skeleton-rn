# Skeleton — Agent Guide

Tool-agnostic entry point for AI coding agents (Codex, Cursor, Claude Code, etc.). Skeleton is an Expo / React Native template — fork into a product repo, then layer product code on top.

## Project

Stack: Expo 55, React Native 0.83, React 19 (React Compiler), Expo Router, NativeWind, Zustand (sync state), TanStack React Query (server state), Supabase (auth + client), Jest + RNTL.

## Tool-native rule locations (canonical)

`.claude/rules/*.md` is the canonical rulebook. Path-scoped via `paths:` frontmatter (auto-loaded by Claude Code 2.0.64+). Other tools should read these as static markdown.

| Rule                                                                     | When                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [.claude/rules/commands.md](.claude/rules/commands.md)                   | Always — yarn command reference                                  |
| [.claude/rules/core-architecture.md](.claude/rules/core-architecture.md) | Editing `src/**/*.{ts,tsx}`                                      |
| [.claude/rules/react-components.md](.claude/rules/react-components.md)   | Editing `src/components/**`, `src/screens/**`, `src/features/**` |
| [.claude/rules/testing.md](.claude/rules/testing.md)                     | Editing tests / setup                                            |
| [.claude/rules/mcp-routing.md](.claude/rules/mcp-routing.md)             | Always — MCP server selection                                    |
| [.claude/rules/git-safety.md](.claude/rules/git-safety.md)               | Always — git read-only by default                                |
| [.claude/rules/docs-sync.md](.claude/rules/docs-sync.md)                 | Editing docs                                                     |

## Hard constraints

- `.env*` and secret files blocked. Ask user.
- Git is read-only by default. See `.claude/rules/git-safety.md`.
- No build / EAS / sim-rebuild commands without explicit user permission (multi-minute blocks).
- On Yarn 1, `yarn check` is the built-in lockfile validator. For lint + test use **`yarn run check`**.
- Don't substitute different abstractions than what was requested. If unsure, ask.

## For Claude Code specifically

[CLAUDE.md](CLAUDE.md) is the Claude Code entry point. Path-scoped rules in `.claude/rules/*` auto-load on file match.

Do not duplicate rule content here; update `.claude/rules/*.md` when behavior or layout changes.

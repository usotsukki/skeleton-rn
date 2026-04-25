---
paths:
  - docs/**/*.md
  - readme.md
  - CLAUDE.md
  - AGENTS.md
  - .claude/rules/**/*.md
---

# Docs Sync

If docs and code disagree, treat code as correct. Update docs in the same change.

## Canonical sources

- **`.claude/rules/*.md`** — canonical agent rulebook. Auto-loaded by Claude Code (path-scoped via `paths:` frontmatter).
- **`AGENTS.md`** (root, optional) — tool-agnostic entry point for non-Claude tools.

Do not maintain duplicate rule content outside `.claude/rules/`.

## Update triggers

Sync when any of these change:

- source layout / ownership rules
- backend behavior or inspection order
- test infrastructure / mock locations
- canonical rule content under `.claude/rules/`

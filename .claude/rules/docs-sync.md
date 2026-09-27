---
paths:
  - readme.md
  - CLAUDE.md
  - AGENTS.md
  - .claude/rules/**/*.md
  - .claude/skills/**/*.md
  - .claude/agents/**/*.md
---

# Docs Sync

If docs and code disagree, treat code as correct. Update docs in the same change.

## Canonical sources

- **`.claude/rules/*.md`** — canonical agent rulebook. Auto-loaded by Claude Code (path-scoped via `paths:` frontmatter).
- **`AGENTS.md`** — tool-agnostic entry point for Codex/Cursor; keep its rule table in sync.
- **`CLAUDE.md`** — the always-on working rules: short statements pointing to the relevant rule or workflow. Keep the entry points aligned when behavior changes.
- **`.claude/skills/*/SKILL.md`** — task-specific workflows, including review relevance, dispatch, and author triage.
- **`.claude/agents/*.md`** — delegated role contracts and checklists, including read-only review and device evidence.

Keep each detailed procedure in its owning rule, skill, or agent contract; link to it instead of copying it. Markdown that controls agent actions or verification is policy, not ordinary prose; apply the `review-staged` relevance criteria.

## Update triggers

Sync when any of these change:

- source layout / ownership rules
- backend behavior or inspection order
- test infrastructure / mock locations
- canonical rule content under `.claude/rules/`
- skill triggers, review scope, role boundaries, or agent verification contracts

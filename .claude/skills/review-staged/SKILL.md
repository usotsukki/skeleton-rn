---
name: review-staged
description: Review a plan or an explicit code/policy change set. Claude Code automatically uses Cursor before relevant commits or handoffs; direct review requests stay read-only. Includes scope selection, independent review, and author triage.
---

# Review plans and changes

Preserve the useful second opinion without manual copying between tools. Cursor review produced value in 25 of 30 commits in one user-reported session; use it by default for relevant Claude Code changes, then verify its findings locally.

## 1. Choose the mode and relevance

- **Review-only request:** hand the requested artifact to one fresh `pr-audit` subagent (Claude Sonnet 5.5, `effort: high`) and report its findings. Do not fix, stage, commit, or launch a second reviewer. An explicit review request overrides the automatic skip criteria.
- **Author preflight:** after relevant checks and before committing or handing off implementation work, run the review automatically. Review never grants Git permission.
- **Plan preflight:** before implementing a substantial architecture decision or a risky auth, data, native, or deployment change, review the plan. A plan review does not replace review of the implementation.
- **Escalation (a second angle, not a second pass):** for high-risk changes or plans (auth, money, data or RLS migrations, native/config, concurrency, release tooling) add one GPT-6.1 Sol review through Codex after the Grok review. When stuck (two failed fixes, conflicting evidence, no repro, device or computer-use trouble) consult GPT-6 Astra with the reframe artifact from `.claude/rules/debugging.md`. Name the question each escalation must answer.

Relevant changes include behavior, nontrivial refactors/tests, dependencies, auth, env/native config, CI/hooks, and agent rules/skills that change actions, permissions, or verification. File count is not the trigger.

Skip automatic review for formatting, comments, ordinary prose, or mechanical changes with no behavioral or policy effect; give a short reason. Rules and skills are not automatically exempt because they are Markdown.

## 2. Pin the artifact

Use the requested target. For author preflight, select the task's changes; do not silently choose unrelated staged work. If ownership is unclear, clarify scope before dispatching a reviewer. Never stage just to enable review.

| Target | Review input |
| --- | --- |
| Plan | A copy of the named plan plus the user's requirements and constraints |
| Staged changes | `git diff --cached` for the intended commit |
| Working changes | `git diff HEAD -- <task paths>` plus only task-owned untracked files |
| Commit | `git show <sha>`; record the resolved SHA (for a merge, specify the parent/range) |
| Branch/range | Diff the explicit base and head; record both resolved SHAs and review the cumulative change |
| PR | `gh pr diff <n>` and `gh pr view <n>`; record the base/head and confirm the head did not change during capture |

For author/plan preflight, keep a snapshot and `request.md` under the session scratchpad, or `REVIEW_SCRATCH=$(mktemp -d)`. Set `REVIEW_SCRATCH` to that directory. Record a content hash (e.g. `shasum -a 256`) of the snapshot, including task-owned additions. Summarize large lockfile/binary changes and state exclusions; do not hide dependency changes from the reviewer. Direct reviewers can inspect the supplied artifact or requested target read-only without creating files.

The request file contains: mode, goal and acceptance criteria, constraints, artifact path/hash, base/ref and task paths, author/reviewer identity if known, completed checks with exit codes, and outstanding verification. Give the reviewer the necessary context without the author's preferred verdict. Read relevant callers, tests, and configuration to understand the change; the snapshot defines what is being reviewed.

Reuse a completed review when the artifact, base, and requirements are unchanged. Staging identical content does not require another review. Later edits require review of the changed portions and their interactions. Before a commit, ensure its intended content matches the reviewed content, including when using `git commit --only`.

## 3. Run the reviewer

**Direct review request in Claude Code:** one fresh `pr-audit` subagent on the pinned artifact. No `cursor-agent` or `codex` call unless the user names that reviewer.

**Running outside Claude Code (Cursor or Codex asked to review):** use the plan/code checklist in [pr-audit](../../agents/pr-audit.md) yourself. Do not spawn subagents or call `cursor-agent`. Label the result accurately: self-review if you authored the work; independent review if you did not participate in authoring it; cross-model only when different author/reviewer models are known.

**Claude Code author preflight:** Cursor CLI is the default for relevant plans and changes. Invoke it without another user prompt when this workflow applies. Use a fresh invocation in read-only ask mode, not a resumed author conversation:

```bash
cursor-agent -p --trust --mode ask --model "${REVIEW_MODEL:-grok-4.7-high-fast}" --output-format json \
  "Read $REVIEW_SCRATCH/request.md and review its pinned artifact using .claude/agents/pr-audit.md. Read-only: no edits, Git mutations, builds, or subagents. Use the plan checklist for plans and the code checklist for changes. Report evidence-backed defects, verification gaps, and open questions separately." \
  > "$REVIEW_SCRATCH/cursor-review.json"
```

Run in the background, then wait for completion. Read the JSON `result` field and retain the output path and exit code. Exit 0 plus a usable completed report is required; empty output or a failed process is not a passing review. Model IDs can be checked with `cursor-agent --list-models`; preserve `REVIEW_MODEL` when set. Never use `-f/--force` or edit mode.

**High-risk escalation (Codex, GPT-6.1 Sol high):** after the Grok review, append its findings to `request.md` under `## First reviewer findings`, then run:

```bash
CODEX=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex   # not on PATH
"$CODEX" exec -s read-only --ephemeral -m "${ADVISORY_MODEL:-gpt-6.1-sol}" -c model_reasoning_effort=high \
  -C "$PWD" -o "$REVIEW_SCRATCH/codex-review.md" \
  "Review the pinned artifact described in the <stdin> block using .claude/agents/pr-audit.md. Read-only: no edits, Git mutations, builds, or subagents. A first reviewer's findings are included; look for defects and angles it missed rather than repeating them. Report evidence-backed defects, verification gaps, and open questions separately." \
  < "$REVIEW_SCRATCH/request.md"
```

Exit 0 plus a non-empty `codex-review.md` is required. Always give `codex exec` a closed stdin (a file or `/dev/null`); with an inherited terminal stdin it waits forever. Codex draws on the ChatGPT plan allowance, so keep it to the escalation cases; Grok runs from Cursor's included pool.

**Stuck (Codex, GPT-6 Astra):** write a self-contained brief from the reframe artifact (symptom, evidence for and against, what was tried, relevant paths, the exact question; ask for a ranked root cause, a repro recipe and the minimal fix), then:

```bash
"$CODEX" exec -s read-only --ephemeral -m gpt-6-astra -c model_reasoning_effort=medium \
  -C "$PWD" -o "$REVIEW_SCRATCH/astra-answer.md" - < "$REVIEW_SCRATCH/astra-brief.md"
```

Use `high` for design decisions built on conflicting evidence and `-i shot.png` to attach screenshots. Verify every claim against the installed source before acting on it.

If Cursor is unavailable or fails operationally, use one fresh `pr-audit` agent with the same request and disclose the fallback. If Codex is unavailable, say so; the Grok review stands alone. A permission or policy denial is not an operational failure: follow the denied-action rule, never route around it. A fallback may be independent without being cross-model. If neither reviewer can run, report the gap; do not claim the review passed.

Default to one reviewer. Add a focused second reviewer only when high-impact risk or an unresolved finding warrants another perspective; name the specific question it should resolve.

## 4. Triage and handoff

The reviewer reports; the author decides. For author preflight, validate each finding against the code or plan and record **fix**, **reject with evidence**, or **unresolved**. Fix accepted findings within the task's scope. Run relevant checks after edits (`yarn check` for code; document/skill validation for policy-only changes), then review changed portions where needed. For review-only requests, stop at findings and suggested fixes.

Budget: normally one review plus one focused follow-up after fixes; another round only for remaining high-severity findings. Unresolved blockers remain explicit rather than disappearing when the budget ends.

For visual behavior, include screenshots/key frames or recordings with the platform, build/ref, expected behavior, and observations. Existing `device-check` / `release-check` workflows supply this evidence; a code reviewer does not launch builds. Mark visual behavior unverified when the evidence is missing.

Report the artifact/ref, reviewer and review type, verdict, accepted/rejected findings, checks, and remaining gaps. Retain the review artifact so the user does not need to paste notes manually. Do not commit unless granted by `.claude/rules/git-safety.md`.

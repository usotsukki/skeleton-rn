#!/usr/bin/env bash
# SessionStart(compact|resume): re-inject the active plan's status so work continues after compaction
# without the user re-explaining. Silent unless a plan with a "## Status" section exists.
# Plan convention: .claude/plans/<slug>.md (gitignored); active = newest edited plan with a Status section.

DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/plans"
[[ -d "$DIR" ]] || exit 0
while IFS= read -r PLAN; do
  STATUS="$(awk '/^## Status/{flag=1;print;next} /^## /{flag=0} flag' "$PLAN" 2>/dev/null)"
  if [[ -n "$STATUS" ]]; then
    echo "Active plan: ${PLAN#"${CLAUDE_PROJECT_DIR:-.}"/} (re-read it before continuing)"
    echo "$STATUS" | head -40
    exit 0
  fi
done < <(ls -t "$DIR"/*.md 2>/dev/null)
exit 0

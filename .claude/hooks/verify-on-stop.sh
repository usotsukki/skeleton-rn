#!/usr/bin/env bash
# Stop hook: incremental lint + typecheck + related-tests on changed files.
# Skips if eslint/tsc/jest aren't installed yet.

set -euo pipefail

if [ -n "${CURSOR_TRACE_ID:-}" ]; then
  exit 0
fi

if [[ "${CLAUDE_VERIFY_ON_STOP_RUNNING:-0}" == "1" ]]; then
  exit 0
fi
export CLAUDE_VERIFY_ON_STOP_RUNNING=1

ROOT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$ROOT_DIR"
# Per-project logs, so two forks on one machine don't overwrite each other's.
LOG_PREFIX="${TMPDIR:-/tmp}"
LOG_PREFIX="${LOG_PREFIX%/}/$(basename "$ROOT_DIR")-claude"

INPUT_JSON="$(cat)"

STOP_HOOK_ACTIVE="$(printf '%s' "$INPUT_JSON" | node -e "
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const parsed = data ? JSON.parse(data) : {};
  process.stdout.write(String(Boolean(parsed.stop_hook_active)));
});
")"

if [[ "$STOP_HOOK_ACTIVE" == "true" ]]; then
  exit 0
fi

# Bash 3.2 (macOS /bin/bash) has no mapfile or associative arrays: read lines, dedupe with sort -u.
CHANGED_FILES=()
while IFS= read -r file; do
  [[ -n "$file" ]] && CHANGED_FILES+=("$file")
done < <({ git diff --name-only --cached --diff-filter=ACMR; git diff --name-only --diff-filter=ACMR; } 2>/dev/null | sort -u)

if [[ "${#CHANGED_FILES[@]}" -eq 0 ]]; then
  exit 0
fi

CHANGED_FILES_LIMIT="${CLAUDE_VERIFY_ON_STOP_FILE_LIMIT:-200}"
if [[ "${#CHANGED_FILES[@]}" -gt "$CHANGED_FILES_LIMIT" ]]; then
  echo "verify-on-stop: skipping, ${#CHANGED_FILES[@]} changed files > ${CHANGED_FILES_LIMIT} cap" >&2
  exit 0
fi

JS_TS_FILES=()
TS_FILES=()

for file in "${CHANGED_FILES[@]}"; do
  # Skip files that don't exist on disk (e.g. staged-add then deleted in worktree).
  [[ ! -f "$file" ]] && continue
  case "$file" in
    *.js|*.jsx|*.ts|*.tsx) JS_TS_FILES+=("$file") ;;
  esac
  case "$file" in
    *.ts|*.tsx) TS_FILES+=("$file") ;;
  esac
done

if [[ "${#JS_TS_FILES[@]}" -eq 0 ]]; then
  exit 0
fi

fail() {
  local reason="$1"
  node -e "
const reason = process.argv[1];
process.stdout.write(JSON.stringify({ decision: 'block', reason }, null, 2));
" "$reason"
  exit 0
}

if [[ ! -x ./node_modules/.bin/eslint ]]; then
  exit 0
fi

# ESLint warns on explicitly passed ignored files, which --max-warnings=0 turns into a failure (same filter as .lintstagedrc.mjs).
LINTABLE_FILES=()
while IFS= read -r file; do
  [[ -n "$file" ]] && LINTABLE_FILES+=("$file")
done < <(node -e "
const { ESLint } = require('eslint');
const eslint = new ESLint();
Promise.all(process.argv.slice(1).map(async f => ((await eslint.isPathIgnored(f)) ? null : f))).then(files =>
  files.filter(Boolean).forEach(f => console.log(f)),
);
" "${JS_TS_FILES[@]}")

if [[ "${#LINTABLE_FILES[@]}" -gt 0 ]]; then
  ./node_modules/.bin/eslint --cache --max-warnings=0 "${LINTABLE_FILES[@]}" >"$LOG_PREFIX-eslint.log" 2>&1 || fail "Stop blocked: eslint failed on changed files. See $LOG_PREFIX-eslint.log."
fi

# Project-wide (incremental via tsconfig): per-file checks miss breakage in importers.
if [[ -x ./node_modules/.bin/tsc && "${#TS_FILES[@]}" -gt 0 ]]; then
  ./node_modules/.bin/tsc --noEmit --pretty false >"$LOG_PREFIX-tsc.log" 2>&1 || fail "Stop blocked: TypeScript check failed. See $LOG_PREFIX-tsc.log."
fi

if [[ -x ./node_modules/.bin/jest && "${#JS_TS_FILES[@]}" -gt 0 ]]; then
  TZ=UTC yarn jest --runInBand --passWithNoTests --findRelatedTests "${JS_TS_FILES[@]}" >"$LOG_PREFIX-related-tests.log" 2>&1 || fail "Stop blocked: related tests failed. See $LOG_PREFIX-related-tests.log."
fi

exit 0

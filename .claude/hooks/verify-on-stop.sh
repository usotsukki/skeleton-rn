#!/usr/bin/env bash
# Stop hook: incremental lint + typecheck + related-tests on changed files.
# Skips if eslint/tsc-files/jest aren't installed yet.

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

mapfile -t CHANGED_FILES < <(git diff --name-only --cached --diff-filter=ACMR; git diff --name-only --diff-filter=ACMR) || true

if [[ "${#CHANGED_FILES[@]}" -eq 0 ]]; then
  exit 0
fi

CHANGED_FILES_LIMIT="${CLAUDE_VERIFY_ON_STOP_FILE_LIMIT:-200}"
if [[ "${#CHANGED_FILES[@]}" -gt "$CHANGED_FILES_LIMIT" ]]; then
  echo "verify-on-stop: skipping, ${#CHANGED_FILES[@]} changed files > ${CHANGED_FILES_LIMIT} cap" >&2
  exit 0
fi

declare -A seen
JS_TS_FILES=()
TS_FILES=()

for file in "${CHANGED_FILES[@]}"; do
  [[ -z "$file" ]] && continue
  # Skip files that don't exist on disk (e.g. staged-add then deleted in worktree).
  [[ ! -f "$file" ]] && continue
  if [[ -z "${seen[$file]+x}" ]]; then
    seen[$file]=1
    case "$file" in
      *.js|*.jsx|*.ts|*.tsx) JS_TS_FILES+=("$file") ;;
    esac
    case "$file" in
      *.ts|*.tsx) TS_FILES+=("$file") ;;
    esac
  fi
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

if [[ "${#JS_TS_FILES[@]}" -gt 0 ]]; then
  ./node_modules/.bin/eslint --cache "${JS_TS_FILES[@]}" >/tmp/skeleton-claude-eslint.log 2>&1 || fail "Stop blocked: eslint failed on changed files. Re-run and fix the reported issues."
fi

if [[ -x ./node_modules/.bin/tsc-files && "${#TS_FILES[@]}" -gt 0 ]]; then
  ./node_modules/.bin/tsc-files --noEmit --pretty false nativewind-env.d.ts "${TS_FILES[@]}" >/tmp/skeleton-claude-tsc.log 2>&1 || fail "Stop blocked: TypeScript check failed on changed files."
fi

if [[ -x ./node_modules/.bin/jest && "${#JS_TS_FILES[@]}" -gt 0 ]]; then
  TZ=UTC yarn jest --runInBand --passWithNoTests --findRelatedTests "${JS_TS_FILES[@]}" >/tmp/skeleton-claude-related-tests.log 2>&1 || fail "Stop blocked: related tests failed."
fi

exit 0

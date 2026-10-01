#!/bin/bash
# Bumps expo.version in app.json: yarn increment-version <major|minor|patch> [--decrement] [--commit]
#
# Build numbers are not touched: eas.json uses `appVersionSource: remote` with `autoIncrement`, so EAS
# owns iOS buildNumber / Android versionCode. A new version also changes the runtime version
# (`policy: appVersion`), so it needs a new build before OTA updates reach it.
# --commit commits app.json only (nothing else that is staged).
set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

fail() {
  echo -e "${RED}bump-version: $1${NC}" >&2
  exit 1
}

json_file="app.json"
update_type="${1:-}"
decrement=false
commit=false
for flag in "${@:2}"; do
  case "$flag" in
    --decrement) decrement=true ;;
    --commit) commit=true ;;
    *) fail "unknown option \"$flag\" (use --decrement and/or --commit)" ;;
  esac
done

[[ "$update_type" =~ ^(major|minor|patch)$ ]] || fail "use one of <major|minor|patch>"
[ -f "$json_file" ] || fail "$json_file not found"
command -v jq >/dev/null || fail "jq is required"

current_version=$(jq -r '.expo.version' "$json_file")
[[ "$current_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "expo.version \"$current_version\" is not x.y.z"
IFS='.' read -r major minor patch <<< "$current_version"

if $decrement; then
  case "$update_type" in
    major) ((major > 1)) || fail "cannot decrement major below 1"; major=$((major - 1)); minor=0; patch=0 ;;
    minor) ((minor > 0)) || fail "cannot decrement minor below 0"; minor=$((minor - 1)); patch=0 ;;
    patch) ((patch > 0)) || fail "cannot decrement patch below 0"; patch=$((patch - 1)) ;;
  esac
else
  case "$update_type" in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
  esac
fi

new_version="$major.$minor.$patch"
tmp_file="$(mktemp)"
jq --arg v "$new_version" '.expo.version = $v' "$json_file" > "$tmp_file"
mv "$tmp_file" "$json_file"
npx prettier --write "$json_file" >/dev/null

echo -e "${GREEN}✅ version: $current_version → $new_version${NC}"

if $commit; then
  git commit -m "chore: bump version to $new_version" -- "$json_file" || fail "commit failed; app.json is updated but not committed"
  echo -e "${GREEN}✅ committed $json_file${NC}"
fi

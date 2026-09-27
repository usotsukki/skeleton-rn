#!/usr/bin/env bash
# Creates a project-specific Android debug keystore at keystores/debug.keystore and prints its SHA-1.
#
# Why: the debug keystore that ships with React Native / Expo templates is identical everywhere, so
# Google Cloud often refuses "<package> + that SHA-1" (already registered by another project), which
# breaks Google Sign-In on local/dev builds. A per-project key avoids the clash.
#
# Register the printed SHA-1 as an Android OAuth client (same Google Cloud project as the web client id).
# Passwords/alias match the debug signingConfig Expo prebuild generates, so no Gradle changes are needed.
# Usage: ./scripts/generate-debug-keystore.sh [--force]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="$ROOT_DIR/keystores/debug.keystore"

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found. Install a JDK (17+) or put \$JAVA_HOME/bin on PATH." >&2
  exit 1
fi

if [[ -f "$KEYSTORE" && "${1:-}" != "--force" ]]; then
  echo "keystores/debug.keystore already exists (re-run with --force to replace it; its SHA-1 changes)." >&2
else
  mkdir -p "$(dirname "$KEYSTORE")"
  rm -f "$KEYSTORE"
  keytool -genkeypair -v -keystore "$KEYSTORE" -storepass android -alias androiddebugkey -keypass android \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
  echo "Created keystores/debug.keystore"
fi

keytool -list -v -keystore "$KEYSTORE" -storepass android -alias androiddebugkey | grep -E "SHA1:|SHA-1:"
echo "Next: run a native rebuild (yarn android:rebuild) so the plugin copies it into android/app."

#!/usr/bin/env bash
# Maestro sign-in with the .env.e2e test user (maestro/flows/sign-in.yaml). No-op when already signed in.
# Usage: yarn e2e:sign-in [--android]   (MAESTRO_DEVICE=<udid|serial> when several devices run; APP_ID overrides)
set -euo pipefail

if [[ -z "${E2E_EMAIL:-}" || -z "${E2E_PASSWORD:-}" ]]; then
	echo "e2e:sign-in: set E2E_EMAIL and E2E_PASSWORD in .env.e2e (see .env.e2e.example)" >&2
	exit 1
fi

# Resolved like the build (app.json fallback, `.test` suffix for testing builds).
if [[ -z "${APP_ID:-}" ]]; then
	[[ "${1:-}" == "--android" ]] && key=android.package || key=ios.bundleIdentifier
	APP_ID="$(npx expo config --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const [p,k]=process.argv[1].split(".");console.log(JSON.parse(s)[p]?.[k]??"")})' "$key")"
fi
if [[ -z "$APP_ID" ]]; then
	echo "e2e:sign-in: could not resolve the app id; set APP_ID" >&2
	exit 1
fi

exec maestro ${MAESTRO_DEVICE:+--device "$MAESTRO_DEVICE"} test \
	-e APP_ID="$APP_ID" -e E2E_EMAIL="$E2E_EMAIL" -e E2E_PASSWORD="$E2E_PASSWORD" \
	maestro/flows/sign-in.yaml

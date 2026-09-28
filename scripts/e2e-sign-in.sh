#!/usr/bin/env bash
# Maestro sign-in with the .env.e2e test user (maestro/flows/sign-in.yaml). No-op when already signed in.
# Usage: yarn e2e:sign-in [--android] [--hosted]
#   (MAESTRO_DEVICE=<udid|serial> when several devices run; APP_ID overrides)
# Targets the local stack (yarn backend:start). --hosted allows a hosted Supabase project: the credentials go
# to that project, so use a test user you created there.
set -euo pipefail

platform=ios
hosted=false
for arg in "$@"; do
	case "$arg" in
	--android) platform=android ;;
	--hosted) hosted=true ;;
	*)
		echo "e2e:sign-in: unknown option $arg" >&2
		exit 1
		;;
	esac
done

if [[ -z "${E2E_EMAIL:-}" || -z "${E2E_PASSWORD:-}" ]]; then
	echo "e2e:sign-in: set E2E_EMAIL and E2E_PASSWORD in .env.e2e (yarn backend:start creates it; see .env.e2e.example)" >&2
	exit 1
fi

# Without this, a hosted .env plus the seeded local user would send that password to the hosted project.
# The env here can differ from the bundle Metro already built, so the flow also asserts the app's own marker.
supabase_host="$(node -e 'try{console.log(new URL(process.argv[1]).hostname)}catch{console.log("")}' "${EXPO_PUBLIC_SUPABASE_URL:-}")"
case "$supabase_host" in
127.0.0.1 | localhost | "[::1]") ;;
*)
	if [[ "$hosted" != true ]]; then
		echo "e2e:sign-in: Supabase host is not local (${supabase_host:-unset}). Run yarn backend:start, or pass --hosted to sign in on the hosted project." >&2
		exit 1
	fi
	;;
esac

# Resolved like the build (app.json fallback, `.test` suffix for testing builds).
if [[ -z "${APP_ID:-}" ]]; then
	[[ "$platform" == android ]] && key=android.package || key=ios.bundleIdentifier
	APP_ID="$(npx expo config --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const [p,k]=process.argv[1].split(".");console.log(JSON.parse(s)[p]?.[k]??"")})' "$key")"
fi
if [[ -z "$APP_ID" ]]; then
	echo "e2e:sign-in: could not resolve the app id; set APP_ID" >&2
	exit 1
fi

exec maestro ${MAESTRO_DEVICE:+--device "$MAESTRO_DEVICE"} test \
	-e APP_ID="$APP_ID" -e E2E_EMAIL="$E2E_EMAIL" -e E2E_PASSWORD="$E2E_PASSWORD" \
	-e LOCAL_ONLY="$([[ "$hosted" == true ]] && echo false || echo true)" \
	maestro/flows/sign-in.yaml

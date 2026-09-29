#!/usr/bin/env bash
# Maestro sign-in with the .env.e2e test user (maestro/flows/sign-in.yaml). No-op when already signed in.
# Usage: yarn e2e:sign-in [--android] [--hosted] [--free-port]
#   (MAESTRO_DEVICE=<udid|serial> when several devices run; APP_ID overrides; E2E_TIMEOUT seconds, default 300)
# Targets the local stack (yarn backend:start). --hosted allows a hosted Supabase project: the credentials go
# to that project, so use a test user you created there.
set -euo pipefail

platform=ios
hosted=false
free_port=false
for arg in "$@"; do
	case "$arg" in
	--android) platform=android ;;
	--hosted) hosted=true ;;
	--free-port) free_port=true ;;
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

# Maestro talks to its driver through host port 7001 on both platforms and has no flag to change it.
# Another Maestro CLI holding it (often a `maestro mcp` server started by an editor or agent session)
# makes `maestro test` wait two minutes and fail with DEADLINE_EXCEEDED. --free-port stops that process.
owner="$(lsof -nP -iTCP:7001 -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $1, $2}' || true)"
if [[ "$owner" == java\ * ]]; then
	pid="${owner#java }"
	holder="$(ps -o command= -p "$pid" | cut -c1-160)"
	if [[ "$free_port" == true && "$holder" == *maestro* ]]; then
		echo "e2e:sign-in: stopping the Maestro process on port 7001 (pid ${pid})" >&2
		kill "$pid" 2>/dev/null || true
		for _ in 1 2 3 4 5 6 7 8 9 10; do
			[[ -z "$(lsof -nP -t -iTCP:7001 -sTCP:LISTEN 2>/dev/null || true)" ]] && break
			sleep 0.5
		done
		if [[ -n "$(lsof -nP -t -iTCP:7001 -sTCP:LISTEN 2>/dev/null || true)" ]]; then
			echo "e2e:sign-in: port 7001 is still in use after stopping pid ${pid}" >&2
			exit 1
		fi
	else
		echo "e2e:sign-in: port 7001 (Maestro driver) is held by another process, pid ${pid}:" >&2
		echo "  ${holder}" >&2
		echo "e2e:sign-in: stop it, or run again with --free-port (stops a Maestro process only)." >&2
		exit 1
	fi
fi

# A dev build opens the dev-client launcher, not the app, unless it remembers a server. With this
# project's Metro running, the flow opens the app on it; without (release build) it only launches.
dev_url=""
if metro_port="$(./scripts/dev.sh port 2>/dev/null)"; then
	scheme="$(npx expo config --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const v=JSON.parse(s).scheme;console.log(Array.isArray(v)?v[0]:v??"")})')"
	# The emulator's name for this machine; the simulator shares its network.
	[[ "$platform" == android ]] && metro_host=10.0.2.2 || metro_host=localhost
	[[ -n "$scheme" ]] && dev_url="${scheme}://expo-development-client/?url=http%3A%2F%2F${metro_host}%3A${metro_port}"
fi

timeout_s="${E2E_TIMEOUT:-300}"
maestro ${MAESTRO_DEVICE:+--device "$MAESTRO_DEVICE"} test \
	-e APP_ID="$APP_ID" -e E2E_EMAIL="$E2E_EMAIL" -e E2E_PASSWORD="$E2E_PASSWORD" \
	-e LOCAL_ONLY="$([[ "$hosted" == true ]] && echo false || echo true)" \
	-e DEV_URL="$dev_url" \
	maestro/flows/sign-in.yaml &
maestro_pid=$!
(
	sleep "$timeout_s"
	echo "e2e:sign-in: no result after ${timeout_s}s, stopping Maestro (pid ${maestro_pid})" >&2
	pkill -P "$maestro_pid" 2>/dev/null || true
	kill "$maestro_pid" 2>/dev/null || true
) &
watchdog_pid=$!
status=0
wait "$maestro_pid" || status=$?
kill "$watchdog_pid" 2>/dev/null || true
# Stopped by the watchdog (signal status): report a plain failure.
[[ "$status" -gt 128 ]] && status=1
exit "$status"

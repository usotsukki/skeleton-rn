#!/usr/bin/env bash
# Local Supabase for development (Docker). No cloud account needed.
# Usage: yarn backend:start [--full] | backend:stop | backend:reset | backend:types
#   start  starts the stack and points the app at it through .env.local (values are never printed)
#   stop   stops the stack and removes the override, so .env (hosted project, if any) applies again
#   reset  re-applies supabase/migrations and supabase/seed.sql
#   types  regenerates src/api/supabase/database.types.ts from the local database
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_LOCAL=".env.local"
TYPES_FILE="src/api/supabase/database.types.ts"
API_PORT=54321
URL_KEY="EXPO_PUBLIC_SUPABASE_URL"
PUBLISHABLE_KEY="EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
# Default: auth, database, REST and the email catcher. --full adds the rest (Studio, storage, realtime, …).
MINIMAL_EXCLUDES="studio,postgres-meta,storage-api,imgproxy,realtime,edge-runtime,logflare,vector,supavisor"

fail() {
	echo "backend: $*" >&2
	exit 1
}

ensure_docker() {
	command -v docker >/dev/null || fail "Docker is not installed (https://docs.docker.com/get-docker/)"
	docker info >/dev/null 2>&1 && return
	[[ "$(uname)" == "Darwin" ]] || fail "Docker is not running; start it and retry"
	echo "backend: starting Docker Desktop…"
	open -ga Docker || fail "could not launch Docker Desktop"
	for _ in $(seq 1 60); do
		docker info >/dev/null 2>&1 && return
		sleep 2
	done
	fail "Docker did not become ready within 120s (if Docker Desktop is open, restart it: its engine is not responding)"
}

# config.toml reads the auth redirect URLs from these, so a renamed fork needs no edit there.
export_auth_urls() {
	local scheme
	scheme="$(npx expo config --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const v=JSON.parse(s).scheme;console.log(Array.isArray(v)?v[0]:v??"")})')"
	[[ -n "$scheme" ]] || fail "could not resolve the app scheme (expo config)"
	export SUPABASE_AUTH_SITE_URL="${scheme}://"
	export SUPABASE_AUTH_REDIRECT_URL="${scheme}://**"
}

drop_override() {
	[[ -f "$ENV_LOCAL" ]] || return 0
	local rest
	rest="$(grep -v -E "^(${URL_KEY}|${PUBLISHABLE_KEY})=" "$ENV_LOCAL" || true)"
	if [[ -z "${rest//[[:space:]]/}" ]]; then
		rm -f "$ENV_LOCAL"
	else
		printf '%s\n' "$rest" >"$ENV_LOCAL"
	fi
}

# Only the URL and the publishable key leave `supabase status`; the service-role key is never written.
write_override() {
	local status url key
	status="$(yarn supabase status -o env 2>/dev/null)"
	url="$(printf '%s\n' "$status" | sed -n 's/^API_URL="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"
	key="$(printf '%s\n' "$status" | sed -n 's/^PUBLISHABLE_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"
	[[ -n "$key" ]] || key="$(printf '%s\n' "$status" | sed -n 's/^ANON_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"
	[[ -n "$url" && -n "$key" ]] || fail "could not read the API URL and publishable key from 'supabase status'"
	drop_override
	printf '%s="%s"\n%s="%s"\n' "$URL_KEY" "$url" "$PUBLISHABLE_KEY" "$key" >>"$ENV_LOCAL"
	echo "backend: wrote ${URL_KEY} and ${PUBLISHABLE_KEY} to ${ENV_LOCAL}"
}

# The seeded user's credentials are localhost-only defaults; never overwrites a filled-in file.
ensure_e2e_env() {
	[[ -s .env.e2e ]] && return 0
	cp .env.e2e.example .env.e2e
	echo "backend: created .env.e2e from .env.e2e.example (local dev user)"
}

case "${1:-}" in
start)
	ensure_docker
	export_auth_urls
	if [[ "${2:-}" == "--full" ]]; then
		yarn supabase start
	else
		yarn supabase start -x "$MINIMAL_EXCLUDES"
	fi
	write_override
	ensure_e2e_env
	echo "backend: ready. Restart Metro to pick up ${ENV_LOCAL}; stop with 'yarn backend:stop'."
	;;
stop)
	if docker info >/dev/null 2>&1; then
		export_auth_urls
		yarn supabase stop
	fi
	drop_override
	echo "backend: stopped; ${ENV_LOCAL} override removed."
	;;
reset)
	ensure_docker
	export_auth_urls
	yarn supabase db reset
	;;
types)
	ensure_docker
	export_auth_urls
	generated="$(yarn supabase gen types typescript --local)"
	[[ -n "$generated" ]] || fail "type generation returned nothing (is the stack running? yarn backend:start)"
	printf '%s\n' "$generated" >"$TYPES_FILE"
	npx prettier --write "$TYPES_FILE" >/dev/null
	echo "backend: wrote ${TYPES_FILE}"
	;;
*)
	fail "usage: backend.sh start [--full] | stop | reset | types"
	;;
esac

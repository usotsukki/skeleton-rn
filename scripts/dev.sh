#!/usr/bin/env bash
# One command from a fresh clone to the running app: local backend, Metro on a free port, native dev build.
# Usage: yarn dev [ios|android] [expo run flags] | yarn dev:stop | yarn dev:port
#   dev       starts the local backend, then builds and opens the app (default: ios). Metro runs in this
#             terminal; this project's Metro from another terminal is stopped first, because it inlined
#             the env it started with and would keep the app on the previous backend.
#   dev:stop  stops this project's Metro and the local backend
#   dev:port  prints the port of this project's running Metro (exit 1 when none)
set -euo pipefail

cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd -P)"
FIRST_PORT="${RCT_METRO_PORT:-8081}"
LAST_PORT=$((FIRST_PORT + 20))

fail() {
	echo "dev: $*" >&2
	exit 1
}

listener_pid() {
	# lsof exits 1 when nothing listens
	lsof -nP -t -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | head -1 || true
}

pid_cwd() {
	lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1 || true
}

# Another app's Metro on the default port is common (several forks on one machine), so ports are
# matched to this project by the listener's working directory.
own_metro_port() {
	local port pid
	for port in $(seq "$FIRST_PORT" "$LAST_PORT"); do
		pid="$(listener_pid "$port")"
		[[ -n "$pid" && "$(pid_cwd "$pid")" == "$PROJECT_ROOT" ]] && echo "$port" && return 0
	done
	return 1
}

free_port() {
	local port
	for port in $(seq "$FIRST_PORT" "$LAST_PORT"); do
		[[ -z "$(listener_pid "$port")" ]] && echo "$port" && return 0
	done
	return 1
}

case "${1:-ios}" in
ios | android)
	platform="${1:-ios}"
	[[ $# -gt 0 ]] && shift
	./scripts/backend.sh start
	if port="$(own_metro_port)"; then
		echo "dev: restarting this project's Metro on port ${port} so the bundle uses the local backend"
		kill "$(listener_pid "$port")"
		for _ in $(seq 1 20); do
			[[ -z "$(listener_pid "$port")" ]] && break
			sleep 0.5
		done
		[[ -z "$(listener_pid "$port")" ]] || fail "Metro on port ${port} did not stop"
	else
		port="$(free_port)" || fail "no free port between ${FIRST_PORT} and ${LAST_PORT}"
		[[ "$port" == "$FIRST_PORT" ]] || echo "dev: port ${FIRST_PORT} is taken by another app, using ${port}"
	fi
	export RCT_METRO_PORT="$port"
	exec npx expo run:"$platform" --port "$port" "$@"
	;;
stop)
	if port="$(own_metro_port)"; then
		kill "$(listener_pid "$port")"
		echo "dev: stopped Metro on port ${port}"
	else
		echo "dev: no Metro running for this project"
	fi
	./scripts/backend.sh stop
	;;
port)
	own_metro_port || fail "no Metro running for this project"
	;;
*)
	fail "usage: dev.sh [ios|android] [expo run flags] | stop | port"
	;;
esac

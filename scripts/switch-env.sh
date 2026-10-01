#!/bin/bash
# Copies an env profile over .env: yarn switch-env <testing|dev|production>
# (.env.testing, .env.dev, .env.production). Without an argument it keeps .env.
set -euo pipefail

case "${1:-}" in
  testing) SOURCE=".env.testing" ;;
  dev) SOURCE=".env.dev" ;;
  production) SOURCE=".env.production" ;;
  "") echo "Keeping .env"; exit 0 ;;
  *) echo "switch-env: unknown profile \"$1\" (use testing, dev or production)" >&2; exit 1 ;;
esac

if [ ! -f "$SOURCE" ]; then
  echo "switch-env: $SOURCE not found; .env is unchanged" >&2
  exit 1
fi

cp "$SOURCE" .env
echo "✅ .env now matches $SOURCE"

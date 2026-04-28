#!/bin/bash
# Grab Android device screenshot via adb, downscale so longest side <= 1400px.
#
# Usage:
#   ./scripts/and-ss.sh                 # -> /tmp/skeleton-and.png
#   ./scripts/and-ss.sh out.png         # custom path
#   AND_SS_MAX=1200 ./scripts/and-ss.sh # override max dim
set -euo pipefail
OUT="${1:-/tmp/skeleton-and.png}"
MAX="${AND_SS_MAX:-1400}"
adb exec-out screencap -p > "$OUT"
sips -Z "$MAX" "$OUT" >/dev/null
DIM="$(sips -g pixelWidth -g pixelHeight "$OUT" | awk '/pixel(Width|Height)/ {print $2}' | paste -sd x -)"
echo "${OUT} (${DIM})"

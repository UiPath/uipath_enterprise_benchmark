#!/usr/bin/env bash
set -euo pipefail

# Launch Xvfb and startxfce4
Xvfb "${DISPLAY:-:0}" -screen 0 "${SCREEN_WIDTH:-1920}x${SCREEN_HEIGHT:-1080}x${SCREEN_DEPTH:-24}" &
dbus-run-session startxfce4 &
sleep 1

# Start nginx
nginx -g "daemon off;" &
sleep 1

TASK_TYPE_VAL="${TASK_TYPE:-}"
TASK_ID_VAL="${TASK_ID:-}"
if [[ -z "$TASK_TYPE_VAL" ]]; then
TASK_URL=""
elif [[ -z "$TASK_ID_VAL" ]]; then
TASK_URL="$TASK_TYPE_VAL"
else
TASK_URL="$TASK_TYPE_VAL/$TASK_ID_VAL?mode=test"
fi

# Start Deterministic Benchmark
chromium "${START_URL:-http://localhost:80}/$TASK_URL" &
sleep 1

# Wait for Chromium DevTools to be ready on the internal port, then forward with socat
DEVTOOLS_HOST="127.0.0.1"
DEVTOOLS_PORT="${INTERNAL_CHROME_DEBUGGING_PORT:-9221}"
PUBLIC_PORT="${CHROME_DEBUGGING_PORT:-9222}"

# Readiness gate: wait until the DevTools socket is accepting connections
until bash -c ": < /dev/tcp/${DEVTOOLS_HOST}/${DEVTOOLS_PORT}" 2>/dev/null; do
  sleep 0.2
done

# Start socat TCP proxy to expose DevTools on 0.0.0.0:${PUBLIC_PORT}
socat -d -d TCP-LISTEN:${PUBLIC_PORT},fork,reuseaddr TCP:${DEVTOOLS_HOST}:${DEVTOOLS_PORT} &
sleep 1

# Start x11vnc on internal port 5902 in background with more robust flags
echo "Starting x11vnc on port ${VNC_PORT:-5902}"
# -rfbwait increases client I/O timeout; -deferupdate reduces frame churn; -noxdamage avoids
# damage extension issues; -quiet lowers log spam under high parallelism
x11vnc \
  -nopw -forever -repeat -shared \
  -rfbport "${VNC_PORT:-5902}" -display "${DISPLAY:-:0}" \
  -rfbwait ${VNC_RFBWAIT_MS:-120000} \
  -deferupdate ${VNC_DEFERUPDATE_MS:-10} \
  -noxdamage \
  -verbose

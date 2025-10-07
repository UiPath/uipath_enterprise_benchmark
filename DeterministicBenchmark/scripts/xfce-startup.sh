#!/usr/bin/env bash
set -euo pipefail

export DISPLAY="${DISPLAY:-:0}"
LOG="${STARTUP_LOG:-/tmp/startup.log}"
log(){ printf '%s %s\n' "$(date +'%F %T')" "$*" | tee -a "$LOG" >&2; }

# ---------- Xvfb ----------
Xvfb "$DISPLAY" -screen 0 "${SCREEN_WIDTH:-1920}x${SCREEN_HEIGHT:-1080}x${SCREEN_DEPTH:-24}" &
for _ in {1..200}; do xdpyinfo -display "$DISPLAY" >/dev/null 2>&1 && break; sleep 0.05; done
log "[xvfb] DISPLAY=$DISPLAY ready"

# ---------- Xfce (no dbus-run-session) ----------
startxfce4 &
log "[xfce] startxfce4 launched"

# Wait until xfce4-panel exists
PANEL_PID=""
for _ in {1..400}; do
  PANEL_PID="$(pgrep -n xfce4-panel || true)"
  [[ -n "$PANEL_PID" ]] && break
  sleep 0.05
done
if [[ -z "$PANEL_PID" ]]; then
  log "[xfce] xfce4-panel not found"; exit 1
fi
log "[xfce] xfce4-panel PID=$PANEL_PID"

# ---------- Adopt the panel's DBus *cleanly* ----------
DBUS_SESSION_BUS_ADDRESS=""
for _ in {1..200}; do
  DBUS_SESSION_BUS_ADDRESS="$(
    tr '\0' '\n' < "/proc/$PANEL_PID/environ" \
    | sed -n 's/^DBUS_SESSION_BUS_ADDRESS=//p' \
    | tr -d '\r'
  )"
  [[ -n "$DBUS_SESSION_BUS_ADDRESS" ]] && break
  sleep 0.05
done
if [[ -z "$DBUS_SESSION_BUS_ADDRESS" ]]; then
  log "[dbus] could not read DBUS_SESSION_BUS_ADDRESS from panel environ"; exit 1
fi
export DBUS_SESSION_BUS_ADDRESS
log "[dbus] adopted DBUS=$DBUS_SESSION_BUS_ADDRESS"

# Make sure xfconf answers
for _ in {1..200}; do xfconf-query -c xfce4-panel -l >/dev/null 2>&1 && break; sleep 0.05; done
pgrep -x xfsettingsd >/dev/null || xfsettingsd &

# ---------- Documents folder + Thunar Places + Desktop shortcut ----------
setup_documents_shortcuts() {
  # 1) Ensure folders exist
  mkdir -p "$HOME/Documents" "$HOME/Desktop"

  # 2) Add a GTK bookmark so it shows under “Places” in Thunar
  mkdir -p "$HOME/.config/gtk-3.0"
  BOOK="$HOME/.config/gtk-3.0/bookmarks"
  touch "$BOOK"
  grep -qxF "file://$HOME/Documents Documents" "$BOOK" || \
    echo "file://$HOME/Documents Documents" >> "$BOOK"

  # (optional, for old GTK2 apps that still read this file)
  BOOK2="$HOME/.gtk-bookmarks"
  touch "$BOOK2"
  grep -qxF "file://$HOME/Documents Documents" "$BOOK2" || \
    echo "file://$HOME/Documents Documents" >> "$BOOK2"

  # 3) Desktop shortcut to the Documents folder
  cat > "$HOME/Desktop/Documents.desktop" <<EOF
[Desktop Entry]
Type=Link
Name=Documents
URL=file://$HOME/Documents
Icon=folder
EOF
  chmod +x "$HOME/Desktop/Documents.desktop"

  # 4) (optional) Set XDG “Documents” for nicer labeling in apps
  mkdir -p "$HOME/.config"
  if ! grep -q '^XDG_DOCUMENTS_DIR=' "$HOME/.config/user-dirs.dirs" 2>/dev/null; then
    echo 'XDG_DOCUMENTS_DIR="$HOME/Documents"' >> "$HOME/.config/user-dirs.dirs"
  fi
  command -v xdg-user-dirs-update >/dev/null 2>&1 && xdg-user-dirs-update || true

  # 5) Copy non-hidden files only from public/copy-paste-tasks into Documents
  # Runtime has raw public under /usr/share/nginx/html/public
  local SRC_DIR
  SRC_DIR="${PUBLIC_ASSETS_DIR:-/usr/share/nginx/html/copy-paste-tasks}"
  if [[ -d "$SRC_DIR" ]]; then
    log "[docs] copying non-hidden files from $SRC_DIR -> $HOME/Documents"
    # Only copy non-hidden regular files at top level of the directory
    shopt -s nullglob
    for f in "$SRC_DIR"/*; do
      base="$(basename "$f")"
      # Skip dotfiles and dotdirs
      [[ "$base" = .* ]] && continue
      # Only files
      [[ -f "$f" ]] || continue
      cp -f "$f" "$HOME/Documents/$base"
    done
    shopt -u nullglob
  else
    log "[docs] source dir $SRC_DIR not found; skipping copy"
  fi
}

# run it once during startup
setup_documents_shortcuts &

# ---------- Warm up LibreOffice Calc profile ----------
warmup_libreoffice_calc() {
  local mark="$HOME/.config/.lo_warmed"
  [[ -f "$mark" ]] && return 0
  libreoffice --calc &
  local lo_pid=$!
  # Wait 10 seconds for the GUI to load and profile to be created
  for _ in {1..100}; do [[ -f "$HOME/.config/libreoffice/4/user/registrymodifications.xcu" ]] && break; sleep 10; done
  # Kill the process
  pkill -TERM -f 'soffice.bin' || true
  # Wait up to 50 attempts to ensure the process is killed
  for _ in {1..50}; do ! ps -p "$lo_pid" >/dev/null 2>&1 && break || sleep 0.2; done
  mkdir -p "$HOME/.config"; touch "$mark"
}

# Start warmup in background
warmup_libreoffice_calc &
WARMUP_PID=$!

# --- helpers (can be shared by Calc/Writer/Impress) ---
numbers_only() { awk '/^[0-9]+$/' ; }
ensure_lo_launcher_dir() {  # args: STOCK_DESKTOP BASENAME -> echoes plugin id
  local STOCK="$1" BASE="$2" id items
  for id in $(xfconf-query -c xfce4-panel -p /plugins -l | sed -n 's#.*/plugin-\([0-9]\+\)$#\1#p'); do
    [[ "$(xfconf-query -c xfce4-panel -p /plugins/plugin-$id -v 2>/dev/null || true)" = "launcher" ]] || continue
    items="$(xfconf-query -c xfce4-panel -p /plugins/plugin-$id/items -v 2>/dev/null || true)"
    printf '%s\n' "$items" | grep -qxF "$BASE"  && { echo "$id"; return; }
    printf '%s\n' "$items" | grep -qxF "$STOCK" && { echo "$id"; return; }
  done
  local next; next="$( { xfconf-query -c xfce4-panel -p /plugins -l | sed -n 's#.*/plugin-\([0-9]\+\)$#\1#p'; echo 0; } | numbers_only | sort -n | tail -1 )"
  local nid="$(( next + 1 ))"
  mkdir -p "$HOME/.config/xfce4/panel/launcher-$nid"
  cp "$STOCK" "$HOME/.config/xfce4/panel/launcher-$nid/$BASE"
  xfconf-query -c xfce4-panel -p "/plugins/plugin-$nid" --create -t string -s launcher
  xfconf-query -c xfce4-panel -p "/plugins/plugin-$nid/items" --create --force-array -t string -s "$BASE"
  echo "$nid"
}

dedupe_and_attach() { # args: PANEL_ID PLUGIN_ID
  local P="$1" PID="$2" cur uniq_ids
  cur="$(xfconf-query -c xfce4-panel -p /panels/panel-$P/plugin-ids -v 2>/dev/null | numbers_only || true)"
  uniq_ids="$(
    { printf '%s\n' $cur; echo "$PID"; } | numbers_only | awk '!seen[$0]++'
  )"
  if [[ "$(printf '%s\n' $cur)" != "$(printf '%s\n' $uniq_ids)" ]]; then
    xfconf-query -c xfce4-panel -p /panels/panel-$P/plugin-ids \
      $(for i in $uniq_ids; do printf -- "-t int -s %s " "$i"; done)
    # safe restart if service exists; otherwise start the panel
    if dbus-send --session --dest=org.xfce.Panel --print-reply / org.xfce.Panel.Restart >/dev/null 2>&1; then
      :
    else
      pgrep -x xfce4-panel >/dev/null || (xfce4-panel --disable-wm-check >/dev/null 2>&1 &)
    fi
  fi
}

# --- Calc, Writer & Impress to panel-2 once startup settles ---
attach_office_icons() {
  local P=2
  # ensure keys exist
  for _ in {1..200}; do xfconf-query -c xfce4-panel -p /panels/panel-$P/plugin-ids -v >/dev/null 2>&1 && break; sleep 0.05; done

  local pid_calc pid_writer pid_impress
  pid_calc="$(ensure_lo_launcher_dir    /usr/share/applications/libreoffice-calc.desktop     calc.desktop)"
  pid_writer="$(ensure_lo_launcher_dir  /usr/share/applications/libreoffice-writer.desktop   writer.desktop)"
  pid_impress="$(ensure_lo_launcher_dir /usr/share/applications/libreoffice-impress.desktop  impress.desktop)"

  dedupe_and_attach "$P" "$pid_calc"
  dedupe_and_attach "$P" "$pid_writer"
  dedupe_and_attach "$P" "$pid_impress"
  
  # Final panel refresh
  xfce4-panel -r >/dev/null 2>&1 || true
}

attach_office_icons &

# ---------- nginx ----------
nginx -g "daemon off;" &
sleep 1

# ---------- Chromium + DevTools proxy ----------
TASK_TYPE_VAL="${TASK_TYPE:-}"
TASK_ID_VAL="${TASK_ID:-}"
if [[ -z "$TASK_TYPE_VAL" ]]; then
  TASK_URL=""
elif [[ -z "$TASK_ID_VAL" ]]; then
  TASK_URL="$TASK_TYPE_VAL"
else
  TASK_URL="$TASK_TYPE_VAL/$TASK_ID_VAL?mode=test"
fi

chromium "${START_URL:-http://localhost:80}/$TASK_URL" &
sleep 1

DEVTOOLS_HOST="127.0.0.1"
DEVTOOLS_PORT="${INTERNAL_CHROME_DEBUGGING_PORT:-9221}"
PUBLIC_PORT="${CHROME_DEBUGGING_PORT:-9222}"
until bash -c ": < /dev/tcp/${DEVTOOLS_HOST}/${DEVTOOLS_PORT}" 2>/dev/null; do sleep 0.2; done
socat -d -d TCP-LISTEN:${PUBLIC_PORT},fork,reuseaddr TCP:${DEVTOOLS_HOST}:${DEVTOOLS_PORT} &
sleep 1

# ---------- Wait for LibreOffice warmup to complete ----------
log "[libreoffice] waiting for warmup to complete..."
wait $WARMUP_PID
log "[libreoffice] warmup completed"

# ---------- x11vnc ----------
log "[vnc] starting x11vnc on port ${VNC_PORT:-5902}"
exec x11vnc \
  -nopw -forever -repeat -shared \
  -rfbport "${VNC_PORT:-5902}" -display "$DISPLAY" \
  -rfbwait ${VNC_RFBWAIT_MS:-120000} \
  -deferupdate ${VNC_DEFERUPDATE_MS:-10} \
  -noxdamage \
  -verbose

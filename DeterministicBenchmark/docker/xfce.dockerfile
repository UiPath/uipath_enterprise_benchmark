# Multi-stage Dockerfile for DeterministicBenchmark (Vite + React + TS)
# Build:
#   docker build -t xfce:latest -f docker/xfce.dockerfile .
# Run (example):
#   docker run --rm -p 5902:5902 -p 9222:9222 -p 8080:80 xfce:latest

# ========= 1) Build stage =========
FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Node.js 20 (build-time only)
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

# Install deps & build
COPY package.json package-lock.json* ./
RUN npm ci
COPY src/ ./src/
COPY apps/ ./apps/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
ENV NODE_ENV=production
RUN npm run build

# ========= 2) Runtime stage =========
FROM ubuntu:24.04 AS runtime
ENV DEBIAN_FRONTEND=noninteractive \
    USER=root

# Base GUI/X stack, nginx, fonts, and Chromium runtime deps (Noble t64 set)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      # core tools
      ca-certificates curl gnupg locales socat xdg-utils \
      # X/desktop + VNC + headless display
      dbus-x11 x11vnc xfce4 xfce4-goodies xvfb xfonts-base \
      # web server
      nginx \
      # fonts (broad coverage)
      fonts-noto-color-emoji fonts-noto-core fonts-noto-ui-core fonts-noto-cjk \
      fonts-dejavu-core fonts-liberation2 fonts-crosextra-carlito fonts-crosextra-caladea \
      # Chromium runtime libraries (Ubuntu 24.04 / noble)
      libglib2.0-0t64 zlib1g libexpat1 \
      libnss3 libnspr4 \
      libx11-6 libxcb1 libxext6 libxfixes3 libxdamage1 libxcomposite1 \
      libxrandr2 libxkbcommon0 libxss1 libdrm2 libgbm1 libxshmfence1 \
      libwayland-client0 libwayland-egl1 \
      libatk1.0-0 libatspi2.0-0 libatk-bridge2.0-0 \
      libpango-1.0-0 libharfbuzz0b libcairo2 libgtk-3-0 \
      libasound2t64 \
      # LibreOffice
      libreoffice-calc libreoffice-writer libreoffice-impress \
      libreoffice-gtk3 \
 && rm -rf /var/lib/apt/lists/*

# Locale
RUN locale-gen en_US.UTF-8 && update-locale LANG=en_US.UTF-8
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Set LibreOffice to use GTK3
ENV SAL_USE_VCL=gtk3

# Refresh font cache
RUN fc-cache -f -v

# ---------- Install Node.js + npm in runtime so `npx` exists ----------
# (Using Ubuntu packages is fine here; if you prefer NodeSource, swap this block.)
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm \
 && rm -rf /var/lib/apt/lists/*

# ---------- Install Playwright's Chromium to stablize installation for all platforms ----------
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers
RUN mkdir -p "$PLAYWRIGHT_BROWSERS_PATH" \
 && npx --yes playwright@1.47.2 install chromium

# Normalize real binary path to /opt/chromium/chrome
RUN CHROME_BIN="$(find "$PLAYWRIGHT_BROWSERS_PATH" -maxdepth 3 -type f -path '*/chromium-*/chrome-linux/chrome' | head -n1)"; \
    test -x "$CHROME_BIN"; \
    install -d /opt/chromium; \
    ln -sf "$CHROME_BIN" /opt/chromium/chrome

# Wrapper so /etc/chromium.d/* flags & policies apply (like Ubuntu's packaged chromium)
RUN printf '%s\n' '#!/bin/sh' \
'set -e' \
'# source flag snippets (build up $CHROMIUM_FLAGS)' \
'if [ -d /etc/chromium.d ]; then' \
'  for f in /etc/chromium.d/*; do' \
'    [ -r "$f" ] && . "$f"' \
'  done' \
'fi' \
'# allow optional extra flags via CHROMIUM_FLAGS_EXTRA' \
'CHROMIUM_FLAGS="${CHROMIUM_FLAGS:-} ${CHROMIUM_FLAGS_EXTRA:-}"' \
'exec /opt/chromium/chrome $CHROMIUM_FLAGS "$@"' \
> /usr/bin/chromium && chmod +x /usr/bin/chromium \
 && ln -sf /usr/bin/chromium /usr/local/bin/chromium-browser

# ---------- Your Chromium default flags ----------
RUN mkdir -p /etc/chromium.d /var/tmp/chrome-profile && \
    printf '%s\n' 'export CHROMIUM_FLAGS="--no-sandbox --disable-dev-shm-usage --start-maximized --no-first-run --test-type --disable-logging --v=0"' \
      > /etc/chromium.d/00-default-flags && \
    printf '%s\n' 'export CHROMIUM_FLAGS="$CHROMIUM_FLAGS --log-level=3 --disable-features=Vulkan,PushMessaging,OnDeviceModel --use-gl=swiftshader --disable-gpu"' \
      > /etc/chromium.d/10-rendering-flags && \
    printf '%s\n' 'export CHROMIUM_FLAGS="$CHROMIUM_FLAGS --remote-debugging-port=$INTERNAL_CHROME_DEBUGGING_PORT --remote-allow-origins=* --user-data-dir=/var/tmp/chrome-profile --disable-backgrounding-occluded-windows --disable-renderer-backgrounding"' \
      > /etc/chromium.d/20-devtools-flags

# Fix chromium-browser.desktop to be chromium.desktop
# --- Make all launchers use the wrapper so flags apply ---
# Desktop entry that calls the wrapper (not the raw binary)
RUN mkdir -p /usr/share/applications && \
    cat >/usr/share/applications/chromium.desktop <<'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Chromium
GenericName=Web Browser
Comment=Access the Internet
Exec=/usr/bin/chromium %U
Terminal=false
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;x-scheme-handler/http;x-scheme-handler/https;
StartupNotify=true
StartupWMClass=Chromium
Icon=web-browser
EOF

# Some panels were pinned to chromium-browser.desktop — provide that alias too
RUN cp /usr/share/applications/chromium.desktop /usr/share/applications/chromium-browser.desktop

# Make the system “Web Browser” launcher (x-www-browser) point to the wrapper
RUN update-alternatives --install /usr/bin/x-www-browser x-www-browser /usr/bin/chromium 100 && \
    update-alternatives --set x-www-browser /usr/bin/chromium || true

# Tell XDG/EXO this is the default browser (so XFCE panel uses it)
RUN xdg-settings set default-web-browser chromium.desktop || true && \
    xdg-mime default chromium.desktop text/html && \
    xdg-mime default chromium.desktop x-scheme-handler/http && \
    x-scheme-handler/https || true


# ---------- Setup UiPath extension for future ----------
RUN mkdir -p /etc/chromium/policies/managed /etc/chromium-browser/policies \
 && ln -sf /etc/chromium/policies /etc/chromium-browser/policies
RUN cat >/etc/chromium/policies/managed/extension-settings.json <<'JSON'
{
  "ExtensionSettings": {
    "pgbnimfaaifjpebleldfhgcjdnaeafdi": {
      "installation_mode": "force_installed",
      "update_url": "https://clients2.google.com/service/update2/crx",
      "toolbar_pin": "force_pinned"
    }
  }
}
JSON

# Stub pm-is-supported to avoid xfce4-session warnings
RUN printf '%s\n' '#!/bin/sh' 'exit 1' > /usr/bin/pm-is-supported && chmod +x /usr/bin/pm-is-supported

# Environment for desktop & debugging
ENV DISPLAY=:0 \
    SCREEN_WIDTH=1920 \
    SCREEN_HEIGHT=1080 \
    SCREEN_DEPTH=24 \
    VNC_PORT=5902 \
    INTERNAL_CHROME_DEBUGGING_PORT=9221 \
    CHROME_DEBUGGING_PORT=9222 \
    START_URL="http://localhost:80" \
    TASK_TYPE="" \
    TASK_ID=""

# Copy web app into nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY scripts/xfce-startup.sh /startup.sh
RUN sed -i 's/\r$//' /startup.sh && chmod +x /startup.sh

# Expose VNC and DevTools ports + HTTP
EXPOSE ${VNC_PORT} ${CHROME_DEBUGGING_PORT}

# Sanity checks (fail build if chromium is missing)
RUN command -v chromium && chromium --version

# Start xvfb, xfce, x11vnc, socat, nginx (your script should do that)
CMD ["/startup.sh"]

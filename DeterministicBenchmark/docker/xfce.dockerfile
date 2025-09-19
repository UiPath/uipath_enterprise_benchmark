# Multi-stage Dockerfile for DeterministicBenchmark (Vite + React + TS)
# Run from /DeterministicBenchmark: docker build -t xfce:latest -f docker/xfce.dockerfile .

# 1) Build stage
FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive 
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

# Install deps (better cache) and build
COPY package.json package-lock.json* ./
RUN npm ci

# Copy only the source files needed for build (excluding dist/, node_modules/, eval/)
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

FROM ubuntu:24.04 AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    USER=root

# Base X/desktop bits
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    software-properties-common && \
    add-apt-repository -y ppa:xtradeb/apps && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    dbus-x11 \
    x11vnc \
    xfce4 \
    xfce4-goodies \
    xvfb \
    xfonts-base \
    ca-certificates \
    socat \
    locales \
    fonts-noto-color-emoji \
    fonts-noto-core \
    fonts-noto-ui-core \
    fonts-noto-cjk \
    nginx && \
    rm -rf /var/lib/apt/lists/*

# Generate and set locale
RUN locale-gen en_US.UTF-8 && \
    update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

# Refresh fontconfig cache
RUN fc-cache -f -v

# Environment variables for benchmark
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

# Make both commands available (some tools call chromium-browser)
RUN ln -s /usr/bin/chromium /usr/local/bin/chromium-browser || true

# Set default Chromium flags globally (applied on every launch)
RUN mkdir -p /etc/chromium.d && \
    printf '%s\n' 'export CHROMIUM_FLAGS="--no-sandbox --disable-dev-shm-usage --start-maximized --no-first-run --test-type --disable-logging --v=0"' \
      > /etc/chromium.d/00-default-flags && \
    printf '%s\n' 'export CHROMIUM_FLAGS="$CHROMIUM_FLAGS --log-level=3 --disable-features=Vulkan,PushMessaging,OnDeviceModel --use-gl=swiftshader --disable-gpu"' \
      > /etc/chromium.d/10-rendering-flags && \
    printf '%s\n' 'export CHROMIUM_FLAGS="$CHROMIUM_FLAGS --remote-debugging-port=$INTERNAL_CHROME_DEBUGGING_PORT --remote-allow-origins=* --user-data-dir=/var/tmp/chrome-profile --disable-backgrounding-occluded-windows --disable-renderer-backgrounding"' \
      > /etc/chromium.d/20-devtools-flags && \
    mkdir -p /var/tmp/chrome-profile

# Ensure policy dirs exist (and compat symlink for some Ubuntu builds) and
# force-install UiPath Browser Automation from Chrome Web Store
RUN mkdir -p /etc/chromium/policies/managed && \
    mkdir -p /etc/chromium-browser/policies && \
    ln -sf /etc/chromium/policies /etc/chromium-browser/policies && \
    cat >/etc/chromium/policies/managed/extension-settings.json <<'JSON'
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

# Expose VNC port
EXPOSE ${VNC_PORT}

# Expose Chromium debugging port
EXPOSE ${CHROME_DEBUGGING_PORT}

# Copy nginx and html
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY scripts/xfce-startup.sh /startup.sh
RUN chmod +x /startup.sh

# Start xvfb, xfce and x11vnc
CMD ["/startup.sh"]

# Multi-stage Dockerfile for DeterministicBenchmark (Vite + React + TS)

# 1) Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
ENV NODE_ENV=production
RUN npm run build

# 2) Runtime stage (serve static build via Nginx)
FROM nginx:alpine AS runtime

# Quiet notices and log requests to stdout/stderr. Provide SPA fallback.
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



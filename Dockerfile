# No syntax= line, so we never hit Docker Hub implicitly.

ARG BASE_IMAGE=onlyusedtesla.azurecr.io/base/node:20-alpine
ARG TAG=dev

###########
# 1) deps (install with lockfile)
###########
FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# ↓ Allow peer conflicts to unblock builds
RUN npm ci --legacy-peer-deps

###########
# 2) build (compile TS -> JS)
###########
FROM ${BASE_IMAGE} AS build
WORKDIR /app
COPY tsconfig*.json ./
COPY src ./src
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

###########
# 3) prod deps only (omit dev)
###########
FROM ${BASE_IMAGE} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# ↓ Keep prod tree small, but still allow peer conflicts
RUN npm ci --omit=dev --legacy-peer-deps

###########
# 4) runtime
###########
FROM ${BASE_IMAGE} AS runtime
# redeclare TAG so it's available in this stage too
ARG TAG=dev

WORKDIR /app
RUN apk add --no-cache dumb-init curl
ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# OCI labels (handy in ACR / Container Apps)
LABEL org.opencontainers.image.title="onlyusedtesla-api" \
      org.opencontainers.image.description="OnlyUsedTesla Fastify/NestJS API" \
      org.opencontainers.image.revision="${TAG}"

# payload
COPY --from=build      /app/dist          ./dist
COPY --from=prod-deps  /app/node_modules  ./node_modules
COPY package.json ./
# swagger (your app serves from src/swagger)
COPY src/swagger ./src/swagger

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://127.0.0.1:${PORT}/health || exit 1

USER node
CMD ["dumb-init","node","--enable-source-maps","dist/src/main.js"]

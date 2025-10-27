# No "syntax=" line so we never hit Docker Hub automatically.

# Your mirrored base image in ACR. Override at build time if needed.
ARG BASE_IMAGE=onlyusedtesla.azurecr.io/base/node:20-alpine
ARG TAG=dev

###########
# 1) Dependencies (install with lockfile)
###########
FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

###########
# 2) Build (compile TS -> JS)
###########
FROM ${BASE_IMAGE} AS build
WORKDIR /app
COPY tsconfig*.json ./
COPY src ./src
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

###########
# 3) Prod deps only (omit dev)
###########
FROM ${BASE_IMAGE} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

###########
# 4) Runtime
###########
FROM ${BASE_IMAGE} AS runtime
WORKDIR /app

# small helpers
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# OCI labels (useful in ACR/Container Apps)
LABEL org.opencontainers.image.title="onlyusedtesla-api" \
      org.opencontainers.image.description="OnlyUsedTesla Fastify/NestJS API" \
      org.opencontainers.image.source="https://github.com/onlyusedtesla/onlyusedtesla-api" \
      org.opencontainers.image.revision="${TAG}"

# app payload
COPY --from=build      /app/dist          ./dist
COPY --from=prod-deps  /app/node_modules  ./node_modules
COPY package.json ./

# Your app currently serves swagger from src/swagger (keep it)
COPY src/swagger ./src/swagger

# healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://127.0.0.1:${PORT}/health || exit 1

# node user already exists in the official node alpine image
USER node

CMD ["dumb-init","node","--enable-source-maps","dist/src/main.js"]


# syntax=docker/dockerfile:1

###########
# deps for build (with dev deps)
###########
FROM node:20-alpine AS deps
WORKDIR /app
# make sure BOTH files exist in git
COPY package.json package-lock.json ./
# keep legacy-peer-deps to mirror your local install and avoid peer stalemates
RUN npm ci --no-audit --no-fund --legacy-peer-deps

###########
# build
###########
FROM deps AS build
WORKDIR /app
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# put swagger next to dist (your main.ts reads src/swagger, too)
RUN mkdir -p dist/swagger
COPY src/swagger/openapi.yaml dist/swagger/openapi.yaml
# keep a copy under src/swagger for current main.ts behavior
COPY src/swagger/openapi.yaml src/swagger/openapi.yaml

###########
# deps for runtime (production only, clean tree)
###########
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# install ONLY prod deps in a clean environment
RUN npm ci --omit=dev --no-audit --no-fund --legacy-peer-deps

###########
# runtime
###########
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache dumb-init curl
ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# app code
COPY --from=build /app/dist ./dist
# prod node_modules only
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
# swagger for your current main.ts path resolution
COPY --from=build /app/src/swagger ./src/swagger

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://127.0.0.1:${PORT}/health || exit 1

USER node
CMD ["dumb-init","node","--enable-source-maps","dist/src/main.js"]

# syntax=docker/dockerfile:1

###########
# deps + build
###########
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY tsconfig*.json ./
COPY src ./src
# Build TS → JS
RUN npm run build
# Keep only production deps for runtime
RUN npm prune --omit=dev
# Put Swagger alongside dist and (for your current code) under src too
RUN mkdir -p dist/swagger
COPY src/swagger/openapi.yaml dist/swagger/openapi.yaml
# keep a copy under src/swagger since main.ts reads from src/swagger at runtime
# (no-op in local dev; required for container)
# If you later change main.ts to prefer dist/swagger, you can delete the next line.
COPY src/swagger/openapi.yaml src/swagger/openapi.yaml

###########
# runtime
###########
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# copy built app and prod node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
# also copy swagger for your current main.ts path resolution:
COPY --from=build /app/src/swagger ./src/swagger

# healthcheck hits /health
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://127.0.0.1:${PORT}/health || exit 1

USER node
CMD ["dumb-init","node","--enable-source-maps","dist/src/main.js"]

# syntax=docker/dockerfile:1

###########
# deps + build
###########
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev
RUN mkdir -p dist/swagger
COPY src/swagger/openapi.yaml dist/swagger/openapi.yaml
COPY src/swagger/openapi.yaml src/swagger/openapi.yaml

###########
# runtime
###########
FROM node:20-alpine AS runtime
WORKDIR /app

# ✅ just install your tools
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# Copy built app and production deps
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
# Keep swagger alongside dist as your main.ts expects src/swagger
COPY --from=build /app/src/swagger ./src/swagger

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://127.0.0.1:${PORT}/health || exit 1

# Use existing non-root user from the base image
USER node
CMD ["dumb-init","node","--enable-source-maps","dist/src/main.js"]
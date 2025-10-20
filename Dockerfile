###########
# deps for building (dev deps present)
###########
FROM onlyusedtesla.azurecr.io/base/node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

###########
# build TS → JS
###########
FROM deps AS build
WORKDIR /app
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

###########
# prod deps only (no dev)
###########
FROM onlyusedtesla.azurecr.io/base/node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

###########
# runtime
###########
FROM onlyusedtesla.azurecr.io/base/node:20-alpine AS runtime
WORKDIR /app
# No adduser/addgroup — node user already exists in this image
RUN apk add --no-cache dumb-init curl
ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# app bits
COPY --from=build /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

# your app currently serves swagger from src/swagger, so include it
COPY src/swagger ./src/swagger

# container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fs http://127.0.0.1:${PORT}/health || exit 1

USER node
CMD ["dumb-init","node","--enable-source-maps","dist/src/main.js"]

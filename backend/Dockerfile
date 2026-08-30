# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts

COPY tsconfig.json tsconfig.backend.json tsconfig.build.json nest-cli.json ./
COPY backend/ backend/
COPY shared/ shared/

RUN npx nest build

# ── Stage 2: Production ────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache tini

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist dist/

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/backend/src/main.js"]

# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts

COPY tsconfig.json tsconfig.backend.json tsconfig.build.json nest-cli.json ./
COPY backend/ backend/
COPY shared/ shared/

RUN node node_modules/@prisma/engines/scripts/postinstall.js

RUN npx prisma generate --schema backend/prisma/schema.prisma

RUN npx nest build

# ── Stage 2: Production ────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache tini

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist dist/

COPY --from=build /app/node_modules/.prisma node_modules/.prisma

COPY --from=build /app/node_modules/@prisma/engines node_modules/@prisma/engines
COPY --from=build /app/node_modules/prisma node_modules/prisma
COPY backend/prisma/ backend/prisma/
COPY scripts/db-url.js scripts/migrate.js scripts/
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/backend/src/main.js"]

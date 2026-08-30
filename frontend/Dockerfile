# ── Stage 1: Build Angular ─────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts

COPY tsconfig.json tsconfig.frontend.json tsconfig.frontend.app.json ./
COPY angular.json ./
COPY frontend/ frontend/
COPY shared/ shared/

RUN npx ng build

# ── Stage 2: Serve with nginx ─────────────────────────────
FROM nginx:stable-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

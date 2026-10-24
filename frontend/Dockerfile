# Stage 1: Base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies for building
FROM base AS install
COPY package.json bun.lock ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN bun install --frozen-lockfile --filter @ejara/txman-frontend

# Stage 3: Build the static site
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY --from=install /app/frontend/node_modules frontend/node_modules
COPY frontend frontend
WORKDIR /app/frontend
RUN bun run build

# Stage 4: Production image, static files behind nginx (also proxies /api)
FROM nginxinc/nginx-unprivileged:alpine AS production
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 8080

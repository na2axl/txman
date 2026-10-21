# Stage 1: Base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 2: Install all dependencies (dev + prod) for building
FROM base AS install-dev
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY backend/package.json /temp/dev/backend/package.json
COPY frontend/package.json /temp/dev/frontend/package.json
RUN cd /temp/dev && bun install --frozen-lockfile --filter @ejara/txman-frontend

# Stage 3: Install production-only dependencies
FROM base AS install-prod
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY backend/package.json /temp/prod/backend/package.json
COPY frontend/package.json /temp/prod/frontend/package.json
RUN cd /temp/prod && bun install --frozen-lockfile --filter @ejara/txman-frontend --production

# Stage 4: Build the application
FROM base AS build
COPY --from=install-dev /temp/dev/node_modules node_modules
COPY --from=install-dev /temp/dev/frontend/node_modules frontend/node_modules
COPY frontend frontend
WORKDIR /app/frontend
RUN bun run build

# Stage 5: Production image
FROM base AS production
# Copy production dependencies
COPY --from=install-prod /temp/prod/package.json package.json
COPY --from=install-prod /temp/prod/node_modules node_modules
COPY --from=install-prod /temp/prod/frontend/package.json frontend/package.json
COPY --from=install-prod /temp/prod/frontend/node_modules frontend/node_modules
# Copy built artifacts
COPY --from=build /app/frontend/build frontend/build
# Run as non-root user for security
USER bun
EXPOSE 3000
CMD ["bun", "run", "start:frontend"]

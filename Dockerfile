FROM node:20.18.1-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json package-lock.json ./

# ---- Build the static site ----
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---- Production image: serves the prebuilt static site via nginx ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS prod
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080

FROM node:20.18.1-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json package-lock.json ./

# ---- Build the static site ----
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---- Production image: serves the prebuilt static site via nginx, behind basic auth ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS prod
USER root
RUN apk add --no-cache apache2-utils
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh
USER nginx
EXPOSE 8080
CMD ["/usr/local/bin/start.sh"]

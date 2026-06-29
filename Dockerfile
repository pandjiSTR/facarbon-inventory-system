FROM php:8.3-cli AS backend

RUN apt-get update && apt-get install -y \
    libzip-dev unzip git libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install zip pdo_mysql mbstring gd xml bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app/backend
COPY backend/ .
RUN composer install --no-dev --optimize-autoloader --prefer-source

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ── Frontend ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS frontend

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/frontend
COPY frontend/ .
RUN npm ci && npm run build

FROM nginx:alpine AS frontend-prod
COPY --from=frontend /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

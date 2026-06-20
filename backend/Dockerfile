FROM php:8.3-fpm-alpine

# Install system dependencies & PHP extensions
# 1. Tambahkan libzip-dev di bagian apk add
RUN apk add --no-cache \
     nginx \
     supervisor \
     curl \
     libpng-dev \
     libxml2-dev \
     zip \
     unzip \
     git \
     postgresql-dev \
     freetype-dev \
     libjpeg-turbo-dev \
     libzip-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Setup working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Setup Nginx configuration
RUN mkdir -p /run/nginx
COPY ./nginx.conf /etc/nginx/nginx.conf

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80

CMD ["sh", "-c", "nginx && php-fpm"]
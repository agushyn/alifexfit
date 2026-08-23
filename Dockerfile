# =========================================================
# STAGE 1: Build Frontend Assets (React + Inertia + Vite)
# =========================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm ci

# Copy application source files needed for building frontend
COPY tsconfig.json vite.config.ts ./
COPY resources/ resources/
COPY public/ public/

# Build production assets into public/build
RUN npm run build


# =========================================================
# STAGE 2: PHP 8.3 Production Runtime (Nginx + PHP-FPM)
# =========================================================
FROM php:8.3-fpm-alpine

LABEL maintainer="EXFIT Gym Management System"
LABEL description="Production Docker image for EXFIT on Render.com with Supabase"

# Install system dependencies, Nginx, Supervisor, and database development libraries
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    postgresql-dev \
    icu-dev \
    oniguruma-dev \
    bash

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        pgsql \
        pdo_mysql \
        mbstring \
        zip \
        bcmath \
        gd \
        opcache \
        intl \
        pcntl \
        exif

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy Composer dependencies first for layer caching
COPY composer.json composer.lock ./

# Install PHP production dependencies without running scripts
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy application codebase
COPY . .

# Finish autoloader optimization
RUN composer dump-autoload --optimize --no-dev

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/public/build public/build

# Copy Docker configuration files
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Set executable permissions on entrypoint
RUN chmod +x /usr/local/bin/entrypoint.sh

# Setup storage and cache permissions for www-data
RUN mkdir -p storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             storage/logs \
             storage/app/public \
             bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Render.com default port (dynamically overridden at runtime by $PORT)
EXPOSE 10000 80

# Define container entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

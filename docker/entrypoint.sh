#!/bin/sh
set -e

# Render.com dynamic port handling (defaults to 10000 or 80 if PORT is unset)
RENDER_PORT=${PORT:-10000}
echo "Starting EXFIT Gym Application on port: $RENDER_PORT"

# Replace LISTEN_PORT in nginx configuration
sed -i "s/LISTEN_PORT/$RENDER_PORT/g" /etc/nginx/http.d/default.conf || \
sed -i "s/LISTEN_PORT/$RENDER_PORT/g" /etc/nginx/conf.d/default.conf

# Ensure storage directories exist and have proper permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage symlink
php artisan storage:link --force || true

# Production optimization caches
if [ -n "$APP_KEY" ]; then
    echo "Warming Laravel production caches..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
    php artisan event:cache || true
else
    echo "WARNING: APP_KEY is not set. Skipping config:cache."
fi

# Run database migrations if AUTO_MIGRATE is true (default: true for first deploy)
if [ "$AUTO_MIGRATE" != "false" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || echo "Migration warning: could not connect to database or migrations already up to date."
fi

echo "Starting Nginx and PHP-FPM via Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

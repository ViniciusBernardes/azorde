#!/bin/sh
set -e
cd /var/www/html

# Dentro do Docker o host do MySQL é o serviço "mysql", não o .env do Mac.
export DB_CONNECTION="${DB_CONNECTION:-mysql}"
export DB_HOST="${DB_HOST:-mysql}"
export DB_PORT="${DB_PORT:-3306}"
export DB_DATABASE="${DB_DATABASE:-azorde}"
export DB_USERNAME="${DB_USERNAME:-azorde}"
export DB_PASSWORD="${DB_PASSWORD:-azorde}"
export SESSION_DRIVER="${SESSION_DRIVER:-file}"
export CACHE_STORE="${CACHE_STORE:-file}"

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

php artisan config:clear || true
php artisan storage:link || true

i=0
until php artisan migrate --force; do
  i=$((i + 1))
  if [ "$i" -gt 30 ]; then
    echo "Banco indisponível."
    exit 1
  fi
  sleep 2
done

php artisan db:seed --force
exec php artisan serve --host=0.0.0.0 --port=8000

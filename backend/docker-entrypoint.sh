#!/bin/sh
set -e
cd /var/www/html

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

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

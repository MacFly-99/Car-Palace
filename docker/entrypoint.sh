#!/bin/sh
set -e
cd /var/www/html

if [ ! -f config/jwt/private.pem ]; then
  php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
fi

php bin/console cache:clear --no-warmup
php bin/console cache:warmup
php bin/console assets:install public --no-interaction || true

chown -R www-data:www-data var config/jwt

exec apache2-foreground
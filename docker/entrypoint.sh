#!/bin/sh
set -e
cd /var/www/html

# Clés JWT fixes fournies par Render (Secret Files), si elles existent
if [ -f /etc/secrets/private.pem ] && [ -f /etc/secrets/public.pem ]; then
  mkdir -p config/jwt
  cp /etc/secrets/private.pem config/jwt/private.pem
  cp /etc/secrets/public.pem config/jwt/public.pem
  sed -i 's/\r$//' config/jwt/private.pem config/jwt/public.pem
fi

# Sinon, clés temporaires (elles changent à chaque démarrage)
if [ ! -f config/jwt/private.pem ]; then
  php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
fi

php bin/console cache:clear --no-warmup
php bin/console cache:warmup
php bin/console assets:install public --no-interaction || true

chown -R www-data:www-data var config/jwt
chmod 600 config/jwt/private.pem
chmod 644 config/jwt/public.pem

exec apache2-foreground
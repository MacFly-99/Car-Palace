ARG PHP_VERSION=8.2
FROM php:${PHP_VERSION}-apache

ENV APP_ENV=prod \
    APP_DEBUG=0 \
    COMPOSER_ALLOW_SUPERUSER=1 \
    PORT=10000

RUN apt-get update && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/*

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN install-php-extensions intl pdo_mysql zip opcache mongodb-1.21.0 \
    && a2enmod rewrite headers

# Vérification : le build s'arrête ici avec un message clair si mongodb manque
RUN php -m | grep -i mongodb

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN sed -i 's/Listen 80$/Listen ${PORT}/' /etc/apache2/ports.conf
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf
COPY docker/security.conf /etc/apache2/conf-available/zz-security.conf
COPY docker/php-security.ini /usr/local/etc/php/conf.d/zz-security.ini
RUN sed -i 's/\r$//' /etc/apache2/conf-available/zz-security.conf /usr/local/etc/php/conf.d/zz-security.ini \
    && a2enconf zz-security

WORKDIR /var/www/html

COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --no-security-blocking

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev --no-scripts \
    && mkdir -p var config/jwt

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["entrypoint.sh"]
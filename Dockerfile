# Dockerfile pour Car Palace Backend (Symfony 7 + MongoDB + MySQL)

FROM php:8.2-cli

# 1. Installation des dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 2. Extensions PHP natives
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    zip \
    opcache \
    xml \
    curl

# 3. Extension MongoDB
RUN pecl install mongodb-1.21.10 \
    && docker-php-ext-enable mongodb

# 4. Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/composer

# 5. Copie du projet
WORKDIR /var/www/html
COPY . .

# 6. Installation des dépendances (avec dev pour Fixtures)
RUN composer install --optimize-autoloader --no-interaction

# 7. Scripts Symfony (cache, assets)
RUN php bin/console cache:clear --env=prod --no-debug || true \
    && php bin/console assets:install public --env=prod || true

# 8. Dossiers var/
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log

# 9. Génération des clés JWT
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true

# 10. Port d'écoute
EXPOSE 10000

# 11. Démarrage
CMD php -S 0.0.0.0:${PORT:-10000} -t public
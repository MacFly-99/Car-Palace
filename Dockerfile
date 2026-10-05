# Dockerfile pour Car Palace Backend (Symfony 7 + MySQL + MongoDB)

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

# 6. Config Composer : désactiver advisories
RUN composer config --no-plugins audit.block-insecure false

# 7. Installation des dépendances
RUN composer install --optimize-autoloader --no-interaction --no-scripts

# 8. FORCER l'installation du bundle Fixtures (au cas où)
RUN composer require doctrine/doctrine-fixtures-bundle:^4.3 --no-interaction --no-scripts --no-update \
    && composer update doctrine/doctrine-fixtures-bundle --no-interaction --no-scripts

# 9. VÉRIFICATION
RUN ls -la vendor/doctrine/doctrine-fixtures-bundle/ || (echo "FIXTURES MANQUANT" && exit 1)

# 10. Dossiers var/
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log

# 11. Port
EXPOSE 10000

# 12. Démarrage
CMD php -S 0.0.0.0:${PORT:-10000} -t public
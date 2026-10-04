# Dockerfile pour Car Palace Backend (Symfony + MongoDB)
# Version 11 - Config finale propre

FROM php:8.2-cli

# Installation des dépendances système
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

# Extensions PHP natives
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    zip \
    opcache \
    xml \
    curl

# Extension MongoDB
RUN pecl install mongodb-1.21.10 \
    && docker-php-ext-enable mongodb

# Installation de Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 🔑 Autoriser Composer en root (indispensable dans Docker)
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/composer

# Copie du projet
WORKDIR /var/www/html
COPY . .

# 🚨 Installation des dépendances SANS scripts (on les exécute après)
RUN rm -rf vendor/ var/cache/* var/log/* \
    && composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# 🔑 EXÉCUTION MANUELLE DES SCRIPTS (remplace symfony-cmd)
RUN php bin/console cache:clear --env=prod --no-debug || true \
    && php bin/console assets:install public --env=prod || true

# 🔍 Vérification que autoload_runtime existe
RUN ls -la /var/www/html/vendor/autoload_runtime.php

# Création des dossiers var/
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log

# Génération des clés JWT
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true

# Démarrage
CMD php -S 0.0.0.0:${PORT:-80} -t public
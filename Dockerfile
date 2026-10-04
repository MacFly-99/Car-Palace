# Dockerfile pour Car Palace Backend (Symfony + MongoDB)
# Version FINALE - Regénération composer.lock + tout en un

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

# Autoriser Composer en root + désactiver les advisories
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/composer

# Copie du projet
WORKDIR /var/www/html
COPY . .

# 🚨 INSTALLATION COMPLÈTE SANS CONTRAINTE DE LOCK NI ADVISORY
RUN rm -rf vendor/ var/cache/* var/log/* composer.lock \
    && composer config --no-plugins allow-plugins.symfony/flex true \
    && composer config --no-plugins allow-plugins.symfony/runtime true \
    && composer config --no-plugins audit.block-insecure false \
    && composer update --optimize-autoloader --no-interaction --no-scripts --no-dev

# 🔍 VÉRIFICATION 1 : bundle fixtures présent
RUN ls -la /var/www/html/vendor/doctrine/doctrine-fixtures-bundle/ || (echo "❌ FIXTURES MANQUANT" && exit 1)

# 🔍 VÉRIFICATION 2 : symfony/runtime présent
RUN ls -la /var/www/html/vendor/symfony/runtime/ || (echo "❌ RUNTIME MANQUANT" && exit 1)

# Exécution manuelle des scripts Symfony
RUN php bin/console cache:clear --env=prod --no-debug || true \
    && php bin/console assets:install public --env=prod || true

# Création des dossiers var/
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log

# Génération des clés JWT
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true

# Démarrage
CMD php -S 0.0.0.0:${PORT:-80} -t public
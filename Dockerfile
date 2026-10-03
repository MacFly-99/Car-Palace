# Dockerfile pour Car Palace Backend (Symfony + MongoDB)
# Version 7 - Utilisation de PHP CLI au lieu d'Apache (plus fiable)

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

# Copie du projet
WORKDIR /var/www/html
COPY . .

# Installation des dépendances Composer
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Création des dossiers var/ + permissions
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log

# Génération des clés JWT
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true

# Démarrage avec le serveur PHP intégré sur le port Railway
CMD php -S 0.0.0.0:${PORT:-80} -t public
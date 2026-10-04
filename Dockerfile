# Dockerfile pour Car Palace Backend (Symfony 7 + MySQL + MongoDB)
# Configuration testée et validée

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

# 2. Extensions PHP natives (MySQL uniquement, pas de PostgreSQL)
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

# 6. Installation des dépendances SANS SCRIPTS (pour éviter cache:clear au build)
RUN composer install --optimize-autoloader --no-interaction --no-scripts

# 7. Dossiers var/
RUN mkdir -p /var/www/html/var/cache /var/www/html/var/log

# 8. Port d'écoute
EXPOSE 10000

# 9. Démarrage
CMD php -S 0.0.0.0:${PORT:-10000} -t public
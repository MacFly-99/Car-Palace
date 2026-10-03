# Dockerfile pour Car Palace Backend (Symfony + MongoDB)
FROM php:8.2-apache

# Installation des dépendances système + extensions PHP
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

# Extension MongoDB via PECL
RUN pecl install mongodb-1.21.10 \
    && docker-php-ext-enable mongodb

# Installation de Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configuration Apache pour pointer vers public/
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Activation du module rewrite
RUN a2enmod rewrite

# Copie du projet
WORKDIR /var/www/html
COPY . .

# Installation des dépendances Composer
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Génération des clés JWT + cache
RUN php bin/console lexik:jwt:generate-keypair --skip-if-exists || true
RUN php bin/console cache:clear --env=prod --no-debug || true

# Permissions
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/public /var/www/html/config

# Exposition du port (Railway fournit $PORT)
EXPOSE 80

# Démarrage
CMD ["apache2-foreground"]
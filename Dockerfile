FROM php:8.2-apache

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite and other useful modules
RUN a2enmod rewrite headers

# Copy your app files
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/

WORKDIR /var/www/html

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:10000"]

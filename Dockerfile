FROM php:8.2-apache

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules for CORS and rewrite
RUN a2enmod rewrite headers

# Copy your app files
COPY . /var/www/html/

# Copy Apache configuration for CORS
COPY apache.conf /etc/apache2/conf-available/cors.conf
RUN a2enconf cors

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/ \
    && chmod -R 755 /var/www/html/

# Configure Apache to allow .htaccess and enable CORS
RUN echo '<Directory /var/www/html/>\n\
    AllowOverride All\n\
    Require all granted\n\
    Header always set Access-Control-Allow-Origin "https://soil-indol.vercel.app"\n\
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"\n\
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"\n\
    Header always set Access-Control-Allow-Credentials "true"\n\
</Directory>' >> /etc/apache2/apache2.conf

WORKDIR /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]

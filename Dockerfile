FROM php:8.2-cli

# Install mysqli extension dependencies and enable it
RUN docker-php-ext-install mysqli

# Copy your app files
COPY app /app

WORKDIR /app

EXPOSE 10000

CMD ["php", "-S", "0.0.0.0:10000"]

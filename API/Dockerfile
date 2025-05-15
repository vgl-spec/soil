# Use official PHP CLI image with built-in server
FROM php:8.2-cli

# Copy your app files into the container at /app
COPY . /app

# Set working directory
WORKDIR /app

# Expose the port Render expects (10000)
EXPOSE 10000

# Start PHP built-in web server on port 10000
CMD ["php", "-S", "0.0.0.0:10000"]
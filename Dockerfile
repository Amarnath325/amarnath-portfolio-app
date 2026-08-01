FROM php:8.2-cli

RUN apt-get update && apt-get install -y git unzip libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN if [ -d "backend" ]; then cp -a backend/. /app/ ; fi

RUN mkdir -p public bootstrap/cache storage/framework/views storage/framework/sessions storage/framework/cache storage/logs database
RUN touch database/database.sqlite
RUN chmod -R 777 bootstrap/cache storage database

RUN echo "APP_NAME=Laravel\nAPP_ENV=production\nAPP_KEY=base64:d3pZNWxWOGdYMXhRMnFWWjNlUjV0WTd1Tzh4Vzl6WTA=\nAPP_DEBUG=true\nAPP_URL=http://localhost\nDB_CONNECTION=sqlite\nDB_DATABASE=/app/database/database.sqlite" > .env

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer update --no-dev --optimize-autoloader --no-scripts --no-interaction

RUN chmod +x /app/artisan || true

EXPOSE 10000

CMD php artisan key:generate --force && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=10000

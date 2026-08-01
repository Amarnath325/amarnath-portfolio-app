FROM php:8.2-cli

RUN apt-get update && apt-get install -y git unzip libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN if [ -d "backend" ]; then cp -a backend/. /app/ ; fi

RUN echo "APP_NAME=Laravel\nAPP_ENV=production\nAPP_KEY=base64:7q6V+9H3gL/3f0M2P9k+X1K0N1P2Q3R4S5T6U7V8W9X=\nAPP_DEBUG=false\nAPP_URL=http://localhost\nDB_CONNECTION=sqlite" > .env
RUN mkdir -p database && touch database/database.sqlite

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer update --no-dev --optimize-autoloader --no-scripts --no-interaction

EXPOSE 10000

CMD ["sh", "-c", "if [ -f /app/artisan ]; then php /app/artisan key:generate --force && php /app/artisan migrate --force && php /app/artisan db:seed --force && php /app/artisan serve --host=0.0.0.0 --port=10000; else php /app/backend/artisan key:generate --force && php /app/backend/artisan migrate --force && php /app/backend/artisan db:seed --force && php /app/backend/artisan serve --host=0.0.0.0 --port=10000; fi"]

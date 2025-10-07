#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx wait-on tcp:db:5432

echo "Running prisma migrate deploy..."
npx prisma migrate deploy

echo "Prisma migrate finished. Starting application..."
exec "$@"
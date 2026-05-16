#!/bin/sh
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[docker-entrypoint] DATABASE_URL is not set — cannot run migrations or connect the app." >&2
  exit 1
fi

if [ "${SKIP_PRISMA_MIGRATE:-}" != "true" ]; then
  echo "[docker-entrypoint] prisma migrate deploy"
  node ./node_modules/prisma/build/index.js migrate deploy
fi

exec "$@"

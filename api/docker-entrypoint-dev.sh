#!/bin/sh
set -e
cd /app
if [ ! -f node_modules/.bin/nest ]; then
    echo "[api-dev] Installing dependencies..."
    npm install
fi
exec "$@"

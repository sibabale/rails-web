#!/bin/sh
set -e

echo "=== Starting entrypoint script ==="

# Use PORT from environment, or default to 80 if not set
export PORT="${PORT:-80}"
echo "PORT environment variable: ${PORT}"

# Substitute PORT environment variable in nginx config
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "=== Generated nginx config ==="
cat /etc/nginx/conf.d/default.conf | head -10

echo "=== Starting nginx ==="
# Start nginx
exec nginx -g 'daemon off;'

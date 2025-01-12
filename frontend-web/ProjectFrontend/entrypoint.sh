#!/bin/sh
echo "Running entrypoint script..."

sed -i "s|APIURL|${APIURL}|g" /usr/share/nginx/html/main*.js

exec "$@"

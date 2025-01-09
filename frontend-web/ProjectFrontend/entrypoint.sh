#!/bin/sh

# Any setup or initialization commands can go here
echo "Running entrypoint script..."

# Update environment.ts file with the specified values
cat <<EOT > /app/src/environments/environment.ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8083',
    apiUrlReview: 'http://localhost:8083/api/reviews',
    apiUrlPost: 'http://localhost:8083/api/',
    apiUrlComment: 'http://localhost:8083/api/comments',
};

# Start the main process
exec "$@"

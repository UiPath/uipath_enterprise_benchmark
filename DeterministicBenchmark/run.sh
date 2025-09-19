#!/bin/bash

if [ "$1" = "prod" ]; then
    echo "Running in production mode..."
    npm run build && npm run preview
else
    echo "Running in development mode..."
    npm run dev
fi

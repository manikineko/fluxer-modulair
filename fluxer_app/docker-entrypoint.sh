#!/bin/bash
set -e

# Create dist directory and copy static assets
mkdir -p /usr/src/app/fluxer_app/dist/assets
cp -r /usr/src/app/fluxer_static/assets/* /usr/src/app/fluxer_app/dist/assets/ 2>/dev/null || true

# Run the default command
exec "$@"

#!/bin/bash

# Organize static files into correct directories
# This script ensures static files are in the right locations for nginx

STATIC_DIR="$(dirname "$0")/../fluxer_static"

cd "$STATIC_DIR" || exit 1

# Create directories if they don't exist
mkdir -p avatars badges media static web fonts

# Move badge SVGs to badges/ if they're in root
for file in *.svg; do
    if [ -f "$file" ]; then
        mv "$file" badges/
    fi
done

# Move favicon and apple-touch-icon to root and static/
if [ -f "web/favicon-32x32.png" ]; then
    cp web/favicon-32x32.png ./
    cp web/favicon-32x32.png static/
fi

if [ -f "web/apple-touch-icon.png" ]; then
    cp web/apple-touch-icon.png ./
    cp web/apple-touch-icon.png static/
fi

echo "Static files organized successfully."

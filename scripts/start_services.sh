#!/bin/bash

cd "$(dirname "$0")/.."

echo "Organizing static files..."
./scripts/organize_static.sh

echo "Starting Fluxer services..."
docker compose up -d

echo "Services started. Use 'docker compose ps' to check status."

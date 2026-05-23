#!/bin/bash

cd "$(dirname "$0")/.."

echo "Stopping Fluxer services..."
docker compose down

echo "Services stopped."

#!/bin/bash

# Stop Fluxer services
# This script stops all Docker services and cloudflared tunnel if running

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Stopping Fluxer Services"
echo "=========================================="
echo ""

# Stop cloudflared if service exists
if systemctl is-active cloudflared-fluxer &>/dev/null; then
    echo "Stopping cloudflared tunnel..."
    systemctl stop cloudflared-fluxer
    echo "✓ Cloudflared tunnel stopped"
fi

# Stop all Docker services from both compose files
echo "Stopping Docker services..."

# Try docker-compose.simple.yaml first
if [ -f "docker-compose.simple.yaml" ]; then
    if docker compose -f docker-compose.simple.yaml down; then
        echo "✓ Docker services stopped (docker-compose.simple.yaml)"
    else
        echo "⚠ Failed to stop services from docker-compose.simple.yaml"
    fi
fi

# Also try compose.yaml if it exists
if [ -f "compose.yaml" ]; then
    if docker compose -f compose.yaml down; then
        echo "✓ Docker services stopped (compose.yaml)"
    else
        echo "⚠ Failed to stop services from compose.yaml"
    fi
fi

# Stop any remaining fluxer containers
echo "Stopping any remaining Fluxer containers..."
docker ps -a --filter "name=fluxer" --format "{{.Names}}" | while read container; do
    echo "  Stopping $container..."
    docker stop "$container" 2>/dev/null || true
    docker rm "$container" 2>/dev/null || true
done

echo ""
echo "=========================================="
echo "All services stopped successfully!"
echo "=========================================="
echo ""

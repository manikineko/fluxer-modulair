#!/bin/bash

# Stop Fluxer services
# This script stops Docker services and cloudflared tunnel if running

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

# Stop Docker services
echo "Stopping Docker services..."
if docker compose -f docker-compose.simple.yaml down; then
    echo "✓ Docker services stopped"
else
    echo "✗ Failed to stop Docker services"
    exit 1
fi

echo ""
echo "=========================================="
echo "Services stopped successfully!"
echo "=========================================="
echo ""

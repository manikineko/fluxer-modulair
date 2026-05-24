#!/bin/bash

# Start Fluxer services
# This script starts Docker services and cloudflared tunnel if configured

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Starting Fluxer Services"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please run cloudflare-nginx-setup.sh first."
    exit 1
fi

# Start Docker services
echo "Starting Docker services..."
if docker compose -f docker-compose.simple.yaml --profile minimal up -d; then
    echo "✓ Docker services started"
else
    echo "✗ Failed to start Docker services"
    exit 1
fi

# Start cloudflared if service exists
if systemctl is-enabled cloudflared-fluxer &>/dev/null; then
    echo "Starting cloudflared tunnel..."
    systemctl start cloudflared-fluxer
    echo "✓ Cloudflared tunnel started"
fi

echo ""
echo "=========================================="
echo "Services started successfully!"
echo "=========================================="
echo ""
echo "To view logs:"
echo "  Docker: docker compose -f docker-compose.simple.yaml logs -f"
echo "  Cloudflared: journalctl -u cloudflared-fluxer -f"
echo ""

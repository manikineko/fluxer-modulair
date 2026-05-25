#!/bin/bash

# Health Check Script for Fluxer Services
# Checks all services including gateway

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load .env file
ENV_FILE="${SCRIPT_DIR}/.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE" 2>/dev/null || true
fi

# Default ports if not set in .env
FLUXER_PUBLIC_PORT="${FLUXER_PUBLIC_PORT:-49320}"
FLUXER_ADMIN_PORT="${FLUXER_ADMIN_PORT:-40003}"
FLUXER_GATEWAY_PORT="${FLUXER_GATEWAY_PORT:-49107}"
FLUXER_MARKETING_PORT="${FLUXER_MARKETING_PORT:-49531}"
POSTGRES_PORT="${POSTGRES_PORT:-5400}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
MEILI_PORT="${MEILI_PORT:-7700}"
LIVEKIT_PORT="${LIVEKIT_PORT:-7800}"
NATS_PORT="${NATS_PORT:-4222}"

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if a port is listening
check_port() {
    local port=$1
    local service=$2
    
    if command -v ss &> /dev/null; then
        if ss -tuln | grep -q ":${port} "; then
            print_success "$service is listening on port $port"
            return 0
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":${port} "; then
            print_success "$service is listening on port $port"
            return 0
        fi
    fi
    
    print_error "$service is NOT listening on port $port"
    return 1
}

# Check if a Docker container is running
check_container() {
    local container=$1
    
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        print_success "$container container is running"
        return 0
    else
        print_error "$container container is NOT running"
        return 1
    fi
}

# Check if a URL is accessible
check_url() {
    local url=$1
    local service=$2
    
    if command -v curl &> /dev/null; then
        if curl -sf -o /dev/null --max-time 5 "$url" 2>/dev/null; then
            print_success "$service is accessible at $url"
            return 0
        else
            print_error "$service is NOT accessible at $url"
            return 1
        fi
    else
        print_warning "curl not available, skipping URL check for $service"
        return 0
    fi
}

echo "=========================================="
echo "Fluxer Services Health Check"
echo "=========================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

print_info "Checking Docker containers..."
echo ""

# Check core infrastructure
check_container "valkey"
check_container "nats"
check_container "postgres"

# Check storage services
check_container "minio"
check_container "ipfs"

# Check Fluxer services
check_container "fluxer_server"
check_container "fluxer_admin"
check_container "fluxer_app"
check_container "fluxer_app_proxy"

# Check optional services
if docker ps --format "{{.Names}}" | grep -q "meilisearch"; then
    check_container "meilisearch"
fi

if docker ps --format "{{.Names}}" | grep -q "livekit"; then
    check_container "livekit"
fi

echo ""
print_info "Checking service ports..."
echo ""

# Check ports
check_port "$FLUXER_PUBLIC_PORT" "Fluxer Server (Public)"
check_port "$FLUXER_GATEWAY_PORT" "Fluxer Gateway"
check_port "$FLUXER_ADMIN_PORT" "Fluxer Admin"
check_port "$FLUXER_MARKETING_PORT" "Fluxer Marketing"
check_port "$POSTGRES_PORT" "PostgreSQL"
check_port "$MINIO_PORT" "MinIO"
check_port "$MINIO_CONSOLE_PORT" "MinIO Console"
check_port "$MEILI_PORT" "Meilisearch"
check_port "$LIVEKIT_PORT" "LiveKit"
check_port "$NATS_PORT" "NATS"

echo ""
print_info "Checking service endpoints..."
echo ""

# Check endpoints
if [ -n "$DOMAIN" ]; then
    BASE_URL="${PUBLIC_SCHEME:-http}://${DOMAIN}"
    
    check_url "${BASE_URL}" "Fluxer App"
    check_url "${BASE_URL}/api" "Fluxer API"
    check_url "${BASE_URL}/media" "Fluxer Media"
    
    if [ -n "$FLUXER_STATIC_CDN" ]; then
        check_url "$FLUXER_STATIC_CDN" "Static CDN"
    fi
    
    if echo "$DOMAIN" | grep -q "admin"; then
        check_url "${BASE_URL}" "Fluxer Admin"
    else
        check_url "https://admin.${DOMAIN}" "Fluxer Admin"
    fi
else
    print_warning "DOMAIN not set in .env, skipping endpoint checks"
fi

echo ""
echo "=========================================="
echo "Health check complete"
echo "=========================================="

#!/bin/bash

# Update Nginx Ports Script
# Updates backend ports in existing nginx configs without recreating them

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Load .env file
ENV_FILE="${SCRIPT_DIR}/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found"
    exit 1
fi

source "$ENV_FILE" 2>/dev/null || true

# Default ports if not set in .env
FLUXER_PUBLIC_PORT="${FLUXER_PUBLIC_PORT:-49320}"
FLUXER_API_PORT="${FLUXER_API_PORT:-49321}"
FLUXER_ADMIN_PORT="${FLUXER_ADMIN_PORT:-40003}"
FLUXER_GATEWAY_PORT="${FLUXER_GATEWAY_PORT:-49107}"
FLUXER_MARKETING_PORT="${FLUXER_MARKETING_PORT:-49531}"
FLUXER_STATIC_CDN_PORT="${FLUXER_STATIC_CDN_PORT:-8082}"

echo "=========================================="
echo "Update Nginx Ports"
echo "=========================================="
echo ""
print_info "Ports from .env:"
echo "  FLUXER_PUBLIC_PORT: $FLUXER_PUBLIC_PORT"
echo "  FLUXER_API_PORT: $FLUXER_API_PORT"
echo "  FLUXER_ADMIN_PORT: $FLUXER_ADMIN_PORT"
echo "  FLUXER_GATEWAY_PORT: $FLUXER_GATEWAY_PORT"
echo "  FLUXER_MARKETING_PORT: $FLUXER_MARKETING_PORT"
echo "  FLUXER_STATIC_CDN_PORT: $FLUXER_STATIC_CDN_PORT"
echo ""

# Find nginx config directory
NGINX_CONF_DIR="${SCRIPT_DIR}/fluxer_devops/nginx"
if [ ! -d "$NGINX_CONF_DIR" ]; then
    NGINX_CONF_DIR="/etc/nginx"
fi

if [ ! -d "$NGINX_CONF_DIR" ]; then
    print_error "Nginx config directory not found"
    exit 1
fi

print_info "Updating nginx configs in: $NGINX_CONF_DIR"
echo ""

# Find all nginx config files
CONFIG_FILES=$(find "$NGINX_CONF_DIR" -name "*.conf" -type f 2>/dev/null)

if [ -z "$CONFIG_FILES" ]; then
    print_error "No nginx config files found"
    exit 1
fi

UPDATED_COUNT=0

for config_file in $CONFIG_FILES; do
    print_info "Checking: $config_file"
    
    # Create backup
    cp "$config_file" "${config_file}.backup"
    
    # Update ports - only if the pattern exists
    if grep -q "127.0.0.1:[0-9]" "$config_file"; then
        # Update gateway port
        sed -i "s/127\.0\.0\.1:9443/127.0.0.1:$FLUXER_GATEWAY_PORT/g" "$config_file" 2>/dev/null || true
        sed -i "s/127\.0\.0\.1:49107/127.0.0.1:$FLUXER_GATEWAY_PORT/g" "$config_file" 2>/dev/null || true
        
        # Update main/backend port (fluxer_server)
        sed -i "s/127\.0\.0\.1:8443/127.0.0.1:$FLUXER_API_PORT/g" "$config_file" 2>/dev/null || true
        sed -i "s/127\.0.0\.1:49320/127.0.0.1:$FLUXER_API_PORT/g" "$config_file" 2>/dev/null || true
        sed -i "s/127\.0.0\.1:49321/127.0.0.1:$FLUXER_API_PORT/g" "$config_file" 2>/dev/null || true
        
        # Update public port (fluxer_app)
        sed -i "s/127\.0.0\.1:8080/127.0.0.1:$FLUXER_PUBLIC_PORT/g" "$config_file" 2>/dev/null || true
        
        # Update admin port
        sed -i "s/127\.0.0\.1:3001/127.0.0.1:$FLUXER_ADMIN_PORT/g" "$config_file" 2>/dev/null || true
        sed -i "s/127\.0.0\.1:40003/127.0.0.1:$FLUXER_ADMIN_PORT/g" "$config_file" 2>/dev/null || true
        
        # Update marketing port
        sed -i "s/127\.0.0\.1:49531/127.0.0.1:$FLUXER_MARKETING_PORT/g" "$config_file" 2>/dev/null || true
        
        # Update static CDN port
        sed -i "s/127\.0.0\.1:8082/127.0.0.1:$FLUXER_STATIC_CDN_PORT/g" "$config_file" 2>/dev/null || true
        
        # Check if file was modified
        if ! diff -q "$config_file" "${config_file}.backup" > /dev/null 2>&1; then
            print_success "Updated: $config_file"
            UPDATED_COUNT=$((UPDATED_COUNT + 1))
        else
            rm "${config_file}.backup"
            print_info "No changes needed: $config_file"
        fi
    else
        rm "${config_file}.backup"
        print_info "No backend ports found: $config_file"
    fi
done

echo ""
if [ $UPDATED_COUNT -gt 0 ]; then
    print_success "Updated $UPDATED_COUNT nginx config file(s)"
    echo ""
    print_info "Testing nginx configuration..."
    if command -v nginx &> /dev/null; then
        if nginx -t 2>&1; then
            print_success "Nginx configuration is valid"
            echo ""
            print_info "To apply changes, run:"
            echo "  sudo systemctl reload nginx"
            echo "  or"
            echo "  sudo nginx -s reload"
        else
            print_error "Nginx configuration test failed"
            print_info "Restoring backups..."
            for config_file in $CONFIG_FILES; do
                if [ -f "${config_file}.backup" ]; then
                    mv "${config_file}.backup" "$config_file"
                fi
            done
            exit 1
        fi
    else
        print_warning "nginx command not found, skipping test"
    fi
else
    print_info "No files were updated"
fi

echo ""
echo "=========================================="
echo "Done"
echo "=========================================="

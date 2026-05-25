#!/bin/bash

# Restore Nginx Configs from Project
# SAFELY copies ONLY specific nginx config files from project to /etc/nginx
# DOES NOT delete anything, only overwrites exact files that exist in source

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root (use sudo)"
    exit 1
fi

echo "=========================================="
echo "Restore Nginx Configs from Project"
echo "=========================================="
echo ""
print_info "SAFE MODE: This script ONLY copies files that exist in source"
print_info "It will NOT delete any files or directories"
echo ""

# Source nginx config directory
SOURCE_NGINX_DIR="${SCRIPT_DIR}/fluxer_devops/nginx"
TARGET_NGINX_DIR="/etc/nginx"

if [ ! -d "$SOURCE_NGINX_DIR" ]; then
    print_error "Source nginx directory not found: $SOURCE_NGINX_DIR"
    exit 1
fi

print_info "Source: $SOURCE_NGINX_DIR"
print_info "Target: $TARGET_NGINX_DIR"
echo ""

print_info "Files that will be copied (only if they exist in source):"
echo ""

# Copy main nginx.conf (only if exists in source)
if [ -f "$SOURCE_NGINX_DIR/nginx.conf" ]; then
    print_info "  - nginx.conf"
    cp "$SOURCE_NGINX_DIR/nginx.conf" "$TARGET_NGINX_DIR/nginx.conf"
    print_success "Copied nginx.conf"
else
    print_info "  - nginx.conf (not found in source, skipping)"
fi

# Copy individual site configs from sites directory (only if they exist)
if [ -d "$SOURCE_NGINX_DIR/sites" ]; then
    mkdir -p "$TARGET_NGINX_DIR/sites-available"
    for site_file in "$SOURCE_NGINX_DIR/sites"/*; do
        if [ -f "$site_file" ]; then
            filename=$(basename "$site_file")
            print_info "  - sites-available/$filename"
            cp "$site_file" "$TARGET_NGINX_DIR/sites-available/$filename"
            print_success "Copied $filename"
        fi
    done
else
    print_info "  - sites directory (not found in source, skipping)"
fi

echo ""
print_info "Testing nginx configuration..."

if nginx -t 2>&1; then
    print_success "Nginx configuration is valid"
    echo ""
    print_info "To apply changes, run:"
    echo "  sudo systemctl reload nginx"
    echo "  or"
    echo "  sudo nginx -s reload"
else
    print_error "Nginx configuration test failed"
    print_info "Your original configs are still in place"
    print_info "Only the files listed above were modified"
    exit 1
fi

echo ""
echo "=========================================="
echo "Done"
echo "=========================================="

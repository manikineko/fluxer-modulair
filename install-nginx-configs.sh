#!/bin/bash

# Install Nginx Configs Script
# Copies nginx configs from project to /etc/nginx

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
echo "Install Nginx Configs"
echo "=========================================="
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

# Create backup directory
BACKUP_DIR="/tmp/nginx-backup-$(date +%Y%m%d-%H%M%S)"
print_info "Creating backup of existing configs to: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup existing configs
if [ -d "$TARGET_NGINX_DIR" ]; then
    cp -r "$TARGET_NGINX_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    print_success "Backup created"
fi

echo ""
print_info "Copying nginx configs..."

# Copy main nginx.conf
if [ -f "$SOURCE_NGINX_DIR/nginx.conf" ]; then
    cp "$SOURCE_NGINX_DIR/nginx.conf" "$TARGET_NGINX_DIR/nginx.conf"
    print_success "Copied nginx.conf"
fi

# Copy sites-available
if [ -d "$SOURCE_NGINX_DIR/sites-available" ]; then
    mkdir -p "$TARGET_NGINX_DIR/sites-available"
    cp -r "$SOURCE_NGINX_DIR/sites-available"/* "$TARGET_NGINX_DIR/sites-available/" 2>/dev/null || true
    print_success "Copied sites-available"
fi

# Copy sites-enabled
if [ -d "$SOURCE_NGINX_DIR/sites-enabled" ]; then
    mkdir -p "$TARGET_NGINX_DIR/sites-enabled"
    cp -r "$SOURCE_NGINX_DIR/sites-enabled"/* "$TARGET_NGINX_DIR/sites-enabled/" 2>/dev/null || true
    print_success "Copied sites-enabled"
fi

# Copy conf.d
if [ -d "$SOURCE_NGINX_DIR/conf.d" ]; then
    mkdir -p "$TARGET_NGINX_DIR/conf.d"
    cp -r "$SOURCE_NGINX_DIR/conf.d"/* "$TARGET_NGINX_DIR/conf.d/" 2>/dev/null || true
    print_success "Copied conf.d"
fi

# Copy ssl directory if it exists
if [ -d "$SOURCE_NGINX_DIR/ssl" ]; then
    mkdir -p "$TARGET_NGINX_DIR/ssl"
    cp -r "$SOURCE_NGINX_DIR/ssl"/* "$TARGET_NGINX_DIR/ssl/" 2>/dev/null || true
    print_success "Copied ssl certificates"
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
    echo ""
    print_info "Backup location: $BACKUP_DIR"
    print_info "To restore backup if needed:"
    echo "  sudo cp -r $BACKUP_DIR/* /etc/nginx/"
else
    print_error "Nginx configuration test failed"
    print_info "Restoring backup..."
    rm -rf "$TARGET_NGINX_DIR"/*
    cp -r "$BACKUP_DIR"/* "$TARGET_NGINX_DIR/"
    print_success "Backup restored"
    exit 1
fi

echo ""
echo "=========================================="
echo "Done"
echo "=========================================="

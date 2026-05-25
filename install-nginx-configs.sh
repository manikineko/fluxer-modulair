#!/bin/bash

# Install Nginx Configs Script
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
echo "Install Nginx Configs"
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

# DO NOT copy nginx.conf - it has stream directive that may not be supported
# Only copy site-specific configs

# Copy ONLY specific site configs that match fluxer project
# Do NOT touch any other files in sites-available
if [ -d "$SOURCE_NGINX_DIR/sites" ]; then
    mkdir -p "$TARGET_NGINX_DIR/sites-available"
    # Only copy files that start with fluxer or are explicitly fluxer-related
    for site_file in "$SOURCE_NGINX_DIR/sites"/*; do
        if [ -f "$site_file" ]; then
            filename=$(basename "$site_file")
            # Only copy if it's a fluxer-related config
            if [[ "$filename" == *"fluxer"* ]] || [[ "$filename" == *"proxcord"* ]] || [[ "$filename" == *"app"* ]] || [[ "$filename" == *"admin"* ]] || [[ "$filename" == *"api"* ]]; then
                # Backup only this file
                if [ -f "$TARGET_NGINX_DIR/sites-available/$filename" ]; then
                    cp "$TARGET_NGINX_DIR/sites-available/$filename" "/tmp/$filename.backup"
                    print_info "  - sites-available/$filename (backed up to /tmp/$filename.backup)"
                else
                    print_info "  - sites-available/$filename (no existing file to backup)"
                fi
                cp "$site_file" "$TARGET_NGINX_DIR/sites-available/$filename"
                print_success "Copied $filename"
            else
                print_info "  - sites-available/$filename (skipping - not fluxer-related)"
            fi
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
    echo ""
    print_info "Backups are in /tmp/*.backup"
    print_info "To restore a specific file if needed:"
    echo "  sudo cp /tmp/<filename>.backup /etc/nginx/sites-available/<filename>"
else
    print_error "Nginx configuration test failed"
    print_info "Restoring backups..."
    # Restore only the site files we backed up
    for backup_file in /tmp/*.backup; do
        if [ -f "$backup_file" ]; then
            filename=$(basename "$backup_file" .backup)
            if [ -f "$backup_file" ]; then
                cp "$backup_file" "$TARGET_NGINX_DIR/sites-available/$filename"
                print_success "Restored $filename"
            fi
        fi
    done
    print_success "Backups restored"
    exit 1
fi

echo ""
echo "=========================================="
echo "Done"
echo "=========================================="

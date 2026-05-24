#!/bin/bash

# Fluxer Key Reset Script
# Generates new random keys and secrets for config.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/config/config.json"
ENV_FILE="$PROJECT_ROOT/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Generate random hex string
generate_hex() {
    local length=$1
    openssl rand -hex $((length / 2)) 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c $length
}

# Generate random base64 string
generate_base64() {
    local length=$1
    openssl rand -base64 $((length * 3 / 4)) 2>/dev/null | tr -d '/+=' | head -c $length
}

# Backup original config
backup_config() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${CONFIG_FILE}.backup_${timestamp}"
    cp "$CONFIG_FILE" "$backup_file"
    print_success "Backup created: $backup_file"
}

# Check if jq is installed
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed. Please install jq."
        exit 1
    fi
}

# Reset keys in config.json
reset_keys() {
    print_info "Generating new keys and secrets..."
    
    # Generate new S3 keys
    local s3_access_key=$(generate_hex 32)
    local s3_secret_key=$(generate_hex 64)
    
    # Generate new MinIO credentials
    local minio_root_user=$(generate_hex 24)
    local minio_root_password=$(generate_hex 64)
    
    # Generate new media proxy secret
    local media_proxy_secret=$(generate_hex 64)
    
    # Generate new admin secrets
    local admin_secret_base=$(generate_hex 64)
    local oauth_client_id=$(generate_hex 32)
    local oauth_client_secret=$(generate_hex 64)
    
    # Generate new marketing secret
    local marketing_secret_base=$(generate_hex 64)
    
    # Generate new gateway secret
    local gateway_admin_reload_secret=$(generate_hex 64)
    
    # Generate new auth secrets
    local sudo_mode_secret=$(generate_hex 64)
    local connection_initiation_secret=$(generate_hex 64)
    
    # Generate new VAPID keys (these need to be generated properly for WebPush)
    # For now, generate random hex strings
    local vapid_public_key=$(generate_hex 64)
    local vapid_private_key=$(generate_hex 64)
    
    # Update config.json using jq
    jq --arg s3_access_key "$s3_access_key" \
       --arg s3_secret_key "$s3_secret_key" \
       --arg media_proxy_secret "$media_proxy_secret" \
       --arg admin_secret_base "$admin_secret_base" \
       --arg oauth_client_id "$oauth_client_id" \
       --arg oauth_client_secret "$oauth_client_secret" \
       --arg marketing_secret_base "$marketing_secret_base" \
       --arg gateway_admin_reload_secret "$gateway_admin_reload_secret" \
       --arg sudo_mode_secret "$sudo_mode_secret" \
       --arg connection_initiation_secret "$connection_initiation_secret" \
       --arg vapid_public_key "$vapid_public_key" \
       --arg vapid_private_key "$vapid_private_key" \
       '
       .s3.access_key_id = $s3_access_key |
       .s3.secret_access_key = $s3_secret_key |
       .services.media_proxy.secret_key = $media_proxy_secret |
       .services.admin.secret_key_base = $admin_secret_base |
       .services.admin.oauth_client_id = $oauth_client_id |
       .services.admin.oauth_client_secret = $oauth_client_secret |
       .services.marketing.secret_key_base = $marketing_secret_base |
       .services.gateway.admin_reload_secret = $gateway_admin_reload_secret |
       .auth.sudo_mode_secret = $sudo_mode_secret |
       .auth.connection_initiation_secret = $connection_initiation_secret |
       .auth.vapid.public_key = $vapid_public_key |
       .auth.vapid.private_key = $vapid_private_key
       ' "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
    
    # Update .env file with MinIO credentials
    if [ -f "$ENV_FILE" ]; then
        sed -i "s/^MINIO_ROOT_USER=.*/MINIO_ROOT_USER=$minio_root_user/" "$ENV_FILE"
        sed -i "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$minio_root_password/" "$ENV_FILE"
        sed -i "s/^S3_ACCESS_KEY_ID=.*/S3_ACCESS_KEY_ID=$s3_access_key/" "$ENV_FILE"
        sed -i "s/^S3_SECRET_ACCESS_KEY=.*/S3_SECRET_ACCESS_KEY=$s3_secret_key/" "$ENV_FILE"
        print_success "MinIO credentials updated in .env"
    fi
    
    print_success "Keys reset successfully"
}

# Main execution
main() {
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Config file not found: $CONFIG_FILE"
        exit 1
    fi
    
    check_dependencies
    backup_config
    reset_keys
    
    echo ""
    print_info "All keys have been reset in config/config.json"
    print_info "Please restart fluxer_server to apply the changes:"
    echo "  docker compose -f docker-compose.simple.yaml up -d fluxer_server"
}

main "$@"

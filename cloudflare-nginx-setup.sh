#!/bin/bash

# Auto-elevate to root if not running as root
if [ "$EUID" -ne 0 ]; then
    exec "$0" "$@"
fi

source "$(dirname "$0")/cloudflare-tunnel-functions.sh"

# Cloudflare + Nginx Domain Setup Script
# Sets up subdomain.domain.tld with Cloudflare DNS, SSL, and Nginx configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_EMAIL="${CLOUDFLARE_EMAIL:-}"
NGINX_CONF_DIR="/etc/nginx"
SSL_DIR="/etc/nginx/ssl"
LOG_DIR="/var/log/nginx"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
COMPOSE_FILE="${REPO_ROOT}/compose.yaml"
COMPOSE_SIMPLE_FILE="${REPO_ROOT}/docker-compose.simple.yaml"
ENV_FILE="${REPO_ROOT}/.env"

# Load .env file if it exists
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE" 2>/dev/null || true
fi

# User-specified ports (can be overridden via command line)
USER_FLUXER_PUBLIC_PORT=""
USER_FLUXER_ADMIN_PORT=""
USER_POSTGRES_PORT=""
USER_MINIO_PORT=""
USER_IPFS_API_PORT=""
USER_MEILI_PORT=""

# Multi-subdomain mode
MULTI_MODE=false
CONFIGURED_SUBDOMAINS=()

# Cloudflare mode
SKIP_CLOUDFLARE=false
USE_TUNNEL=false
TUNNEL_NAME="fluxer-tunnel"
FORCE_DNS=false

# SMTP configuration (use .env values if available)
SMTP_HOST="${SMTP_HOST:-}"
SMTP_PORT="${SMTP_PORT:-}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASSWORD="${SMTP_PASSWORD:-}"
SMTP_FROM="${SMTP_FROM:-}"

# Check if a port is in use
is_port_in_use() {
    local port=$1
    
    # Check if port is bound by Docker (including stopped containers)
    if command -v docker &> /dev/null; then
        # Check all containers (running and stopped) for port bindings
        if docker ps -a --format "{{.Ports}}" 2>/dev/null | grep -q ":${port}->"; then
            return 0  # Port is bound by Docker
        fi
    fi
    
    # Check if port is listening
    if command -v ss &> /dev/null; then
        if ss -tuln | grep -q ":${port} "; then
            return 0  # Port is listening
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":${port} "; then
            return 0  # Port is listening
        fi
    fi
    
    # Fallback: try to actually bind to the port to test availability
    if command -v python3 &> /dev/null; then
        python3 -c "import socket; s = socket.socket(); s.bind(('0.0.0.0', $port)); s.close()" 2>/dev/null
        if [ $? -ne 0 ]; then
            return 0  # Port is in use
        fi
    else
        # Try to connect to the port
        timeout 1 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/${port}" 2>/dev/null
        if [ $? -eq 0 ]; then
            return 0  # Port is in use
        fi
    fi
    
    return 1  # Port is free
}

# Find next available free port in a range
find_free_port() {
    local start_port=$1
    local end_port=$2
    local preferred_port=$3
    local skip_port=$4
    
    # If user specified a port, check if it's in range and free
    if [ -n "$preferred_port" ]; then
        if [ "$preferred_port" -ge "$start_port" ] && [ "$preferred_port" -le "$end_port" ]; then
            if ! is_port_in_use "$preferred_port"; then
                echo "$preferred_port"
                return
            else
                print_error "Port $preferred_port is already in use, finding alternative..."
            fi
        else
            print_error "Port $preferred_port is out of range [$start_port-$end_port], finding alternative..."
        fi
    fi
    
    # Find first available port in range
    for port in $(seq "$start_port" "$end_port"); do
        # Skip if this is the port we want to avoid
        if [ -n "$skip_port" ] && [ "$port" = "$skip_port" ]; then
            continue
        fi
        if ! is_port_in_use "$port"; then
            echo "$port"
            return
        fi
    done
    
    print_error "No available ports in range $start_port-$end_port"
    exit 1
}
# Parse command-line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --multi)
                MULTI_MODE=true
                shift
                ;;
            --skip-cloudflare)
                SKIP_CLOUDFLARE=true
                shift
                ;;
            --tunnel)
                USE_TUNNEL=true
                shift
                ;;
            --force-dns)
                FORCE_DNS=true
                shift
                ;;
            --fluxer-public-port)
                USER_FLUXER_PUBLIC_PORT="$2"
                shift 2
                ;;
            --fluxer-admin-port)
                USER_FLUXER_ADMIN_PORT="$2"
                shift 2
                ;;
            --postgres-port)
                USER_POSTGRES_PORT="$2"
                shift 2
                ;;
            --minio-port)
                USER_MINIO_PORT="$2"
                shift 2
                ;;
            --ipfs-api-port)
                USER_IPFS_API_PORT="$2"
                shift 2
                ;;
            --meili-port)
                USER_MEILI_PORT="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 <domain> [OPTIONS]"
                echo "       $0 <subdomain> <domain> [OPTIONS]"
                echo ""
                echo "If only domain is provided, multi-subdomain mode is automatically enabled."
                echo ""
                echo "Options:"
                echo "  --multi                       Setup all standard subdomains (app, static, cdn, api, admin)"
                echo "  --skip-cloudflare             Skip Cloudflare DNS management (manual DNS required)"
                echo "  --tunnel                      Use Cloudflare Tunnel (cloudflared) instead of direct DNS"
                echo "  --force-dns                   Force replace existing DNS records even if IP hasn't changed"
                echo "  --fluxer-public-port PORT    Specify FLUXER_PUBLIC_PORT (40000-50000)"
                echo "  --fluxer-admin-port PORT     Specify FLUXER_ADMIN_PORT (40000-50000)"
                echo "  --postgres-port PORT          Specify POSTGRES_PORT (5400-6400)"
                echo "  --minio-port PORT             Specify MINIO_PORT (9000-10000)"
                echo "  --ipfs-api-port PORT          Specify IPFS_API_PORT (5000-6000)"
                echo "  --meili-port PORT              Specify MEILI_PORT (7700-8700)"
                echo "  -h, --help                    Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0 example.com                    # Auto multi-subdomain mode"
                echo "  $0 www example.com                # Single subdomain"
                echo "  $0 www example.com --multi        # Explicit multi-subdomain"
                echo "  $0 app example.com --skip-cloudflare"
                echo "  $0 example.com --tunnel          # Multi-subdomain with tunnel"
                echo "  $0 app example.com --fluxer-public-port 45000"
                echo ""
                echo "If ports are not specified, the script will automatically find free ports."
                echo "If a specified port is in use, the script will find an alternative."
                exit 0
                ;;
            *)
                # Not an option, must be positional arguments
                break
                ;;
        esac
    done
}

generate_random_hex() {
    openssl rand -hex 32
}

# Print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Prompt for Cloudflare API token
prompt_cloudflare_token() {
    if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
        return
    fi
    
    echo ""
    print_info "Cloudflare API Token Required"
    echo "========================================"
    echo "To get your Cloudflare API token:"
    echo "1. Go to https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use the 'Edit zone DNS' template or create custom with:"
    echo "   - Zone - DNS - Edit"
    echo "   - Zone - Zone - Read"
    echo "4. Copy the generated token"
    echo ""
    read -p "Enter your Cloudflare API token (or press Enter to skip Cloudflare): " CLOUDFLARE_API_TOKEN
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        print_info "Skipping Cloudflare DNS management"
        SKIP_CLOUDFLARE=true
    else
        # Validate the token
        local response
        response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            print_success "Cloudflare API token is valid"
        else
            print_error "Invalid Cloudflare API token"
            print_info "Please check your token and try again"
            exit 1
        fi
    fi
}

# Prompt for SMTP configuration
prompt_smtp_config() {
    echo ""
    print_info "SMTP Configuration (Optional)"
    echo "========================================"
    
    # Check if SMTP variables are already set in environment
    if [ -n "$SMTP_HOST" ] && [ -n "$SMTP_PORT" ] && [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASSWORD" ] && [ -n "$SMTP_FROM" ]; then
        print_success "SMTP configuration found in environment variables"
        print_info "  Host: $SMTP_HOST"
        print_info "  Port: $SMTP_PORT"
        print_info "  User: $SMTP_USER"
        print_info "  From: $SMTP_FROM"
        return
    fi
    
    echo "Enter your SMTP details for email functionality."
    echo "Press Enter to skip (SMTP will not be configured)."
    echo ""
    
    read -p "SMTP Host (e.g., smtp.gmail.com) [${SMTP_HOST:-}]: " SMTP_HOST_INPUT
    SMTP_HOST="${SMTP_HOST_INPUT:-${SMTP_HOST:-}}"
    
    if [ -n "$SMTP_HOST" ]; then
        read -p "SMTP Port (e.g., 587) [${SMTP_PORT:-465}]: " SMTP_PORT_INPUT
        SMTP_PORT="${SMTP_PORT_INPUT:-${SMTP_PORT:-465}}"
        read -p "SMTP Username [${SMTP_USER:-}]: " SMTP_USER_INPUT
        SMTP_USER="${SMTP_USER_INPUT:-${SMTP_USER:-}}"
        read -sp "SMTP Password: " SMTP_PASSWORD
        echo ""
        read -p "SMTP From Address (e.g., noreply@example.com) [${SMTP_FROM:-}]: " SMTP_FROM_INPUT
        SMTP_FROM="${SMTP_FROM_INPUT:-${SMTP_FROM:-}}"
        print_success "SMTP configuration saved"
    else
        print_info "Skipping SMTP configuration"
    fi
}

# Check dependencies
check_dependencies() {
    print_info "Checking dependencies..."
    
    local deps=("curl" "jq" "openssl" "nginx" "docker")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            print_error "Missing dependency: $dep"
            exit 1
        fi
    done
    
    # Check for docker compose
    if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_success "All dependencies installed"
}

# Validate Cloudflare API token
validate_cloudflare_token() {
    print_info "Validating Cloudflare API token..."
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        print_error "CLOUDFLARE_API_TOKEN environment variable not set"
        exit 1
    fi
    
    # Test API token
    local response
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        print_success "Cloudflare API token is valid"
    else
        print_error "Invalid Cloudflare API token"
        exit 1
    fi
}

# Get Zone ID for domain
get_zone_id() {
    local domain=$1
    
    print_info "Getting Zone ID for $domain..."
    
    local response
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$domain" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    local zone_id
    zone_id=$(echo "$response" | jq -r '.result[0].id')
    
    if [ -z "$zone_id" ] || [ "$zone_id" = "null" ]; then
        print_error "Could not find Zone ID for domain: $domain"
        exit 1
    fi
    
    echo "$zone_id"
}

# Check if DNS record exists
check_dns_record() {
    local zone_id=$1
    local subdomain=$2
    local domain=$3
    local full_domain="${subdomain}.${domain}"
    
    print_info "Checking existing DNS record for $full_domain..."
    
    local response
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?name=$full_domain" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    local record_id
    record_id=$(echo "$response" | jq -r '.result[0].id')
    
    if [ -n "$record_id" ] && [ "$record_id" != "null" ]; then
        echo "$record_id"
    else
        echo ""
    fi
}

# Get server IP address
get_server_ip() {
    print_info "Getting server IP address..."
    
    local ip
    ip=$(curl -s -4 ifconfig.me)
    
    if [ -z "$ip" ]; then
        print_error "Could not determine server IP address"
        exit 1
    fi
    
    echo "$ip"
}

# Create or update DNS record
manage_dns_record() {
    local zone_id=$1
    local subdomain=$2
    local domain=$3
    local ip=$4
    local full_domain="${subdomain}.${domain}"
    
    local existing_id
    existing_id=$(check_dns_record "$zone_id" "$subdomain" "$domain")
    
    if [ -n "$existing_id" ]; then
        print_info "Existing DNS record found for $full_domain"
        
        # Get existing record details
        local response
        response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$existing_id" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json")
        
        local existing_ip
        existing_ip=$(echo "$response" | jq -r '.result.content')
        
        # Force replacement if flag is set or IP changed
        if [ "$FORCE_DNS" = true ] || [ "$existing_ip" != "$ip" ]; then
            if [ "$FORCE_DNS" = true ]; then
                print_info "Force replacing DNS record..."
            else
                print_info "IP changed from $existing_ip to $ip, recreating DNS record..."
            fi
            
            # Delete existing record
            response=$(curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$existing_id" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                -H "Content-Type: application/json")
            
            if echo "$response" | jq -e '.success' > /dev/null; then
                print_success "Old DNS record deleted"
            else
                print_error "Failed to delete old DNS record"
                exit 1
            fi
            
            # Create new record
            print_info "Creating new DNS record for $full_domain..."
            response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
                -H "Content-Type: application/json" \
                --data "{\"type\":\"A\",\"name\":\"$full_domain\",\"content\":\"$ip\",\"ttl\":120,\"proxied\":true}")
            
            if echo "$response" | jq -e '.success' > /dev/null; then
                print_success "DNS record created: $full_domain -> $ip"
            else
                print_error "Failed to create DNS record"
                exit 1
            fi
        else
            print_success "DNS record already correct: $full_domain -> $ip"
        fi
    else
        print_info "Creating new DNS record for $full_domain..."
        
        local response
        response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"$full_domain\",\"content\":\"$ip\",\"ttl\":120,\"proxied\":true}")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            print_success "DNS record created: $full_domain -> $ip"
        else
            print_error "Failed to create DNS record"
            exit 1
        fi
    fi
}

# Generate SSL certificate
generate_ssl_certificate() {
    local subdomain=$1
    local domain=$2
    local full_domain="${subdomain}.${domain}"
    local ssl_path="${SSL_DIR}/${full_domain}"
    
    print_info "Generating SSL certificate for $full_domain..."
    
    # Create SSL directory if it doesn't exist
    mkdir -p "$ssl_path"
    
    # Generate random passwords and keys
    local ssl_key_pass
    ssl_key_pass=$(generate_random_hex)
    
    # Generate private key
    openssl genrsa -aes256 -passout pass:"$ssl_key_pass" -out "${ssl_path}/key.pem" 4096 2>/dev/null
    
    # Remove passphrase from key (for nginx compatibility)
    openssl rsa -in "${ssl_path}/key.pem" -passin pass:"$ssl_key_pass" -out "${ssl_path}/key.pem" 2>/dev/null
    
    # Generate CSR
    openssl req -new -key "${ssl_path}/key.pem" -out "${ssl_path}/csr.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$full_domain" 2>/dev/null
    
    # Generate self-signed certificate (valid for 365 days)
    openssl x509 -req -days 365 -in "${ssl_path}/csr.pem" -signkey "${ssl_path}/key.pem" -out "${ssl_path}/cert.pem" 2>/dev/null
    
    # Generate DH parameters
    openssl dhparam -out "${ssl_path}/dhparam.pem" 2048 2>/dev/null
    
    # Save credentials
    echo "SSL_KEY_PASS=$ssl_key_pass" | tee "${ssl_path}/.credentials" > /dev/null
    chmod 600 "${ssl_path}/.credentials"
    
    print_success "SSL certificate generated"
    print_info "SSL key password saved to ${ssl_path}/.credentials"
}

# Generate nginx configuration
generate_nginx_config() {
    local subdomain=$1
    local domain=$2
    local backend_port=$3
    local full_domain="${subdomain}.${domain}"
    local ssl_path="${SSL_DIR}/${full_domain}"
    
    # Generate random passwords for various uses
    local basic_auth_pass
    basic_auth_pass=$(generate_random_hex)
    
    local upstream_secret
    upstream_secret=$(generate_random_hex)
    
    print_info "Generating nginx configuration for $full_domain..."
    
    local config_file="${NGINX_CONF_DIR}/sites-available/${full_domain}.conf"
    
    tee "$config_file" > /dev/null <<EOF
# Nginx configuration for $full_domain
# Auto-generated by cloudflare-nginx-setup.sh

# Upstream configuration
upstream ${full_domain}_backend {
    server 127.0.0.1:${backend_port};
    # Add more servers here if needed
}

# Rate limiting zone
limit_req_zone \$binary_remote_addr zone=${full_domain}_limit:10m rate=10r/s;

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $full_domain;
    
    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name $full_domain;
    
    # SSL configuration
    ssl_certificate $ssl_path/cert.pem;
    ssl_certificate_key $ssl_path/key.pem;
    ssl_dhparam $ssl_path/dhparam.pem;
    
    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # SSL session configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Substitution filter configuration
    sub_filter_types text/html text/css application/javascript application/json;
    sub_filter_last_modified off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log $LOG_DIR/${full_domain}_access.log;
    error_log $LOG_DIR/${full_domain}_error.log;
    
    # Client body size limit
    client_max_body_size 100M;
    
    # Rate limiting
    limit_req zone=${full_domain}_limit burst=20 nodelay;
    
    # Main location block
    location / {
        proxy_pass http://${full_domain}_backend;
        proxy_http_version 1.1;
        
        # Proxy headers
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Proxy timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Proxy buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Disable compression from backend so sub_filter works
        proxy_set_header Accept-Encoding "";
        
        # Rewrite local IPs to domain in response body
        sub_filter http://172.17.0.1:8082 https://\$host;
        sub_filter http://127.0.0.1:8082 https://\$host;
        sub_filter http://localhost:8082 https://\$host;
        sub_filter http://172.17.0.1:8080 https://\$host;
        sub_filter http://127.0.0.1:8080 https://\$host;
        sub_filter http://localhost:8080 https://\$host;
        sub_filter_once off;
        
        # Cache configuration (optional)
        # proxy_cache ${full_domain}_cache;
        # proxy_cache_valid 200 60m;
    }
    
    # Static files location (optional)
    # location /static/ {
    #     alias /var/www/${full_domain}/static/;
    #     expires 30d;
    #     add_header Cache-Control "public, immutable";
    # }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Save generated credentials
    echo "BASIC_AUTH_PASS=$basic_auth_pass" | tee "${ssl_path}/.credentials" > /dev/null
    echo "UPSTREAM_SECRET=$upstream_secret" | tee -a "${ssl_path}/.credentials" > /dev/null
    chmod 600 "${ssl_path}/.credentials"
    
    print_success "Nginx configuration generated"
}

# Enable nginx site
enable_nginx_site() {
    local subdomain=$1
    local domain=$2
    local full_domain="${subdomain}.${domain}"
    
    print_info "Enabling nginx site for $full_domain..."
    
    # Remove old symlink without .conf extension if it exists
    if [ -L "${NGINX_CONF_DIR}/sites-enabled/${full_domain}" ]; then
        rm "${NGINX_CONF_DIR}/sites-enabled/${full_domain}"
    fi
    
    # Create symbolic link to sites-enabled
    ln -sf "${NGINX_CONF_DIR}/sites-available/${full_domain}.conf" "${NGINX_CONF_DIR}/sites-enabled/${full_domain}.conf"
    
    print_success "Nginx site enabled"
}

# Test nginx configuration
test_nginx_config() {
    print_info "Testing nginx configuration..."
    
    if nginx -t 2>&1; then
        print_success "Nginx configuration test passed"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Generate all secrets and environment variables
generate_all_secrets() {
    print_info "Generating all secrets and environment variables..."
    
    # Generate random hex values for all secrets
    local postgres_user=$(openssl rand -hex 8)
    local postgres_password=$(generate_random_hex)
    local postgres_db="fluxer_$(openssl rand -hex 4)"
    local minio_root_user=$(openssl rand -hex 8)
    local minio_root_password=$(generate_random_hex)
    local meili_master_key=$(generate_random_hex)
    local oauth_client_id=$(openssl rand -hex 16)
    local oauth_client_secret=$(generate_random_hex)
    
    # Load existing .env if it exists to get current ports
    if [ -f "${ENV_FILE}" ]; then
        print_info "Loading existing ports from .env..."
        source "${ENV_FILE}" 2>/dev/null || true
    fi
    
    # Use existing ports from .env, or find available ports if not set
    print_info "Determining ports..."
    local fluxer_public_port="${FLUXER_PUBLIC_PORT:-$(find_free_port 40000 50000 "$USER_FLUXER_PUBLIC_PORT" "")}"
    local fluxer_admin_port="${FLUXER_ADMIN_PORT:-$(find_free_port 40000 50000 "$USER_FLUXER_ADMIN_PORT" "$fluxer_public_port")}"
    local postgres_port="${POSTGRES_PORT:-$(find_free_port 5400 6400 "$USER_POSTGRES_PORT" "")}"
    local minio_port="${MINIO_PORT:-$(find_free_port 9000 10000 "$USER_MINIO_PORT" "")}"
    local minio_console_port="${MINIO_CONSOLE_PORT:-$((minio_port + 1))}"
    local ipfs_swarm_port="${IPFS_SWARM_PORT:-$(find_free_port 4000 5000 "" "")}"
    local ipfs_api_port="${IPFS_API_PORT:-$(find_free_port 5000 6000 "$USER_IPFS_API_PORT" "")}"
    local ipfs_gateway_port="${IPFS_GATEWAY_PORT:-$(find_free_port 8000 9000 "" "")}"
    local meili_port="${MEILI_PORT:-$(find_free_port 7700 8700 "$USER_MEILI_PORT" "")}"
    local livekit_port="${LIVEKIT_PORT:-$(find_free_port 7800 8800 "" "")}"
    
    # Use domain from .env if set, otherwise use command line or prompt
    local domain="${DOMAIN:-}"
    if [ -z "$domain" ]; then
        read -p "Enter your domain (e.g., example.com): " domain
    fi
    
    print_success "Ports selected:"
    print_info "  FLUXER_PUBLIC_PORT: $fluxer_public_port"
    print_info "  FLUXER_ADMIN_PORT: $fluxer_admin_port"
    print_info "  POSTGRES_PORT: $postgres_port"
    print_info "  MINIO_PORT: $minio_port"
    print_info "  IPFS_API_PORT: $ipfs_api_port"
    print_info "  MEILI_PORT: $meili_port"
    
    # Create .env file
    print_info "Creating .env file..."
    cat > "${ENV_FILE}" <<EOF
# Auto-generated by cloudflare-nginx-setup.sh
# All values are randomly generated for security

# ============================================
# Service Ports
# ============================================
FLUXER_PUBLIC_PORT=${fluxer_public_port}
FLUXER_API_PORT=${fluxer_public_port}
FLUXER_APP_PORT=40000
FLUXER_ADMIN_PORT=${fluxer_admin_port}
FLUXER_GATEWAY_PORT=49107
FLUXER_MARKETING_PORT=49531
POSTGRES_PORT=${postgres_port}
MINIO_PORT=${minio_port}
MINIO_CONSOLE_PORT=${minio_console_port}
IPFS_SWARM_PORT=${ipfs_swarm_port}
IPFS_API_PORT=${ipfs_api_port}
IPFS_GATEWAY_PORT=${ipfs_gateway_port}
MEILI_PORT=${meili_port}
LIVEKIT_PORT=${livekit_port}
SMTP_PORT=${SMTP_PORT:-465}

# ============================================
# Domain Configuration
# ============================================
DOMAIN=${domain}
PUBLIC_SCHEME=https
FLUXER_STATIC_CDN=https://static.${domain}
FLUXER_MEDIA_URL=https://api.${domain}/media
LIVEKIT_URL=wss://livekit.${domain}

# ============================================
# Security Keys
# ============================================
MEDIA_PROXY_SECRET=${media_proxy_secret}
ADMIN_SECRET_KEY_BASE=${admin_secret_key_base}
OAUTH_CLIENT_ID=${oauth_client_id}
OAUTH_CLIENT_SECRET=${oauth_client_secret}
MARKETING_SECRET_KEY_BASE=${marketing_secret_key_base}
GATEWAY_ADMIN_RELOAD_SECRET=${gateway_admin_reload_secret}
SUDO_MODE_SECRET=${sudo_mode_secret}
CONNECTION_INITIATION_SECRET=${connection_initiation_secret}

# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=${postgres_user}
POSTGRES_PASSWORD=${postgres_password}
POSTGRES_DB=${postgres_db}
SQLITE_PATH=./data/dev.db

# ============================================
# MinIO/S3 Configuration
# ============================================
MINIO_ROOT_USER=${minio_root_user}
MINIO_ROOT_PASSWORD=${minio_root_password}
S3_ACCESS_KEY_ID=${minio_root_user}
S3_SECRET_ACCESS_KEY=${minio_root_password}
S3_ENDPOINT=http://localhost:${minio_port}

# ============================================
# Redis/Valkey Configuration
# ============================================
REDIS_URL=redis://valkey:6379/0

# ============================================
# NATS Configuration
# ============================================
NATS_CORE_URL=nats://nats:4222
NATS_JETSTREAM_URL=nats://nats:4222
NATS_AUTH_TOKEN=null

# ============================================
# Search Configuration
# ============================================
MEILI_MASTER_KEY=${meili_master_key}

# ============================================
# Optional: External Services
# ============================================
STRIPE_SECRET_KEY=null
STRIPE_WEBHOOK_SECRET=null
EOF
    
    # Add SMTP configuration if provided
    if [ -n "$SMTP_HOST" ]; then
        cat >> "${ENV_FILE}" <<EOF

# SMTP Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${SMTP_USER}
SMTP_PASSWORD=${SMTP_PASSWORD}
SMTP_FROM=${SMTP_FROM}
EOF
    fi
    
    chmod 600 "${ENV_FILE}"
    print_success ".env file created with generated secrets"
    
    # Export variables for use in other functions
    export FLUXER_PUBLIC_PORT
    export FLUXER_ADMIN_PORT
}

# Setup a single subdomain
setup_subdomain() {
    local subdomain=$1
    local domain=$2
    local zone_id=$3
    local server_ip=$4
    local backend_port=$5
    local full_domain="${subdomain}.${domain}"
    
    print_info "Setting up $full_domain..."
    
    # Only manage DNS if Cloudflare is enabled
    # If using tunnel, skip DNS management (tunnel handles it)
    if [ "$USE_TUNNEL" = true ]; then
        print_info "Skipping DNS management (Cloudflare Tunnel will handle routing)"
    elif [ "$SKIP_CLOUDFLARE" = false ]; then
    if [ "$SKIP_CLOUDFLARE" = false ]; then
        manage_dns_record "$zone_id" "$subdomain" "$domain" "$server_ip"
    else
        print_info "Skipping DNS management (manual DNS required)"
        print_info "Please create an A record for $full_domain pointing to $server_ip"
    fi
        print_info "Please create an A record for $full_domain pointing to $server_ip"
    fi
    
    generate_ssl_certificate "$subdomain" "$domain"
    generate_nginx_config "$subdomain" "$domain" "$backend_port"
    
    enable_nginx_site "$subdomain" "$domain"
    
    # Add to configured subdomains list
    CONFIGURED_SUBDOMAINS+=("$full_domain")
    
    print_success "$full_domain configured"
}
# Setup config files
setup_config_files() {
    print_info "Setting up configuration files..."
    
    # Create config directory if it doesn't exist
    mkdir -p "${REPO_ROOT}/config"
    
    # Create data directories
    mkdir -p "${REPO_ROOT}/data"
    mkdir -p "${REPO_ROOT}/dev"
    
    # Check if .env file exists, create minimal if not
    if [ ! -f "${REPO_ROOT}/.env" ]; then
        print_info "Creating .env file..."
        cat > "${REPO_ROOT}/.env" <<'EOF'
# Fluxer World Environment Configuration
# Generated by cloudflare-nginx-setup.sh

# ============================================
# Service Ports
# ============================================
FLUXER_PUBLIC_PORT=49320
FLUXER_APP_PORT=40000
FLUXER_ADMIN_PORT=40003
FLUXER_GATEWAY_PORT=49107
FLUXER_MARKETING_PORT=49531
POSTGRES_PORT=5400
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
IPFS_SWARM_PORT=4000
IPFS_API_PORT=5000
IPFS_GATEWAY_PORT=8000
MEILI_PORT=7700
LIVEKIT_PORT=7800
SMTP_PORT=465

# ============================================
# Domain Configuration
# ============================================
DOMAIN=localhost
PUBLIC_SCHEME=http
FLUXER_STATIC_CDN=localhost:8082
FLUXER_MEDIA_URL=http://localhost:49320/media
LIVEKIT_URL=ws://localhost:7880

# ============================================
# Security Keys (empty - will be generated during setup)
# ============================================
MEDIA_PROXY_SECRET=
ADMIN_SECRET_KEY_BASE=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
MARKETING_SECRET_KEY_BASE=
GATEWAY_ADMIN_RELOAD_SECRET=
SUDO_MODE_SECRET=
CONNECTION_INITIATION_SECRET=

# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
SQLITE_PATH=./data/dev.db

# ============================================
# MinIO/S3 Configuration
# ============================================
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=http://localhost:9000

# ============================================
# Redis/Valkey Configuration
# ============================================
REDIS_URL=redis://valkey:6379/0

# ============================================
# NATS Configuration
# ============================================
NATS_CORE_URL=nats://nats:4222
NATS_JETSTREAM_URL=nats://nats:4222
NATS_AUTH_TOKEN=null

# ============================================
# Search Configuration
# ============================================
MEILI_MASTER_KEY=

# ============================================
# Optional: External Services
# ============================================
STRIPE_SECRET_KEY=null
STRIPE_WEBHOOK_SECRET=null
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
EOF
    fi
    
    print_success "Configuration files setup complete"
}

# Update nginx config to use Docker port
update_nginx_backend_port() {
    local subdomain=$1
    local domain=$2
    local full_domain="${subdomain}.${domain}"
    local config_file="${NGINX_CONF_DIR}/sites-available/${full_domain}.conf"
    
    print_info "Updating nginx backend port to ${FLUXER_PUBLIC_PORT}..."
    
    # Update the upstream server port
    sed -i "s/server 127.0.0.1:8080;/server 127.0.0.1:${FLUXER_PUBLIC_PORT};/" "$config_file"
    
    print_success "Nginx backend port updated"
}

# Start Docker services
start_docker_services() {
    print_info "Starting Docker services..."
    
    cd "${REPO_ROOT}"
    
    # Determine which docker compose command to use
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    # Stop existing services if any
    $DOCKER_COMPOSE -f "${COMPOSE_SIMPLE_FILE}" --profile minimal down 2>/dev/null || true
    
    # Start services with minimal profile
    $DOCKER_COMPOSE -f "${COMPOSE_SIMPLE_FILE}" --profile minimal up -d
    
    print_success "Docker services started"
}

# Display Docker service status
show_docker_status() {
    print_info "Checking Docker service status..."
    
    cd "${REPO_ROOT}"
    
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    $DOCKER_COMPOSE -f "${COMPOSE_SIMPLE_FILE}" ps
}

# Reload nginx
reload_nginx() {
    print_info "Reloading nginx..."
    
    if systemctl reload nginx; then
        print_success "Nginx reloaded successfully"
    else
        print_error "Failed to reload nginx"
        exit 1
    fi
}

# Display summary
display_summary() {
    local domain=$1
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    
    if [ "$MULTI_MODE" = true ]; then
        print_info "Configured subdomains:"
        for subdomain in "${CONFIGURED_SUBDOMAINS[@]}"; do
            echo "  - https://$subdomain"
        done
    else
        echo "Domain: ${CONFIGURED_SUBDOMAINS[0]}"
    fi
    
    echo ""
    print_info "Environment file: ${ENV_FILE}"
    print_info "Docker configuration saved to ${ENV_FILE}"
    print_info "Ports configured:"
    echo "  - FLUXER_PUBLIC_PORT: ${FLUXER_PUBLIC_PORT}"
    echo "  - FLUXER_ADMIN_PORT: ${FLUXER_ADMIN_PORT}"
    echo ""
    print_info "Next steps:"
    echo "1. Docker services are already running"
    
    if [ "$SKIP_CLOUDFLARE" = true ]; then
        echo "2. IMPORTANT: Create manual DNS A records pointing to your server IP:"
        for subdomain in "${CONFIGURED_SUBDOMAINS[@]}"; do
            echo "   - $subdomain -> $server_ip"
        done
        echo ""
    fi
    
    if [ "$MULTI_MODE" = true ]; then
        echo "3. Test the sites:"
        for subdomain in "${CONFIGURED_SUBDOMAINS[@]}"; do
            echo "   - https://$subdomain"
        done
    else
        echo "3. Test the site at https://${CONFIGURED_SUBDOMAINS[0]}"
    fi
    
    echo "4. Consider using Let's Encrypt for a trusted SSL certificate"
    echo "5. View Docker logs: docker compose -f ${COMPOSE_SIMPLE_FILE} logs -f"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "Cloudflare + Nginx + Docker Setup Script"
    echo "=========================================="
    echo ""
    
    # Parse command-line arguments first
    parse_arguments "$@"
    
    # Load .env file if it exists
    if [ -f "$ENV_FILE" ]; then
        print_info "Loading configuration from .env..."
        source "$ENV_FILE" 2>/dev/null || true
    fi
    
    # Check for positional arguments
    if [ $# -lt 1 ]; then
        # If no arguments and DOMAIN is set in .env, use it
        if [ -n "$DOMAIN" ]; then
            local domain="$DOMAIN"
            local subdomain="www"
            MULTI_MODE=true
            print_info "Using domain from .env: $domain"
        else
            print_error "Usage: $0 <domain> [OPTIONS]"
            print_error "       $0 <subdomain> <domain> [OPTIONS]"
            echo "Example: $0 example.com"
            echo "         $0 www example.com"
            echo "Use --help for more options"
            exit 1
        fi
    else
        # If only 1 argument provided, treat as domain and enable multi-mode
        if [ $# -eq 1 ]; then
            local domain=$1
            local subdomain="www"
            MULTI_MODE=true
            print_info "Single domain provided, enabling multi-subdomain mode for $domain..."
        else
            local subdomain=$1
            local domain=$2
        fi
    fi
    
    if [ "$MULTI_MODE" = true ]; then
        print_info "Setting up multiple subdomains for $domain..."
    else
        print_info "Setting up ${subdomain}.${domain}..."
    fi
    echo ""
    
    # Run setup steps
    check_dependencies
    setup_config_files
    prompt_cloudflare_token
    prompt_smtp_config
    generate_all_secrets
    
    
    local zone_id=""
    local server_ip=""
    
    # Handle tunnel mode
    if [ "$USE_TUNNEL" = true ]; then
        install_cloudflared
        local tunnel_id
        tunnel_id=$(create_tunnel "$domain" "$TUNNEL_NAME")
        create_cloudflared_service "$TUNNEL_NAME"
    fi
    
    # Only get Cloudflare details if not skipping and not using tunnel
    if [ "$SKIP_CLOUDFLARE" = false ] && [ "$USE_TUNNEL" = false ]; then
        zone_id=$(get_zone_id "$domain")
        server_ip=$(get_server_ip)
    elif [ "$SKIP_CLOUDFLARE" = true ]; then
        # Get server IP for manual DNS instructions (not needed for tunnel mode)
        server_ip=$(get_server_ip)
    fi
    
    # Setup subdomains
    if [ "$MULTI_MODE" = true ]; then
        # Setup standard subdomains
        # app, api, static, and cdn all use fluxer_public_port (same backend container)
        if [ "$USE_TUNNEL" = true ]; then
            add_tunnel_route "$TUNNEL_NAME" "app" "$domain" "$FLUXER_PUBLIC_PORT"
            add_tunnel_route "$TUNNEL_NAME" "static" "$domain" "$FLUXER_PUBLIC_PORT"
            add_tunnel_route "$TUNNEL_NAME" "cdn" "$domain" "$FLUXER_PUBLIC_PORT"
            add_tunnel_route "$TUNNEL_NAME" "api" "$domain" "$FLUXER_PUBLIC_PORT"
            add_tunnel_route "$TUNNEL_NAME" "admin" "$domain" "$FLUXER_ADMIN_PORT"
        fi
        setup_subdomain "app" "$domain" "$zone_id" "$server_ip" "$FLUXER_PUBLIC_PORT"
        setup_subdomain "static" "$domain" "$zone_id" "$server_ip" "$FLUXER_PUBLIC_PORT"
        setup_subdomain "cdn" "$domain" "$zone_id" "$server_ip" "$FLUXER_PUBLIC_PORT"
        setup_subdomain "api" "$domain" "$zone_id" "$server_ip" "$FLUXER_PUBLIC_PORT"
        setup_subdomain "admin" "$domain" "$zone_id" "$server_ip" "$FLUXER_ADMIN_PORT"
    else
        # Setup single subdomain
        if [ "$USE_TUNNEL" = true ]; then
            add_tunnel_route "$TUNNEL_NAME" "$subdomain" "$domain" "$FLUXER_PUBLIC_PORT"
        fi
        setup_subdomain "$subdomain" "$domain" "$zone_id" "$server_ip" "$FLUXER_PUBLIC_PORT"
    fi
    
    # Start cloudflared if using tunnel
    if [ "$USE_TUNNEL" = true ]; then
        start_cloudflared
    fi
    
    test_nginx_config
    reload_nginx
    start_docker_services
    sleep 5
    show_docker_status
    
    display_summary "$domain"
}

# Run main function
main "$@"

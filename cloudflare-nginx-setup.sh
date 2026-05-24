#!/bin/bash

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

# Generate random 32-character hex string
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

# Check dependencies
check_dependencies() {
    print_info "Checking dependencies..."
    
    local deps=("curl" "jq" "openssl" "nginx")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            print_error "Missing dependency: $dep"
            exit 1
        fi
    done
    
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
        print_info "Updating existing DNS record for $full_domain..."
        
        local response
        response=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$existing_id" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"$full_domain\",\"content\":\"$ip\",\"ttl\":120,\"proxied\":true}")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            print_success "DNS record updated: $full_domain -> $ip"
        else
            print_error "Failed to update DNS record"
            exit 1
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
    sudo mkdir -p "$ssl_path"
    
    # Generate random passwords and keys
    local ssl_key_pass
    ssl_key_pass=$(generate_random_hex)
    
    # Generate private key
    sudo openssl genrsa -aes256 -passout pass:"$ssl_key_pass" -out "${ssl_path}/key.pem" 4096 2>/dev/null
    
    # Remove passphrase from key (for nginx compatibility)
    sudo openssl rsa -in "${ssl_path}/key.pem" -passin pass:"$ssl_key_pass" -out "${ssl_path}/key.pem" 2>/dev/null
    
    # Generate CSR
    sudo openssl req -new -key "${ssl_path}/key.pem" -out "${ssl_path}/csr.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$full_domain" 2>/dev/null
    
    # Generate self-signed certificate (valid for 365 days)
    sudo openssl x509 -req -days 365 -in "${ssl_path}/csr.pem" -signkey "${ssl_path}/key.pem" -out "${ssl_path}/cert.pem" 2>/dev/null
    
    # Generate DH parameters
    sudo openssl dhparam -out "${ssl_path}/dhparam.pem" 2048 2>/dev/null
    
    # Save credentials
    echo "SSL_KEY_PASS=$ssl_key_pass" | sudo tee "${ssl_path}/.credentials" > /dev/null
    sudo chmod 600 "${ssl_path}/.credentials"
    
    print_success "SSL certificate generated"
    print_info "SSL key password saved to ${ssl_path}/.credentials"
}

# Generate nginx configuration
generate_nginx_config() {
    local subdomain=$1
    local domain=$2
    local full_domain="${subdomain}.${domain}"
    local ssl_path="${SSL_DIR}/${full_domain}"
    
    # Generate random passwords for various uses
    local basic_auth_pass
    basic_auth_pass=$(generate_random_hex)
    
    local upstream_secret
    upstream_secret=$(generate_random_hex)
    
    print_info "Generating nginx configuration for $full_domain..."
    
    local config_file="${NGINX_CONF_DIR}/sites-available/${full_domain}.conf"
    
    sudo tee "$config_file" > /dev/null <<EOF
# Nginx configuration for $full_domain
# Auto-generated by cloudflare-nginx-setup.sh

# Upstream configuration
upstream ${full_domain}_backend {
    server 127.0.0.1:8080;
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
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
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
    echo "BASIC_AUTH_PASS=$basic_auth_pass" | sudo tee "${ssl_path}/.credentials" > /dev/null
    echo "UPSTREAM_SECRET=$upstream_secret" | sudo tee -a "${ssl_path}/.credentials" > /dev/null
    sudo chmod 600 "${ssl_path}/.credentials"
    
    print_success "Nginx configuration generated"
}

# Enable nginx site
enable_nginx_site() {
    local subdomain=$1
    local domain=$2
    local full_domain="${subdomain}.${domain}"
    
    print_info "Enabling nginx site for $full_domain..."
    
    # Create symbolic link to sites-enabled
    sudo ln -sf "${NGINX_CONF_DIR}/sites-available/${full_domain}.conf" "${NGINX_CONF_DIR}/sites-enabled/${full_domain}.conf"
    
    print_success "Nginx site enabled"
}

# Test nginx configuration
test_nginx_config() {
    print_info "Testing nginx configuration..."
    
    if sudo nginx -t 2>&1; then
        print_success "Nginx configuration test passed"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Reload nginx
reload_nginx() {
    print_info "Reloading nginx..."
    
    if sudo systemctl reload nginx; then
        print_success "Nginx reloaded successfully"
    else
        print_error "Failed to reload nginx"
        exit 1
    fi
}

# Display summary
display_summary() {
    local subdomain=$1
    local domain=$2
    local full_domain="${subdomain}.${domain}"
    local ssl_path="${SSL_DIR}/${full_domain}"
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Domain: $full_domain"
    echo "Nginx config: ${NGINX_CONF_DIR}/sites-available/${full_domain}.conf"
    echo "SSL certificates: $ssl_path/"
    echo "Credentials: ${ssl_path}/.credentials"
    echo ""
    print_info "Generated credentials (saved to ${ssl_path}/.credentials):"
    sudo cat "${ssl_path}/.credentials"
    echo ""
    print_info "Next steps:"
    echo "1. Deploy your application to port 8080"
    echo "2. Test the site at https://$full_domain"
    echo "3. Consider using Let's Encrypt for a trusted SSL certificate"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "Cloudflare + Nginx Domain Setup Script"
    echo "=========================================="
    echo ""
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root. It will use sudo where needed."
        exit 1
    fi
    
    # Parse arguments
    if [ $# -lt 2 ]; then
        print_error "Usage: $0 <subdomain> <domain>"
        echo "Example: $0 www example.com"
        exit 1
    fi
    
    local subdomain=$1
    local domain=$2
    
    print_info "Setting up ${subdomain}.${domain}..."
    echo ""
    
    # Run setup steps
    check_dependencies
    validate_cloudflare_token
    
    local zone_id
    zone_id=$(get_zone_id "$domain")
    
    local server_ip
    server_ip=$(get_server_ip)
    
    manage_dns_record "$zone_id" "$subdomain" "$domain" "$server_ip"
    generate_ssl_certificate "$subdomain" "$domain"
    generate_nginx_config "$subdomain" "$domain"
    enable_nginx_site "$subdomain" "$domain"
    test_nginx_config
    reload_nginx
    
    display_summary "$subdomain" "$domain"
}

# Run main function
main "$@"

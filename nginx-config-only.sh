#!/bin/bash

# Nginx Config Only Script
# Scans for ports and generates nginx configurations only
# Does NOT touch Cloudflare, SSL, or Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NGINX_CONF_DIR="/etc/nginx"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
ENV_FILE="${REPO_ROOT}/.env"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.simple.yaml"
COMPOSE_FILE_ALT="${REPO_ROOT}/compose.yaml"

# Load .env file if it exists
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE" 2>/dev/null || true
fi

# User-specified ports (can be overridden via command line)
USER_FLUXER_PUBLIC_PORT="${FLUXER_PUBLIC_PORT:-}"
USER_FLUXER_ADMIN_PORT="${FLUXER_ADMIN_PORT:-}"
USER_FLUXER_APP_PORT="${FLUXER_APP_PORT:-}"
USER_FLUXER_API_PORT="${FLUXER_API_PORT:-}"

# Multi-subdomain mode
MULTI_MODE=false
CONFIGURED_SUBDOMAINS=()

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

# Read ports from docker-compose file
read_ports_from_compose() {
    local compose_file=""
    
    # Check which compose file exists
    if [ -f "$COMPOSE_FILE" ]; then
        compose_file="$COMPOSE_FILE"
    elif [ -f "$COMPOSE_FILE_ALT" ]; then
        compose_file="$COMPOSE_FILE_ALT"
    else
        print_info "No docker-compose file found"
        return 1
    fi
    
    print_info "Reading ports from $compose_file..."
    
    # Check if compose file uses environment variables for ports
    local server_port_line=$(grep -A 10 "fluxer_server:" "$compose_file" | grep -E "^\s+-\s+['\"]?[0-9\$]+" | head -1)
    local admin_port_line=$(grep -A 10 "fluxer_admin:" "$compose_file" | grep -E "^\s+-\s+['\"]?[0-9\$]+" | head -1)
    
    # If compose file uses env variables, read from .env
    if [[ "$server_port_line" == *'$'* ]] || [[ "$admin_port_line" == *'$'* ]]; then
        print_info "Compose file uses environment variables, reading from .env..."
        if [ -f "$ENV_FILE" ]; then
            source "$ENV_FILE"
            local fluxer_public_port="${FLUXER_PUBLIC_PORT:-}"
            local fluxer_admin_port="${FLUXER_ADMIN_PORT:-}"
            
            print_info "Found FLUXER_PUBLIC_PORT: $fluxer_public_port"
            print_info "Found FLUXER_ADMIN_PORT: $fluxer_admin_port"
            
            if [ -n "$fluxer_public_port" ] && [ -n "$fluxer_admin_port" ]; then
                echo "$fluxer_public_port $fluxer_admin_port"
                return 0
            fi
        fi
        return 1
    fi
    
    # Otherwise, parse hardcoded ports from compose file
    local fluxer_public_port=$(echo "$server_port_line" | sed -E "s/^\s+-\s+['\"]?([0-9]+):.*/\1/")
    local fluxer_admin_port=$(echo "$admin_port_line" | sed -E "s/^\s+-\s+['\"]?([0-9]+):.*/\1/")
    
    print_info "Parsed ports from compose: public=$fluxer_public_port admin=$fluxer_admin_port"
    
    if [ -n "$fluxer_public_port" ] && [ -n "$fluxer_admin_port" ]; then
        echo "$fluxer_public_port $fluxer_admin_port"
        return 0
    fi
    
    return 1
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

# Generate nginx configuration
generate_nginx_config() {
    local subdomain=$1
    local domain=$2
    local backend_port=$3
    local full_domain="${subdomain}.${domain}"
    local config_file="${NGINX_CONF_DIR}/sites-available/${full_domain}.conf"
    
    print_info "Generating nginx config for $full_domain..."
    
    mkdir -p "${NGINX_CONF_DIR}/sites-available"
    
    cat > "$config_file" <<EOF
server {
    listen 80;
    server_name $full_domain;
    
    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Substitution filter configuration
    sub_filter_types text/html text/css application/javascript application/json;
    sub_filter_last_modified off;
    
    # Redirect to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name $full_domain;
    
    # SSL Configuration (placeholder - use your own certificates)
    # ssl_certificate /etc/nginx/ssl/${full_domain}/cert.pem;
    # ssl_certificate_key /etc/nginx/ssl/${full_domain}/key.pem;
    # ssl_dhparam /etc/nginx/ssl/${full_domain}/dhparam.pem;
    
    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Substitution filter configuration
    sub_filter_types text/html text/css application/javascript application/json;
    sub_filter_last_modified off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/${full_domain}_access.log;
    error_log /var/log/nginx/${full_domain}_error.log;
    
    # Proxy to backend
    location / {
        proxy_pass http://127.0.0.1:${backend_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
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
    }
    
    # Static files with proper MIME types
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:${backend_port};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
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
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
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

# Update nginx backend port
update_nginx_backend_port() {
    local subdomain=$1
    local domain=$2
    local backend_port=$3
    local full_domain="${subdomain}.${domain}"
    local config_file="${NGINX_CONF_DIR}/sites-available/${full_domain}.conf"
    
    if [ -n "$backend_port" ]; then
        sed -i "s/proxy_pass http:\/\/127.0.0.1:8080;/proxy_pass http:\/\/127.0.0.1:${backend_port};/" "$config_file"
    fi
}

# Setup a single subdomain
setup_subdomain() {
    local subdomain=$1
    local domain=$2
    local backend_port=$3
    local full_domain="${subdomain}.${domain}"
    
    print_info "Setting up $full_domain..."
    
    generate_nginx_config "$subdomain" "$domain" "$backend_port"
    update_nginx_backend_port "$subdomain" "$domain" "$backend_port"
    enable_nginx_site "$subdomain" "$domain"
    
    # Add to configured subdomains list
    CONFIGURED_SUBDOMAINS+=("$full_domain")
    
    print_success "$full_domain configured"
}

# Test nginx configuration
test_nginx_config() {
    print_info "Testing nginx configuration..."
    
    if nginx -t 2>&1; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
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
    print_success "Nginx configuration completed!"
    echo "=========================================="
    echo ""
    
    if [ "$MULTI_MODE" = true ]; then
        print_info "Configured subdomains:"
        for subdomain in "${CONFIGURED_SUBDOMAINS[@]}"; do
            echo "  - $subdomain"
        done
    else
        echo "Domain: ${CONFIGURED_SUBDOMAINS[0]}"
    fi
    
    echo ""
    print_info "Nginx configs:"
    echo "  - Directory: ${NGINX_CONF_DIR}/sites-available/"
    echo "  - Enabled: ${NGINX_CONF_DIR}/sites-enabled/"
    echo ""
    print_info "Next steps:"
    echo "1. Add SSL certificates to /etc/nginx/ssl/<domain>/"
    echo "2. Uncomment SSL configuration in nginx config files"
    echo "3. Test nginx: nginx -t"
    echo "4. Reload nginx: systemctl reload nginx"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "Nginx Config Only Script"
    echo "=========================================="
    echo ""
    
    # Parse command-line arguments
    local positional_args=()
    while [[ $# -gt 0 ]]; do
        case $1 in
            --multi)
                MULTI_MODE=true
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
            --fluxer-app-port)
                USER_FLUXER_APP_PORT="$2"
                shift 2
                ;;
            --fluxer-api-port)
                USER_FLUXER_API_PORT="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 <subdomain> <domain> [OPTIONS]"
                echo "       $0 <domain> [OPTIONS]"
                echo ""
                echo "This script ONLY generates nginx configurations."
                echo "It does NOT touch Cloudflare, SSL, or Docker."
                echo ""
                echo "Options:"
                echo "  --multi                       Setup all standard subdomains (app, static, cdn, api, admin)"
                echo "  --fluxer-public-port PORT    Specify FLUXER_PUBLIC_PORT (40000-50000)"
                echo "  --fluxer-app-port PORT       Specify FLUXER_APP_PORT (for app subdomain)"
                echo "  --fluxer-api-port PORT       Specify FLUXER_API_PORT (for api subdomain)"
                echo "  --fluxer-admin-port PORT     Specify FLUXER_ADMIN_PORT (40000-50000)"
                echo "  -h, --help                    Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0 example.com                    # Auto multi-subdomain mode"
                echo "  $0 www example.com                # Single subdomain"
                echo "  $0 www example.com --multi        # Explicit multi-subdomain"
                echo "  $0 app example.com --fluxer-public-port 45000"
                exit 0
                ;;
            --*)
                # Unknown option, skip and its value
                shift
                if [[ "$1" != --* ]] && [[ $# -gt 0 ]]; then
                    shift
                fi
                ;;
            *)
                positional_args+=("$1")
                shift
                ;;
        esac
    done
    
    # Check for positional arguments
    if [ ${#positional_args[@]} -lt 1 ]; then
        print_error "Usage: $0 <domain> [OPTIONS]"
        print_error "       $0 <subdomain> <domain> [OPTIONS]"
        echo "Example: $0 example.com"
        echo "         $0 www example.com"
        echo "Use --help for more options"
        exit 1
    fi
    
    # If only 1 argument provided, treat as domain and enable multi-mode
    if [ ${#positional_args[@]} -eq 1 ]; then
        local domain="${positional_args[0]}"
        local subdomain="www"
        MULTI_MODE=true
        print_info "Single domain provided, enabling multi-subdomain mode for $domain..."
    else
        local subdomain="${positional_args[0]}"
        local domain="${positional_args[1]}"
    fi
    
    if [ "$MULTI_MODE" = true ]; then
        print_info "Setting up multiple subdomains for $domain..."
    else
        print_info "Setting up ${subdomain}.${domain}..."
    fi
    echo ""
    
    # Check if .env file exists and read ports from it
    local fluxer_public_port
    local fluxer_admin_port
    
    print_info "Checking for .env file at: $ENV_FILE"
    
    # Command-line arguments take precedence
    if [ -n "$USER_FLUXER_PUBLIC_PORT" ]; then
        fluxer_public_port="$USER_FLUXER_PUBLIC_PORT"
        print_info "Using command-line FLUXER_PUBLIC_PORT: $fluxer_public_port"
    fi
    
    if [ -n "$USER_FLUXER_ADMIN_PORT" ]; then
        fluxer_admin_port="$USER_FLUXER_ADMIN_PORT"
        print_info "Using command-line FLUXER_ADMIN_PORT: $fluxer_admin_port"
    fi
    
    # If command-line ports not specified, read from docker-compose or .env
    if [ -z "$fluxer_public_port" ] || [ -z "$fluxer_admin_port" ]; then
        # First try to read from docker-compose file
        if ports=$(read_ports_from_compose); then
            fluxer_public_port=$(echo "$ports" | awk '{print $1}')
            fluxer_admin_port=$(echo "$ports" | awk '{print $2}')
            print_success "Ports loaded from docker-compose file"
        elif [ -f "$ENV_FILE" ]; then
            print_info "Reading ports from .env file..."
            source "$ENV_FILE"
            fluxer_public_port="${FLUXER_PUBLIC_PORT:-}"
            fluxer_admin_port="${FLUXER_ADMIN_PORT:-}"
            
            print_info "Found FLUXER_PUBLIC_PORT: $fluxer_public_port"
            print_info "Found FLUXER_ADMIN_PORT: $fluxer_admin_port"
            
            if [ -z "$fluxer_public_port" ] || [ -z "$fluxer_admin_port" ]; then
                print_error "FLUXER_PUBLIC_PORT or FLUXER_ADMIN_PORT not found in .env file"
                print_info "Scanning for available ports instead..."
                fluxer_public_port=$(find_free_port 40000 50000 "" "")
                fluxer_admin_port=$(find_free_port 40000 50000 "" "$fluxer_public_port")
            else
                print_success "Ports loaded from .env file"
            fi
        else
            # Scan for available ports
            print_info "No .env file found, scanning for available ports..."
            fluxer_public_port=$(find_free_port 40000 50000 "" "")
            fluxer_admin_port=$(find_free_port 40000 50000 "" "$fluxer_public_port")
        fi
    fi
    
    print_success "Ports selected:"
    print_info "  FLUXER_PUBLIC_PORT: $fluxer_public_port"
    print_info "  FLUXER_ADMIN_PORT: $fluxer_admin_port"
    echo ""
    
    # Setup subdomains
    if [ "$MULTI_MODE" = true ]; then
        # Setup standard subdomains
        # app uses fluxer_app_port if specified, otherwise fluxer_public_port
        # api uses fluxer_api_port if specified, otherwise fluxer_public_port
        # static and cdn use fluxer_public_port (fluxer_server)
        local app_port="${USER_FLUXER_APP_PORT:-$fluxer_public_port}"
        local api_port="${USER_FLUXER_API_PORT:-$fluxer_public_port}"
        setup_subdomain "app" "$domain" "$app_port"
        setup_subdomain "static" "$domain" "$fluxer_public_port"
        setup_subdomain "cdn" "$domain" "$fluxer_public_port"
        setup_subdomain "api" "$domain" "$api_port"
        setup_subdomain "admin" "$domain" "$fluxer_admin_port"
    else
        # Setup single subdomain
        setup_subdomain "$subdomain" "$domain" "$fluxer_public_port"
    fi
    
    test_nginx_config
    reload_nginx
    
    display_summary "$domain"
}

# Run main function
main "$@"

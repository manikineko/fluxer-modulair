#!/usr/bin/env bash

# Fluxer World Simple Setup Script
# This script helps you get Fluxer World running quickly with Docker Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { printf "%b\n" "${GREEN}[INFO]${NC} $1"; }
warn() { printf "%b\n" "${YELLOW}[WARN]${NC} $1"; }
error() { printf "%b\n" "${RED}[ERROR]${NC} $1"; }

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Fluxer World Setup${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

check_dependencies() {
    info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        echo "  Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        echo "  Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    info "Dependencies OK"
}

setup_config() {
    info "Setting up configuration..."
    
    # Create config directory if it doesn't exist
    mkdir -p "$REPO_ROOT/config"
    
    # Load existing .env if it exists to get current ports
    if [ -f "$REPO_ROOT/.env" ]; then
        info "Loading existing ports from .env..."
        source "$REPO_ROOT/.env" 2>/dev/null || true
    fi
    
    # Generate random keys
    info "Generating random keys and secrets..."
    S3_ACCESS_KEY=$(openssl rand -hex 16 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 32)
    S3_SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    MEDIA_PROXY_SECRET=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    ADMIN_SECRET_KEY_BASE=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    ADMIN_OAUTH_CLIENT_ID=$(openssl rand -hex 16 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 32)
    ADMIN_OAUTH_CLIENT_SECRET=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    MARKETING_SECRET_KEY_BASE=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    GATEWAY_ADMIN_RELOAD_SECRET=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    SUDO_MODE_SECRET=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    CONNECTION_INITIATION_SECRET=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    MEILI_MASTER_KEY=$(openssl rand -hex 32 2>/dev/null || tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    
    # Use ports from .env or defaults
    local FLUXER_PUBLIC_PORT="${FLUXER_PUBLIC_PORT:-49320}"
    local FLUXER_GATEWAY_PORT="${FLUXER_GATEWAY_PORT:-49107}"
    local FLUXER_MARKETING_PORT="${FLUXER_MARKETING_PORT:-49531}"
    
    # Check if config files exist
    if [ ! -f "$REPO_ROOT/config/config.json" ]; then
        if [ -f "$REPO_ROOT/config/config.dev.template.json" ]; then
            info "Creating config.json from template..."
            cp "$REPO_ROOT/config/config.dev.template.json" "$REPO_ROOT/config/config.json"
            # Update template with generated keys
            if command -v jq &> /dev/null; then
                jq --arg s3_access_key "$S3_ACCESS_KEY" \
                   --arg s3_secret_key "$S3_SECRET_KEY" \
                   --arg media_proxy_secret "$MEDIA_PROXY_SECRET" \
                   --arg admin_secret_base "$ADMIN_SECRET_KEY_BASE" \
                   --arg oauth_client_id "$ADMIN_OAUTH_CLIENT_ID" \
                   --arg oauth_client_secret "$ADMIN_OAUTH_CLIENT_SECRET" \
                   --arg marketing_secret_base "$MARKETING_SECRET_KEY_BASE" \
                   --arg gateway_secret "$GATEWAY_ADMIN_RELOAD_SECRET" \
                   --arg sudo_secret "$SUDO_MODE_SECRET" \
                   --arg connection_secret "$CONNECTION_INITIATION_SECRET" \
                   --arg meili_key "$MEILI_MASTER_KEY" \
                   '
                   .s3.access_key_id = $s3_access_key |
                   .s3.secret_access_key = $s3_secret_key |
                   .services.media_proxy.secret_key = $media_proxy_secret |
                   .services.admin.secret_key_base = $admin_secret_base |
                   .services.admin.oauth_client_id = $oauth_client_id |
                   .services.admin.oauth_client_secret = $oauth_client_secret |
                   .services.marketing.secret_key_base = $marketing_secret_base |
                   .services.gateway.admin_reload_secret = $gateway_secret |
                   .auth.sudo_mode_secret = $sudo_secret |
                   .auth.connection_initiation_secret = $connection_secret |
                   .integrations.search.api_key = $meili_key
                   ' "$REPO_ROOT/config/config.json" > "${REPO_ROOT}/config/config.json.tmp" && mv "${REPO_ROOT}/config/config.json.tmp" "$REPO_ROOT/config/config.json"
            fi
        else
            warn "No config template found, using minimal config"
            cat > "$REPO_ROOT/config/config.json" <<EOF
{
  "env": "development",
  "domain": {
    "base_domain": "localhost",
    "public_port": $FLUXER_PUBLIC_PORT,
    "public_scheme": "http"
  },
  "database": {
    "backend": "sqlite",
    "sqlite_path": "./data/dev.db"
  },
  "internal": {
    "kv": "redis://valkey:6379/0"
  },
  "s3": {
    "access_key_id": "$S3_ACCESS_KEY",
    "secret_access_key": "$S3_SECRET_KEY",
    "endpoint": "http://localhost:9000"
  },
  "services": {
    "server": {
      "port": $FLUXER_PUBLIC_PORT,
      "host": "0.0.0.0"
    },
    "media_proxy": {
      "secret_key": "$MEDIA_PROXY_SECRET"
    },
    "admin": {
      "secret_key_base": "$ADMIN_SECRET_KEY_BASE",
      "oauth_client_id": "$ADMIN_OAUTH_CLIENT_ID",
      "oauth_client_secret": "$ADMIN_OAUTH_CLIENT_SECRET"
    },
    "marketing": {
      "enabled": true,
      "port": $FLUXER_MARKETING_PORT,
      "host": "0.0.0.0",
      "secret_key_base": "$MARKETING_SECRET_KEY_BASE"
    },
    "gateway": {
      "port": $FLUXER_GATEWAY_PORT,
      "admin_reload_secret": "$GATEWAY_ADMIN_RELOAD_SECRET"
    }
  },
  "auth": {
    "sudo_mode_secret": "$SUDO_MODE_SECRET",
    "connection_initiation_secret": "$CONNECTION_INITIATION_SECRET"
  },
  "integrations": {
    "search": {
      "engine": "meilisearch",
      "url": "http://meilisearch:7700",
      "api_key": "$MEILI_MASTER_KEY"
    }
  }
}
EOF
        fi
    fi
    
    if [ ! -f "$REPO_ROOT/config/admin-config.json" ]; then
        info "Creating admin-config.json..."
        cat > "$REPO_ROOT/config/admin-config.json" <<EOF
{
  "env": "development",
  "domain": {
    "base_domain": "localhost",
    "public_port": $FLUXER_PUBLIC_PORT,
    "public_scheme": "http"
  },
  "database": {
    "backend": "sqlite",
    "sqlite_path": "./data/dev.db"
  },
  "internal": {
    "kv": "redis://valkey:6379/0"
  },
  "s3": {
    "access_key_id": "$S3_ACCESS_KEY",
    "secret_access_key": "$S3_SECRET_KEY",
    "endpoint": "http://host.docker.internal:9000"
  },
  "services": {
    "server": {
      "port": $FLUXER_PUBLIC_PORT,
      "host": "0.0.0.0"
    },
    "media_proxy": {
      "secret_key": "$MEDIA_PROXY_SECRET"
    },
    "admin": {
      "secret_key_base": "$ADMIN_SECRET_KEY_BASE",
      "oauth_client_id": "$ADMIN_OAUTH_CLIENT_ID",
      "oauth_client_secret": "$ADMIN_OAUTH_CLIENT_SECRET"
    },
    "marketing": {
      "enabled": true,
      "port": $FLUXER_MARKETING_PORT,
      "host": "0.0.0.0",
      "secret_key_base": "$MARKETING_SECRET_KEY_BASE"
    },
    "gateway": {
      "port": $FLUXER_GATEWAY_PORT,
      "admin_reload_secret": "$GATEWAY_ADMIN_RELOAD_SECRET"
    }
  },
  "auth": {
    "sudo_mode_secret": "$SUDO_MODE_SECRET",
    "connection_initiation_secret": "$CONNECTION_INITIATION_SECRET"
  },
  "integrations": {
    "search": {
      "engine": "meilisearch",
      "url": "http://meilisearch:7700",
      "api_key": "$MEILI_MASTER_KEY"
    }
  }
}
EOF
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f "$REPO_ROOT/.env" ]; then
        if [ -f "$REPO_ROOT/.env.example" ]; then
            info "Creating .env from .env.example..."
            cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
        else
            info "Creating .env with generated values..."
            cat > "$REPO_ROOT/.env" <<EOF
# Fluxer World Environment Configuration
# Generated by setup.sh

# ============================================
# Service Ports
# ============================================
FLUXER_PUBLIC_PORT=49320
FLUXER_API_PORT=49320
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
# Search Configuration
# ============================================
MEILI_MASTER_KEY=$MEILI_MASTER_KEY

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
MINIO_ROOT_USER=$S3_ACCESS_KEY
MINIO_ROOT_PASSWORD=$S3_SECRET_KEY
S3_ACCESS_KEY_ID=$S3_ACCESS_KEY
S3_SECRET_ACCESS_KEY=$S3_SECRET_KEY
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
# Security Keys
# ============================================
MEDIA_PROXY_SECRET=$MEDIA_PROXY_SECRET
ADMIN_SECRET_KEY_BASE=$ADMIN_SECRET_KEY_BASE
OAUTH_CLIENT_ID=$ADMIN_OAUTH_CLIENT_ID
OAUTH_CLIENT_SECRET=$ADMIN_OAUTH_CLIENT_SECRET
MARKETING_SECRET_KEY_BASE=$MARKETING_SECRET_KEY_BASE
GATEWAY_ADMIN_RELOAD_SECRET=$GATEWAY_ADMIN_RELOAD_SECRET
SUDO_MODE_SECRET=$SUDO_MODE_SECRET
CONNECTION_INITIATION_SECRET=$CONNECTION_INITIATION_SECRET

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
    else
        # Update existing .env with generated keys if they're empty
        if [ -n "$MEDIA_PROXY_SECRET" ]; then
            sed -i "s/^MEDIA_PROXY_SECRET=.*/MEDIA_PROXY_SECRET=$MEDIA_PROXY_SECRET/" "$REPO_ROOT/.env" 2>/dev/null || echo "MEDIA_PROXY_SECRET=$MEDIA_PROXY_SECRET" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$ADMIN_SECRET_KEY_BASE" ]; then
            sed -i "s/^ADMIN_SECRET_KEY_BASE=.*/ADMIN_SECRET_KEY_BASE=$ADMIN_SECRET_KEY_BASE/" "$REPO_ROOT/.env" 2>/dev/null || echo "ADMIN_SECRET_KEY_BASE=$ADMIN_SECRET_KEY_BASE" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$ADMIN_OAUTH_CLIENT_ID" ]; then
            sed -i "s/^OAUTH_CLIENT_ID=.*/OAUTH_CLIENT_ID=$ADMIN_OAUTH_CLIENT_ID/" "$REPO_ROOT/.env" 2>/dev/null || echo "OAUTH_CLIENT_ID=$ADMIN_OAUTH_CLIENT_ID" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$ADMIN_OAUTH_CLIENT_SECRET" ]; then
            sed -i "s/^OAUTH_CLIENT_SECRET=.*/OAUTH_CLIENT_SECRET=$ADMIN_OAUTH_CLIENT_SECRET/" "$REPO_ROOT/.env" 2>/dev/null || echo "OAUTH_CLIENT_SECRET=$ADMIN_OAUTH_CLIENT_SECRET" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$MARKETING_SECRET_KEY_BASE" ]; then
            sed -i "s/^MARKETING_SECRET_KEY_BASE=.*/MARKETING_SECRET_KEY_BASE=$MARKETING_SECRET_KEY_BASE/" "$REPO_ROOT/.env" 2>/dev/null || echo "MARKETING_SECRET_KEY_BASE=$MARKETING_SECRET_KEY_BASE" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$GATEWAY_ADMIN_RELOAD_SECRET" ]; then
            sed -i "s/^GATEWAY_ADMIN_RELOAD_SECRET=.*/GATEWAY_ADMIN_RELOAD_SECRET=$GATEWAY_ADMIN_RELOAD_SECRET/" "$REPO_ROOT/.env" 2>/dev/null || echo "GATEWAY_ADMIN_RELOAD_SECRET=$GATEWAY_ADMIN_RELOAD_SECRET" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$SUDO_MODE_SECRET" ]; then
            sed -i "s/^SUDO_MODE_SECRET=.*/SUDO_MODE_SECRET=$SUDO_MODE_SECRET/" "$REPO_ROOT/.env" 2>/dev/null || echo "SUDO_MODE_SECRET=$SUDO_MODE_SECRET" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$CONNECTION_INITIATION_SECRET" ]; then
            sed -i "s/^CONNECTION_INITIATION_SECRET=.*/CONNECTION_INITIATION_SECRET=$CONNECTION_INITIATION_SECRET/" "$REPO_ROOT/.env" 2>/dev/null || echo "CONNECTION_INITIATION_SECRET=$CONNECTION_INITIATION_SECRET" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$MEILI_MASTER_KEY" ]; then
            sed -i "s/^MEILI_MASTER_KEY=.*/MEILI_MASTER_KEY=$MEILI_MASTER_KEY/" "$REPO_ROOT/.env" 2>/dev/null || echo "MEILI_MASTER_KEY=$MEILI_MASTER_KEY" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$S3_ACCESS_KEY" ]; then
            sed -i "s/^S3_ACCESS_KEY_ID=.*/S3_ACCESS_KEY_ID=$S3_ACCESS_KEY/" "$REPO_ROOT/.env" 2>/dev/null || echo "S3_ACCESS_KEY_ID=$S3_ACCESS_KEY" >> "$REPO_ROOT/.env"
        fi
        if [ -n "$S3_SECRET_KEY" ]; then
            sed -i "s/^S3_SECRET_ACCESS_KEY=.*/S3_SECRET_ACCESS_KEY=$S3_SECRET_KEY/" "$REPO_ROOT/.env" 2>/dev/null || echo "S3_SECRET_ACCESS_KEY=$S3_SECRET_KEY" >> "$REPO_ROOT/.env"
        fi
    fi
    
    # Create data directories
    mkdir -p "$REPO_ROOT/data"
    mkdir -p "$REPO_ROOT/dev"
    
    info "Configuration setup complete"
}

generate_secrets() {
    info "Generating secrets..."
    
    CONFIG_PATH="$REPO_ROOT/config/config.json"
    
    if command -v jq &> /dev/null; then
        # Generate random secrets if jq is available
        TEMP_CONFIG="$CONFIG_PATH.tmp"
        
        # Generate random hex values
        S3_ACCESS_KEY=$(openssl rand -hex 16 2>/dev/null || echo "fluxer-dev-access-key")
        S3_SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "fluxer-dev-secret-key")
        ADMIN_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "dev-secret-key-base-change-in-production")
        MEDIA_PROXY_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
        
        jq --arg s3_access "$S3_ACCESS_KEY" \
           --arg s3_secret "$S3_SECRET_KEY" \
           --arg admin_secret "$ADMIN_SECRET" \
           --arg media_secret "$MEDIA_PROXY_SECRET" \
           '.s3.access_key_id = $s3_access |
            .s3.secret_access_key = $s3_secret |
            .services.admin.secret_key_base = $admin_secret |
            .services.media_proxy.secret_key = $media_secret' \
           "$CONFIG_PATH" > "$TEMP_CONFIG" 2>/dev/null || true
        
        if [ -f "$TEMP_CONFIG" ] && [ -s "$TEMP_CONFIG" ]; then
            mv "$TEMP_CONFIG" "$CONFIG_PATH"
            info "Secrets generated and updated in config"
        else
            rm -f "$TEMP_CONFIG"
            warn "Could not update config with secrets (jq may have failed)"
        fi
    else
        warn "jq not found, skipping secret generation"
        warn "Install jq for automatic secret generation: sudo apt install jq"
    fi
}

select_profile() {
    echo ""
    echo "Select setup profile:"
    echo "  1) Minimal - Core services only (recommended for testing)"
    echo "  2) Full    - All services including search and voice"
    echo "  3) Dev     - Development setup with debugging enabled"
    echo ""
    read -p "Enter choice [1-3] (default: 1): " choice
    choice="${choice:-1}"
    
    case $choice in
        1) PROFILE="minimal" ;;
        2) PROFILE="full" ;;
        3) PROFILE="dev" ;;
        *) 
            warn "Invalid choice, using minimal"
            PROFILE="minimal"
            ;;
    esac
    
    echo ""
    info "Selected profile: $PROFILE"
}

start_services() {
    info "Starting services with profile: $PROFILE..."
    
    # Check which docker compose command to use
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    cd "$REPO_ROOT"
    
    # Stop existing services if any
    $DOCKER_COMPOSE -f docker-compose.simple.yaml --profile $PROFILE down 2>/dev/null || true
    
    # Start services
    $DOCKER_COMPOSE -f docker-compose.simple.yaml --profile $PROFILE up -d
    
    info "Services started!"
}

show_status() {
    echo ""
    info "Checking service status..."
    
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    cd "$REPO_ROOT"
    $DOCKER_COMPOSE -f docker-compose.simple.yaml ps
}

show_next_steps() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Services are now running. Access them at:"
    echo ""
    echo "  - Fluxer App:     http://localhost:48763"
    echo "  - Fluxer Admin:    http://localhost:8081"
    echo "  - Static Files:    http://localhost:8082"
    echo "  - MinIO Console:   http://localhost:9001"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker compose -f docker-compose.simple.yaml logs -f"
    echo "  Stop all:     docker compose -f docker-compose.simple.yaml down"
    echo "  Restart:      docker compose -f docker-compose.simple.yaml restart"
    echo ""
    echo "For more information, see README.md"
    echo ""
}

main() {
    print_header
    check_dependencies
    setup_config
    generate_secrets
    select_profile
    start_services
    sleep 5
    show_status
    show_next_steps
}

main "$@"

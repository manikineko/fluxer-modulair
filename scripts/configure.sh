#!/bin/bash

# Fluxer Configuration Script
# This script prompts for domains, ports, and settings, then sets up .env, configs, and nginx

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Prompt for environment type
print_header "Fluxer Configuration Setup"
echo ""
echo "This script will configure your Fluxer installation."
echo "It will create/update .env, config.json, and nginx.conf files."
echo ""

read -p "Environment type (development/production) [development]: " ENV_TYPE
ENV_TYPE=${ENV_TYPE:-development}

if [[ "$ENV_TYPE" != "development" && "$ENV_TYPE" != "production" ]]; then
    print_error "Invalid environment type. Must be 'development' or 'production'."
    exit 1
fi

print_success "Environment: $ENV_TYPE"

# Prompt for domain configuration
echo ""
read -p "Base domain (e.g., chat.example.com or localhost): " BASE_DOMAIN
BASE_DOMAIN=${BASE_DOMAIN:-localhost}

if [[ "$ENV_TYPE" == "production" ]]; then
    read -p "Public scheme (http/https) [https]: " PUBLIC_SCHEME
    PUBLIC_SCHEME=${PUBLIC_SCHEME:-https}
    read -p "Public port [443]: " PUBLIC_PORT
    PUBLIC_PORT=${PUBLIC_PORT:-443}
else
    PUBLIC_SCHEME="http"
    read -p "Public port [48763]: " PUBLIC_PORT
    PUBLIC_PORT=${PUBLIC_PORT:-48763}
fi

print_success "Domain: $PUBLIC_SCHEME://$BASE_DOMAIN:$PUBLIC_PORT"

# Prompt for service ports
echo ""
print_header "Service Ports Configuration"
echo "Press Enter to use default values"

read -p "Fluxer public port [$PUBLIC_PORT]: " FLUXER_PUBLIC_PORT
FLUXER_PUBLIC_PORT=${FLUXER_PUBLIC_PORT:-$PUBLIC_PORT}

read -p "Fluxer admin port [8081]: " FLUXER_ADMIN_PORT
FLUXER_ADMIN_PORT=${FLUXER_ADMIN_PORT:-8081}

read -p "PostgreSQL port [5432]: " POSTGRES_PORT
POSTGRES_PORT=${POSTGRES_PORT:-5432}

read -p "MinIO port [9000]: " MINIO_PORT
MINIO_PORT=${MINIO_PORT:-9000}

read -p "MinIO console port [9001]: " MINIO_CONSOLE_PORT
MINIO_CONSOLE_PORT=${MINIO_CONSOLE_PORT:-9001}

read -p "IPFS swarm port [4001]: " IPFS_SWARM_PORT
IPFS_SWARM_PORT=${IPFS_SWARM_PORT:-4001}

read -p "IPFS API port [5001]: " IPFS_API_PORT
IPFS_API_PORT=${IPFS_API_PORT:-5001}

read -p "IPFS gateway port [8080]: " IPFS_GATEWAY_PORT
IPFS_GATEWAY_PORT=${IPFS_GATEWAY_PORT:-8080}

read -p "Meilisearch port [7700]: " MEILI_PORT
MEILI_PORT=${MEILI_PORT:-7700}

read -p "Elasticsearch port [9200]: " ELASTICSEARCH_PORT
ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT:-9200}

read -p "LiveKit port [7880]: " LIVEKIT_PORT
LIVEKIT_PORT=${LIVEKIT_PORT:-7880}

# Internal service ports (randomized by default)
RANDOM_SERVER_PORT=$((40000 + RANDOM % 10000))
RANDOM_GATEWAY_PORT=$((40000 + RANDOM % 10000))
RANDOM_MARKETING_PORT=$((40000 + RANDOM % 10000))
STATIC_CDN_PORT=8082

read -p "Server port [$RANDOM_SERVER_PORT]: " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-$RANDOM_SERVER_PORT}

read -p "Gateway port [$RANDOM_GATEWAY_PORT]: " GATEWAY_PORT
GATEWAY_PORT=${GATEWAY_PORT:-$RANDOM_GATEWAY_PORT}

read -p "Marketing port [$RANDOM_MARKETING_PORT]: " MARKETING_PORT
MARKETING_PORT=${MARKETING_PORT:-$RANDOM_MARKETING_PORT}

read -p "Static CDN port [$STATIC_CDN_PORT]: " STATIC_CDN_PORT_INPUT
STATIC_CDN_PORT=${STATIC_CDN_PORT_INPUT:-$STATIC_CDN_PORT}

# Database configuration
echo ""
print_header "Database Configuration"

read -p "Database backend (sqlite/postgres) [sqlite]: " DB_BACKEND
DB_BACKEND=${DB_BACKEND:-sqlite}

if [[ "$DB_BACKEND" == "postgres" ]]; then
    read -p "PostgreSQL host [localhost]: " POSTGRES_HOST
    POSTGRES_HOST=${POSTGRES_HOST:-localhost}
    read -p "PostgreSQL user [fluxer]: " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-fluxer}
    read -p "PostgreSQL password [fluxer]: " POSTGRES_PASSWORD
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-fluxer}
    read -p "PostgreSQL database [fluxer]: " POSTGRES_DB
    POSTGRES_DB=${POSTGRES_DB:-fluxer}
else
    read -p "SQLite path [./data/fluxer.db]: " SQLITE_PATH
    SQLITE_PATH=${SQLITE_PATH:-./data/fluxer.db}
fi

# S3/MinIO configuration
echo ""
print_header "S3/MinIO Configuration"

read -p "S3 access key ID [minioadmin]: " S3_ACCESS_KEY
S3_ACCESS_KEY=${S3_ACCESS_KEY:-minioadmin}

read -p "S3 secret access key [minioadmin]: " S3_SECRET_KEY
S3_SECRET_KEY=${S3_SECRET_KEY:-minioadmin}

read -p "S3 endpoint [http://127.0.0.1:9000]: " S3_ENDPOINT
S3_ENDPOINT=${S3_ENDPOINT:-http://127.0.0.1:9000}

# Meilisearch configuration
echo ""
print_header "Search Configuration"

read -p "Meilisearch master key (leave empty to generate): " MEILI_MASTER_KEY
if [[ -z "$MEILI_MASTER_KEY" ]]; then
    MEILI_MASTER_KEY=$(openssl rand -hex 32)
    print_success "Generated Meilisearch master key"
fi

# Redis/Valkey configuration
echo ""
print_header "Redis/Valkey Configuration"

read -p "Redis URL [redis://valkey:6379/0]: " REDIS_URL
REDIS_URL=${REDIS_URL:-redis://valkey:6379/0}

# NATS configuration
echo ""
print_header "NATS Configuration"

read -p "NATS core URL [nats://nats:4222]: " NATS_CORE_URL
NATS_CORE_URL=${NATS_CORE_URL:-nats://nats:4222}

read -p "NATS jetstream URL [nats://nats:4222]: " NATS_JETSTREAM_URL
NATS_JETSTREAM_URL=${NATS_JETSTREAM_URL:-nats://nats:4222}

read -p "NATS auth token (leave empty to generate): " NATS_AUTH_TOKEN
if [[ -z "$NATS_AUTH_TOKEN" ]]; then
    NATS_AUTH_TOKEN=$(openssl rand -hex 32)
    print_success "Generated NATS auth token"
fi

# Generate secrets
echo ""
print_header "Security Secrets"
print_warning "Generating secure secrets..."

MEDIA_PROXY_SECRET=$(openssl rand -hex 32)
ADMIN_SECRET_KEY_BASE=$(openssl rand -hex 32)
ADMIN_OAUTH_CLIENT_ID=$(openssl rand -hex 16)
ADMIN_OAUTH_CLIENT_SECRET=$(openssl rand -hex 32)
MARKETING_SECRET_KEY_BASE=$(openssl rand -hex 32)
GATEWAY_ADMIN_RELOAD_SECRET=$(openssl rand -hex 32)
SUDO_MODE_SECRET=$(openssl rand -hex 32)
CONNECTION_INITIATION_SECRET=$(openssl rand -hex 32)

print_success "Generated all security secrets"

# VAPID keys (optional)
echo ""
read -p "VAPID public key (leave empty to skip): " VAPID_PUBLIC_KEY
read -p "VAPID private key (leave empty to skip): " VAPID_PRIVATE_KEY

# Optional integrations
echo ""
print_header "Optional Integrations"
echo "Press Enter to skip any integration"

read -p "Stripe secret key (leave empty to skip): " STRIPE_SECRET_KEY
read -p "Stripe webhook secret (leave empty to skip): " STRIPE_WEBHOOK_SECRET

read -p "SMTP host (leave empty to skip): " SMTP_HOST
if [[ -n "$SMTP_HOST" ]]; then
    read -p "SMTP port [587]: " SMTP_PORT
    SMTP_PORT=${SMTP_PORT:-587}
    read -p "SMTP user: " SMTP_USER
    read -p "SMTP password: " SMTP_PASSWORD
fi

read -p "LiveKit API key (leave empty to skip): " LIVEKIT_API_KEY
read -p "LiveKit API secret (leave empty to skip): " LIVEKIT_API_SECRET

read -p "Klipy API key (leave empty to skip): " KLIPY_API_KEY
read -p "Tenor API key (leave empty to skip): " TENOR_API_KEY

# Nginx configuration
echo ""
print_header "Nginx Configuration"

read -p "Gateway domain (e.g., gateway.fluxer.app) [gateway.$BASE_DOMAIN]: " GATEWAY_DOMAIN
GATEWAY_DOMAIN=${GATEWAY_DOMAIN:-gateway.$BASE_DOMAIN}

read -p "Gateway backend port [9443]: " GATEWAY_BACKEND_PORT
GATEWAY_BACKEND_PORT=${GATEWAY_BACKEND_PORT:-9443}

read -p "Main backend port [8443]: " MAIN_BACKEND_PORT
MAIN_BACKEND_PORT=${MAIN_BACKEND_PORT:-8443}

read -p "HTTP backend port [8080]: " HTTP_BACKEND_PORT
HTTP_BACKEND_PORT=${HTTP_BACKEND_PORT:-8080}

# Summary
echo ""
print_header "Configuration Summary"
echo "Environment: $ENV_TYPE"
echo "Base domain: $BASE_DOMAIN"
echo "Public URL: $PUBLIC_SCHEME://$BASE_DOMAIN:$PUBLIC_PORT"
echo "Database: $DB_BACKEND"
echo "S3 endpoint: $S3_ENDPOINT"
echo "Gateway domain: $GATEWAY_DOMAIN"
echo ""

read -p "Proceed with configuration? (y/n) [y]: " PROCEED
PROCEED=${PROCEED:-y}

if [[ "$PROCEED" != "y" && "$PROCEED" != "Y" ]]; then
    print_error "Configuration cancelled."
    exit 1
fi

# Backup existing files
echo ""
print_header "Backing Up Existing Files"

BACKUP_DIR="$PROJECT_ROOT/.config-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [[ -f "$PROJECT_ROOT/.env" ]]; then
    cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/.env"
    print_success "Backed up .env"
fi

if [[ -f "$PROJECT_ROOT/config/config.json" ]]; then
    cp "$PROJECT_ROOT/config/config.json" "$BACKUP_DIR/config.json"
    print_success "Backed up config.json"
fi


if [[ -f "$PROJECT_ROOT/fluxer_devops/nginx/nginx.conf" ]]; then
    cp "$PROJECT_ROOT/fluxer_devops/nginx/nginx.conf" "$BACKUP_DIR/nginx-devops.conf"
    print_success "Backed up fluxer_devops/nginx/nginx.conf"
fi

print_success "Backups saved to $BACKUP_DIR"

# Generate .env file
echo ""
print_header "Generating .env File"

cat > "$PROJECT_ROOT/.env" << EOF
# Fluxer World Environment Configuration
# Generated by configure.sh on $(date)

# ============================================
# Service Ports
# ============================================
FLUXER_PUBLIC_PORT=$FLUXER_PUBLIC_PORT
FLUXER_ADMIN_PORT=$FLUXER_ADMIN_PORT
POSTGRES_PORT=$POSTGRES_PORT
MINIO_PORT=$MINIO_PORT
MINIO_CONSOLE_PORT=$MINIO_CONSOLE_PORT
IPFS_SWARM_PORT=$IPFS_SWARM_PORT
IPFS_API_PORT=$IPFS_API_PORT
IPFS_GATEWAY_PORT=$IPFS_GATEWAY_PORT
MEILI_PORT=$MEILI_PORT
ELASTICSEARCH_PORT=$ELASTICSEARCH_PORT
LIVEKIT_PORT=$LIVEKIT_PORT

# ============================================
# Search Configuration
# ============================================
MEILI_MASTER_KEY=$MEILI_MASTER_KEY

# ============================================
# Database Configuration
# ============================================
EOF

if [[ "$DB_BACKEND" == "postgres" ]]; then
    cat >> "$PROJECT_ROOT/.env" << EOF
POSTGRES_HOST=$POSTGRES_HOST
POSTGRES_PORT=$POSTGRES_PORT
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
EOF
else
    cat >> "$PROJECT_ROOT/.env" << EOF
SQLITE_PATH=$SQLITE_PATH
EOF
fi

cat >> "$PROJECT_ROOT/.env" << EOF

# ============================================
# MinIO/S3 Configuration
# ============================================
MINIO_ROOT_USER=$S3_ACCESS_KEY
MINIO_ROOT_PASSWORD=$S3_SECRET_KEY
S3_ACCESS_KEY_ID=$S3_ACCESS_KEY
S3_SECRET_ACCESS_KEY=$S3_SECRET_KEY
S3_ENDPOINT=$S3_ENDPOINT

# ============================================
# Redis/Valkey Configuration
# ============================================
REDIS_URL=$REDIS_URL

# ============================================
# NATS Configuration
# ============================================
NATS_CORE_URL=$NATS_CORE_URL
NATS_JETSTREAM_URL=$NATS_JETSTREAM_URL
NATS_AUTH_TOKEN=$NATS_AUTH_TOKEN

# ============================================
# Optional: External Services
# ============================================
EOF

if [[ -n "$STRIPE_SECRET_KEY" ]]; then
    echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> "$PROJECT_ROOT/.env"
fi

if [[ -n "$STRIPE_WEBHOOK_SECRET" ]]; then
    echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> "$PROJECT_ROOT/.env"
fi

if [[ -n "$SMTP_HOST" ]]; then
    cat >> "$PROJECT_ROOT/.env" << EOF
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
EOF
fi

if [[ -n "$LIVEKIT_API_KEY" ]]; then
    echo "LIVEKIT_API_KEY=$LIVEKIT_API_KEY" >> "$PROJECT_ROOT/.env"
fi

if [[ -n "$LIVEKIT_API_SECRET" ]]; then
    echo "LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET" >> "$PROJECT_ROOT/.env"
fi

print_success "Generated .env file"

# Generate config.json
echo ""
print_header "Generating config.json"

if [[ "$ENV_TYPE" == "production" ]]; then
    TEMPLATE_FILE="$PROJECT_ROOT/config/config.production.template.json"
else
    TEMPLATE_FILE="$PROJECT_ROOT/config/config.dev.template.json"
fi

if [[ ! -f "$TEMPLATE_FILE" ]]; then
    print_error "Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Create config.json from template
cat > "$PROJECT_ROOT/config/config.json" << EOF
{
  "\$schema": "../packages/config/src/ConfigSchema.json",
  "env": "$ENV_TYPE",
  "domain": {
    "base_domain": "$BASE_DOMAIN",
    "public_scheme": "$PUBLIC_SCHEME",
    "public_port": $PUBLIC_PORT,
    "static_cdn_domain": "$BASE_DOMAIN:$STATIC_CDN_PORT"
  },
  "endpoint_overrides": {
    "api": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/api",
    "api_client": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/api",
    "gateway": "$PUBLIC_SCHEME://$BASE_DOMAIN:$GATEWAY_PORT",
    "media": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/media",
    "static_cdn": "$PUBLIC_SCHEME://$BASE_DOMAIN:$STATIC_CDN_PORT",
    "marketing": "$PUBLIC_SCHEME://$BASE_DOMAIN:$MARKETING_PORT",
    "admin": "$PUBLIC_SCHEME://$BASE_DOMAIN:$FLUXER_ADMIN_PORT",
    "app": "$PUBLIC_SCHEME://$BASE_DOMAIN:$FLUXER_PUBLIC_PORT",
    "invite": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/invite",
    "gift": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/gift"
  },
  "database": {
    "backend": "$DB_BACKEND",
EOF

if [[ "$DB_BACKEND" == "postgres" ]]; then
    cat >> "$PROJECT_ROOT/config/config.json" << EOF
    "host": "$POSTGRES_HOST",
    "port": $POSTGRES_PORT,
    "user": "$POSTGRES_USER",
    "password": "$POSTGRES_PASSWORD",
    "database": "$POSTGRES_DB"
EOF
else
    cat >> "$PROJECT_ROOT/config/config.json" << EOF
    "sqlite_path": "$SQLITE_PATH"
EOF
fi

cat >> "$PROJECT_ROOT/config/config.json" << EOF
  },
  "cookie": {
    "secure": $([ "$ENV_TYPE" == "production" ] && echo "true" || echo "false"),
    "domain": "$([ "$ENV_TYPE" == "production" ] && echo ".$BASE_DOMAIN" || echo "")
  },
  "internal": {
    "kv": "$REDIS_URL",
    "kv_mode": "standalone"
  },
  "s3": {
    "access_key_id": "$S3_ACCESS_KEY",
    "secret_access_key": "$S3_SECRET_KEY",
    "endpoint": "$S3_ENDPOINT",
    "region": "us-east-1",
    "buckets": {
      "cdn": "fluxer-cdn",
      "uploads": "fluxer-uploads",
      "downloads": "fluxer-downloads",
      "reports": "fluxer-reports",
      "harvests": "fluxer-harvests",
      "static": "fluxer-static"
    }
  },
  "services": {
    "server": {
      "port": $SERVER_PORT,
      "host": "0.0.0.0"
    },
    "s3": {
      "host": "localhost",
      "port": $MINIO_PORT,
      "data_dir": "./data/s3"
    },
    "media_proxy": {
      "secret_key": "$MEDIA_PROXY_SECRET"
    },
    "admin": {
      "secret_key_base": "$ADMIN_SECRET_KEY_BASE",
      "oauth_client_id": "$ADMIN_OAUTH_CLIENT_ID",
      "oauth_client_secret": "$ADMIN_OAUTH_CLIENT_SECRET",
      "base_path": ""
    },
    "marketing": {
      "enabled": true,
      "port": $MARKETING_PORT,
      "host": "0.0.0.0",
      "secret_key_base": "$MARKETING_SECRET_KEY_BASE"
    },
    "gateway": {
      "port": $GATEWAY_PORT,
      "admin_reload_secret": "$GATEWAY_ADMIN_RELOAD_SECRET",
      "media_proxy_endpoint": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/media",
      "logger_level": "$([ "$ENV_TYPE" == "production" ] && echo "info" || echo "debug")"
    },
    "nats": {
      "core_url": "$NATS_CORE_URL",
      "jetstream_url": "$NATS_JETSTREAM_URL",
      "auth_token": "$NATS_AUTH_TOKEN"
    }
  },
  "auth": {
    "sudo_mode_secret": "$SUDO_MODE_SECRET",
    "connection_initiation_secret": "$CONNECTION_INITIATION_SECRET",
    "vapid": {
      "public_key": "$VAPID_PUBLIC_KEY",
      "private_key": "$VAPID_PRIVATE_KEY"
    },
    "bluesky": {
      "enabled": false,
      "keys": []
    }
  },
  "discovery": {
    "min_member_count": 1
  },
EOF

if [[ "$ENV_TYPE" == "development" ]]; then
    cat >> "$PROJECT_ROOT/config/config.json" << EOF
  "dev": {
    "disable_rate_limits": true,
    "attachment_decay_enabled": false,
    "test_mode_enabled": false
  },
EOF
fi

cat >> "$PROJECT_ROOT/config/config.json" << EOF
  "integrations": {
EOF

if [[ -n "$STRIPE_SECRET_KEY" ]]; then
    cat >> "$PROJECT_ROOT/config/config.json" << EOF
    "stripe": {
      "enabled": true,
      "secret_key": "$STRIPE_SECRET_KEY",
      "webhook_secret": "$STRIPE_WEBHOOK_SECRET",
      "prices": {
        "monthly_usd": "",
        "monthly_eur": "",
        "yearly_usd": "",
        "yearly_eur": "",
        "gift_1_month_usd": "",
        "gift_1_month_eur": "",
        "gift_1_year_usd": "",
        "gift_1_year_eur": ""
      }
    },
EOF
fi

cat >> "$PROJECT_ROOT/config/config.json" << EOF
    "gif": {
      "provider": "klipy"
    },
    "klipy": {
      "api_key": "$KLIPY_API_KEY"
    },
    "tenor": {
      "api_key": "$TENOR_API_KEY"
    },
    "voice": {
      "enabled": $([ -n "$LIVEKIT_API_KEY" ] && echo "true" || echo "false"),
      "api_key": "$LIVEKIT_API_KEY",
      "api_secret": "$LIVEKIT_API_SECRET",
      "url": "ws://localhost:$LIVEKIT_PORT",
      "webhook_url": "$PUBLIC_SCHEME://$BASE_DOMAIN:$SERVER_PORT/api/webhooks/livekit",
      "default_region": {
        "id": "default",
        "name": "Default",
        "emoji": "🌐",
        "latitude": 0.0,
        "longitude": 0.0
      }
    },
    "search": {
      "engine": "meilisearch",
      "url": "http://meilisearch:$MEILI_PORT",
      "api_key": "$MEILI_MASTER_KEY"
    }
EOF

if [[ -n "$SMTP_HOST" ]]; then
    cat >> "$PROJECT_ROOT/config/config.json" << EOF
    ,
    "email": {
      "enabled": true,
      "provider": "smtp",
      "from_email": "noreply@$BASE_DOMAIN",
      "smtp": {
        "host": "$SMTP_HOST",
        "port": $SMTP_PORT,
        "username": "$SMTP_USER",
        "password": "$SMTP_PASSWORD",
        "secure": $([ "$SMTP_PORT" == "465" ] && echo "true" || echo "false")
      }
    }
EOF
fi

cat >> "$PROJECT_ROOT/config/config.json" << EOF
  },
  "instance": {
    "private_key_path": ""
  },
  "federation": {
    "enabled": false
  }
}
EOF

print_success "Generated config.json"

# Generate nginx.conf
echo ""
print_header "Generating nginx.conf"

cat > "$PROJECT_ROOT/fluxer_devops/nginx/nginx.conf" << EOF
user  www-data;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /run/nginx.pid;

include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections  1024;
}

stream {
    # Map SNI to upstream
    map \$ssl_preread_server_name \$upstream {
        $GATEWAY_DOMAIN      127.0.0.1:$GATEWAY_BACKEND_PORT;
        default                 127.0.0.1:$MAIN_BACKEND_PORT;
    }

    # HTTPS SNI router on 443, IPv4 + IPv6
    server {
        listen 443;
        listen [::]:443;
        proxy_pass \$upstream;
        ssl_preread on;
        proxy_protocol on;

        proxy_connect_timeout 60s;
        proxy_timeout 1h;
        proxy_buffer_size 16k;
    }

    # HTTP passthrough to main backend on 80
    server {
        listen 80;
        listen [::]:80;
        proxy_pass 127.0.0.1:$HTTP_BACKEND_PORT;
        proxy_protocol on;

        proxy_connect_timeout 60s;
        proxy_timeout 1h;
        proxy_buffer_size 16k;
    }
}
EOF

print_success "Generated fluxer_devops/nginx/nginx.conf (SNI router)"

# Generate domain-specific nginx configs for /etc/nginx/sites-available
echo ""
print_header "Generating Domain-Specific Nginx Configs"

NGINX_SITES_DIR="$PROJECT_ROOT/fluxer_devops/nginx/sites"
mkdir -p "$NGINX_SITES_DIR"

# Main domain config
cat > "$NGINX_SITES_DIR/$BASE_DOMAIN.conf" << EOF
# Main domain configuration for $BASE_DOMAIN
# Copy this to /etc/nginx/sites-available/$BASE_DOMAIN
# Then symlink: ln -s /etc/nginx/sites-available/$BASE_DOMAIN /etc/nginx/sites-enabled/

upstream fluxer_backend {
    server 127.0.0.1:$SERVER_PORT;
    keepalive 32;
}

upstream fluxer_gateway {
    server 127.0.0.1:$GATEWAY_PORT;
    keepalive 32;
}

upstream fluxer_marketing {
    server 127.0.0.1:$MARKETING_PORT;
    keepalive 32;
}

upstream fluxer_static {
    server 127.0.0.1:$STATIC_CDN_PORT;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name $BASE_DOMAIN;

    # Redirect to HTTPS in production
    $([ "$ENV_TYPE" == "production" ] && echo "return 301 https://\$server_name\$request_uri;" || echo "# HTTP only for development")

    # For development, serve HTTP directly
    $([ "$ENV_TYPE" == "development" ] && cat << DEVCONF
    location / {
        proxy_pass http://fluxer_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    location /api {
        proxy_pass http://fluxer_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /media {
        proxy_pass http://fluxer_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
DEVCONF
    )
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $BASE_DOMAIN;

    # SSL configuration (add your cert paths)
    # ssl_certificate /etc/ssl/certs/$BASE_DOMAIN.crt;
    # ssl_certificate_key /etc/ssl/private/$BASE_DOMAIN.key;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers HIGH:!aNULL:!MD5;

    # Main app
    location / {
        proxy_pass http://fluxer_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    # API endpoints
    location /api {
        proxy_pass http://fluxer_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Media proxy
    location /media {
        proxy_pass http://fluxer_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Gateway
    location /gateway {
        proxy_pass http://fluxer_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Marketing site
    location /marketing {
        proxy_pass http://fluxer_marketing;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Static CDN
    location /static {
        proxy_pass http://fluxer_static;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

print_success "Generated $NGINX_SITES_DIR/$BASE_DOMAIN.conf"

# Gateway domain config
if [[ "$GATEWAY_DOMAIN" != "gateway.$BASE_DOMAIN" ]]; then
    cat > "$NGINX_SITES_DIR/$GATEWAY_DOMAIN.conf" << EOF
# Gateway domain configuration for $GATEWAY_DOMAIN
# Copy this to /etc/nginx/sites-available/$GATEWAY_DOMAIN
# Then symlink: ln -s /etc/nginx/sites-available/$GATEWAY_DOMAIN /etc/nginx/sites-enabled/

upstream fluxer_gateway {
    server 127.0.0.1:$GATEWAY_PORT;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name $GATEWAY_DOMAIN;

    # Redirect to HTTPS in production
    $([ "$ENV_TYPE" == "production" ] && echo "return 301 https://\$server_name\$request_uri;" || echo "# HTTP only for development")

    $([ "$ENV_TYPE" == "development" ] && cat << DEVCONF
    location / {
        proxy_pass http://fluxer_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
DEVCONF
    )
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $GATEWAY_DOMAIN;

    # SSL configuration (add your cert paths)
    # ssl_certificate /etc/ssl/certs/$GATEWAY_DOMAIN.crt;
    # ssl_certificate_key /etc/ssl/private/$GATEWAY_DOMAIN.key;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://fluxer_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    print_success "Generated $NGINX_SITES_DIR/$GATEWAY_DOMAIN.conf"
fi

print_success "Generated domain-specific nginx configs in $NGINX_SITES_DIR"

# Set permissions
chmod 600 "$PROJECT_ROOT/.env"
print_success "Set .env permissions to 600"

# Final summary
echo ""
print_header "Configuration Complete!"
echo ""
print_success "All configuration files have been generated successfully."
echo ""
echo "Files created/updated:"
echo "  - .env"
echo "  - config/config.json"
echo "  - fluxer_devops/nginx/nginx.conf (SNI router for /etc/nginx/nginx.conf)"
echo "  - fluxer_devops/nginx/sites/$BASE_DOMAIN.conf (copy to /etc/nginx/sites-available/)"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
print_warning "IMPORTANT: Review the generated files before starting services."
echo ""
print_warning "Generated secrets (save these securely):"
echo "  - Meilisearch master key: $MEILI_MASTER_KEY"
echo "  - NATS auth token: $NATS_AUTH_TOKEN"
echo "  - Media proxy secret: $MEDIA_PROXY_SECRET"
echo "  - Admin secret key base: $ADMIN_SECRET_KEY_BASE"
echo "  - Gateway admin reload secret: $GATEWAY_ADMIN_RELOAD_SECRET"
echo "  - Sudo mode secret: $SUDO_MODE_SECRET"
echo "  - Connection initiation secret: $CONNECTION_INITIATION_SECRET"
echo ""
print_success "Configuration complete!"

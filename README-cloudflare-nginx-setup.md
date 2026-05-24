# Cloudflare + Nginx + Docker Domain Setup Script

A comprehensive bash script that automates the setup of subdomains with Cloudflare DNS management, SSL certificate generation, Nginx configuration, and Docker Compose service orchestration.

## Features

- **Cloudflare API Integration**: Automatically creates or updates DNS A records
- **SSL Certificate Generation**: Creates self-signed SSL certificates with OpenSSL
- **Nginx Configuration**: Generates optimized nginx configs for subdomain.domain.tld
- **Docker Integration**: Automatically generates .env file with random secrets and ports
- **Docker Compose Management**: Starts Docker services with generated configuration
- **Random Passwords**: Generates secure 32-character hex passwords for SSL keys and other secrets
- **Automatic Reload**: Tests and reloads nginx configuration automatically
- **Security Headers**: Includes modern security headers (HSTS, X-Frame-Options, etc.)
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **HTTP to HTTPS**: Automatic redirect from HTTP to HTTPS
- **No Hardcoded Credentials**: All secrets are randomly generated at runtime

## Prerequisites

- Linux server with sudo access
- Nginx installed
- Cloudflare account with domain configured
- Cloudflare API Token with Zone:DNS and Zone:Zone permissions

### Install Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl jq openssl nginx docker.io docker-compose

# CentOS/RHEL
sudo yum install -y curl jq openssl nginx docker docker-compose
```

## Setup

### 1. Get Cloudflare API Token (Optional)

The script will prompt you for your Cloudflare API token during setup. If you prefer to skip Cloudflare DNS management, use the `--skip-cloudflare` flag.

To get your Cloudflare API token:
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit zone DNS" template or create custom token with:
   - Zone - DNS - Edit
   - Zone - Zone - Read
4. Copy the generated token

### 2. Set Environment Variable (Optional)

You can set the Cloudflare API token as an environment variable to skip the prompt:

```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
```

For persistent usage, add to your `~/.bashrc` or `~/.zshrc`:

```bash
echo 'export CLOUDFLARE_API_TOKEN="your_api_token_here"' >> ~/.bashrc
source ~/.bashrc
```

## Usage

### Basic Usage

```bash
# Single domain (auto multi-subdomain mode)
./cloudflare-nginx-setup.sh <domain>

# Single subdomain
./cloudflare-nginx-setup.sh <subdomain> <domain>
```

**Note:** If only a domain is provided (e.g., `example.com`), the script automatically enables multi-subdomain mode and sets up all standard subdomains (app, static, cdn, api, admin).

### Starting and Stopping Services

After running the setup script, you can easily start and stop services:

```bash
# Start all services
./start.sh

# Stop all services
./stop.sh
```

**What start.sh does:**
- Checks for .env file (required)
- Starts Docker services using docker-compose.simple.yaml with minimal profile
- Starts cloudflared tunnel if configured

**What stop.sh does:**
- Stops cloudflared tunnel if running
- Stops Docker services

### Command-Line Options

The script supports specifying custom ports via command-line arguments. If ports are not specified, the script automatically scans for available ports in the appropriate ranges.

```bash
./cloudflare-nginx-setup.sh <subdomain> <domain> [OPTIONS]
```

**Available Options:**
- `--multi` - Setup all standard subdomains (app, static, cdn, api, admin)
- `--skip-cloudflare` - Skip Cloudflare DNS management (manual DNS required)
- `--tunnel` - Use Cloudflare Tunnel (cloudflared) instead of direct DNS
- `--fluxer-public-port PORT` - Specify FLUXER_PUBLIC_PORT (range: 40000-50000)
- `--fluxer-admin-port PORT` - Specify FLUXER_ADMIN_PORT (range: 40000-50000)
- `--postgres-port PORT` - Specify POSTGRES_PORT (range: 5400-6400)
- `--minio-port PORT` - Specify MINIO_PORT (range: 9000-10000)
- `--ipfs-api-port PORT` - Specify IPFS_API_PORT (range: 5000-6000)
- `--meili-port PORT` - Specify MEILI_PORT (range: 7700-8700)
- `-h, --help` - Show help message

### Port Scanning Behavior

- **Automatic Port Detection**: If no ports are specified, the script scans for free ports in the predefined ranges
- **User-Specified Ports**: If you specify a port, the script checks if it's available
- **Fallback**: If a specified port is in use or out of range, the script automatically finds the next available free port
- **Port Ranges**: Each service has a specific port range to avoid conflicts

### Interactive Prompts

The script will prompt you for:

1. **Cloudflare API Token** (if not set via environment variable or `--skip-cloudflare` flag)
   - Instructions on how to get the token
   - Option to skip Cloudflare DNS management
   - Token validation

2. **SMTP Configuration** (optional)
   - SMTP Host (e.g., smtp.gmail.com)
   - SMTP Port (e.g., 587)
   - SMTP Username
   - SMTP Password
   - SMTP From Address
   - Press Enter to skip if not needed

### Manual DNS Mode

Use the `--skip-cloudflare` flag to skip Cloudflare DNS management:

```bash
./cloudflare-nginx-setup.sh www example.com --skip-cloudflare
```

In manual DNS mode:
- Cloudflare DNS records are not managed
- SSL certificates and nginx configuration are still created
- The script will display the DNS records you need to create manually
- You must create A records pointing to your server IP

**Example output:**
```
IMPORTANT: Create manual DNS A records pointing to your server IP:
   - www.example.com -> 1.2.3.4
```

### Examples

```bash
# Setup all subdomains for example.com (auto multi-subdomain mode)
./cloudflare-nginx-setup.sh example.com

# Setup www.example.com (single subdomain)
./cloudflare-nginx-setup.sh www example.com

# Setup api.example.com with specific ports
./cloudflare-nginx-setup.sh api example.com --fluxer-public-port 45000 --postgres-port 5432

# Setup staging.mysite.com with custom MinIO port
./cloudflare-nginx-setup.sh staging mysite.com --minio-port 9500

# Setup all standard subdomains for example.com (explicit multi)
./cloudflare-nginx-setup.sh www example.com --multi

# Setup with Cloudflare Tunnel (more secure, no open ports)
./cloudflare-nginx-setup.sh example.com --tunnel

# Setup with Cloudflare Tunnel and multi-subdomain
./cloudflare-nginx-setup.sh www example.com --multi --tunnel

# View all available options
./cloudflare-nginx-setup.sh --help
```

### Cloudflare Tunnel Mode

Use the `--tunnel` flag to enable Cloudflare Tunnel (cloudflared) for enhanced security:

```bash
./cloudflare-nginx-setup.sh www example.com --tunnel
```

**Benefits of Cloudflare Tunnel:**
- No need to open ports on your server
- End-to-end encryption
- Automatic SSL termination at Cloudflare edge
- DDoS protection
- No public IP required
- Bypasses NAT/firewall restrictions

**How it works:**
1. Script installs `cloudflared` if not present
2. Creates a Cloudflare Tunnel named `fluxer-tunnel`
3. Sets up systemd service for automatic startup
4. Configures tunnel routes for each subdomain
5. Starts the tunnel service

**Tunnel Configuration:**
- Tunnel config: `/etc/cloudflared/config.yml`
- Credentials: `/etc/cloudflared/<tunnel-id>.json`
- Systemd service: `cloudflared-fluxer.service`
- Auto-starts on boot

**Managing the tunnel:**
```bash
# Check tunnel status
sudo systemctl status cloudflared-fluxer

# View tunnel logs
sudo journalctl -u cloudflared-fluxer -f

# Restart tunnel
sudo systemctl restart cloudflared-fluxer

# Stop tunnel
sudo systemctl stop cloudflared-fluxer
```

### Multi-Subdomain Setup

Use the `--multi` flag to automatically set up all standard subdomains for your domain:

```bash
./cloudflare-nginx-setup.sh <any-subdomain> <domain> --multi
```

**Configured Subdomains:**
- `app.domain.com` - Main application (proxies to FLUXER_PUBLIC_PORT)
- `static.domain.com` - Static files (proxies to port 8082)
- `cdn.domain.com` - CDN/Static files (proxies to port 8082)
- `api.domain.com` - API endpoints (proxies to FLUXER_PUBLIC_PORT)
- `admin.domain.com` - Admin panel (proxies to FLUXER_ADMIN_PORT)

Each subdomain gets:
- Cloudflare DNS A record
- SSL certificate
- Nginx configuration
- Security headers
- HTTP to HTTPS redirect

**Example:**
```bash
./cloudflare-nginx-setup.sh www example.com --multi
```

This will configure:
- https://app.example.com
- https://static.example.com
- https://cdn.example.com
- https://api.example.com
- https://admin.example.com

## What the Script Does

1. **Validates dependencies** (curl, jq, openssl, nginx, docker)
2. **Prompts for Cloudflare API token** (optional, can skip with `--skip-cloudflare` or `--tunnel`)
3. **Prompts for SMTP configuration** (optional)
4. **Sets up configuration files** (config.json, admin-config.json)
5. **Generates all secrets**:
   - PostgreSQL credentials (user, password, database name)
   - MinIO credentials (root user, password)
   - Meilisearch master key
   - OAuth client ID and secret
   - Random ports for all services
6. **Creates .env file** with all generated secrets and ports
7. **Installs cloudflared** (if using `--tunnel` flag)
8. **Creates Cloudflare Tunnel** (if using `--tunnel` flag)
9. **Sets up systemd service** for cloudflared (if using `--tunnel` flag)
10. **Validates Cloudflare API token** (if Cloudflare enabled and not using tunnel)
11. **Gets Zone ID** for your domain from Cloudflare (if Cloudflare enabled and not using tunnel)
12. **Determines server IP** automatically using ifconfig.me
13. **Creates or updates DNS A record** in Cloudflare (if Cloudflare enabled and not using tunnel):
    - Checks existing records
    - If IP changed, deletes old record and creates new one
    - If IP same, keeps existing record
14. **Adds tunnel routes** (if using `--tunnel` flag)
15. **Generates SSL certificates**:
    - 4096-bit RSA private key
    - Self-signed certificate (valid 365 days)
    - DH parameters (2048-bit)
    - All stored in `/etc/nginx/ssl/subdomain.domain.tld/`
16. **Generates nginx configuration**:
    - HTTP to HTTPS redirect
    - SSL/TLS configuration with modern ciphers
    - Security headers
    - Rate limiting
    - Proxy to Docker backend on generated port
    - Health check endpoint
17. **Updates nginx backend port** to match generated Docker port
18. **Enables the site** in nginx
19. **Tests nginx configuration**
20. **Reloads nginx** to apply changes
21. **Starts cloudflared service** (if using `--tunnel` flag)
22. **Starts Docker services** using docker-compose.simple.yaml with minimal profile
23. **Displays service status** and summary with all configured URLs

## Generated Files

### Nginx Configuration
- Path: `/etc/nginx/sites-available/subdomain.domain.tld.conf`
- Symlink: `/etc/nginx/sites-enabled/subdomain.domain.tld.conf`

### SSL Certificates
- Directory: `/etc/nginx/ssl/subdomain.domain.tld/`
- Files:
  - `key.pem` - Private key
  - `cert.pem` - SSL certificate
  - `dhparam.pem` - DH parameters
  - `csr.pem` - Certificate signing request
  - `.credentials` - Generated passwords and secrets

### Docker Configuration
- Path: `.env` in the repository root
- Contains all randomly generated secrets and ports
- Permissions set to 600 (owner read/write only)

### Config Files
- `config/config.json` - Main application configuration
- `config/admin-config.json` - Admin panel configuration
- `data/` - Data directory for SQLite databases
- `dev/` - Development directory

### Logs
- Access log: `/var/log/nginx/subdomain.domain.tld_access.log`
- Error log: `/var/log/nginx/subdomain.domain.tld_error.log`
- Docker logs: View with `docker compose -f docker-compose.simple.yaml logs -f`

## Generated Credentials

The script generates and saves the following random 32-character hex secrets:

### SSL Credentials (saved to `/etc/nginx/ssl/subdomain.domain.tld/.credentials`)
- `SSL_KEY_PASS` - SSL key password
- `BASIC_AUTH_PASS` - Basic authentication password (if needed)
- `UPSTREAM_SECRET` - Secret for upstream communication

### Docker Credentials (saved to `.env` in repository root)
- `POSTGRES_USER` - PostgreSQL username (8-char hex)
- `POSTGRES_PASSWORD` - PostgreSQL password (32-char hex)
- `POSTGRES_DB` - PostgreSQL database name
- `MINIO_ROOT_USER` - MinIO username (8-char hex)
- `MINIO_ROOT_PASSWORD` - MinIO password (32-char hex)
- `MEILI_MASTER_KEY` - Meilisearch master key (32-char hex)
- `OAUTH_CLIENT_ID` - OAuth client ID (16-char hex)
- `OAUTH_CLIENT_SECRET` - OAuth client secret (32-char hex)
- `SMTP_HOST` - SMTP host (if provided during setup)
- `SMTP_PORT` - SMTP port (if provided during setup)
- `SMTP_USER` - SMTP username (if provided during setup)
- `SMTP_PASSWORD` - SMTP password (if provided during setup)
- `SMTP_FROM` - SMTP from address (if provided during setup)

### Generated Ports (saved to `.env`)
- `FLUXER_PUBLIC_PORT` - Random port between 40000-50000
- `FLUXER_ADMIN_PORT` - Random port between 40000-50000
- `POSTGRES_PORT` - Random port between 5400-6400
- `MINIO_PORT` - Random port between 9000-10000
- `MINIO_CONSOLE_PORT` - MINIO_PORT + 1
- `IPFS_SWARM_PORT` - Random port between 4000-5000
- `IPFS_API_PORT` - Random port between 5000-6000
- `IPFS_GATEWAY_PORT` - Random port between 8000-9000
- `MEILI_PORT` - Random port between 7700-8700
- `LIVEKIT_PORT` - Random port between 7800-8800

All credentials are saved with 600 permissions (owner read/write only).

## Backend Configuration

The nginx configuration proxies requests to the Docker backend on the automatically generated `FLUXER_PUBLIC_PORT`. The script automatically updates the nginx configuration to use the correct port.

Docker services are started automatically with the minimal profile using `docker-compose.simple.yaml`.

To view Docker service status:
```bash
docker compose -f docker-compose.simple.yaml ps
```

To view Docker logs:
```bash
docker compose -f docker-compose.simple.yaml logs -f
```

To restart Docker services:
```bash
docker compose -f docker-compose.simple.yaml restart
```

To stop Docker services:
```bash
docker compose -f docker-compose.simple.yaml down
```

## Docker Profiles

The script uses the `minimal` profile by default, which includes:
- valkey (Redis)
- nats (message queue)
- postgres (database)
- minio (object storage)
- ipfs (distributed storage)
- fluxer_app (main application)
- fluxer_admin (admin panel)
- fluxer_app_proxy (static file server)
- fluxer_server (backend server)

To use other profiles, manually run docker-compose:

```bash
# Full profile (includes search and voice services)
docker compose -f docker-compose.simple.yaml --profile full up -d

# Dev profile (development setup)
docker compose -f docker-compose.simple.yaml --profile dev up -d
```

## Security Considerations

### No Hardcoded Credentials

Both `compose.yaml` and `docker-compose.simple.yaml` have been updated to remove all hardcoded credentials and default values. All secrets must be provided via environment variables or the `.env` file.

### Self-Signed Certificates

The script generates self-signed SSL certificates. For production use, consider:

1. **Let's Encrypt** for trusted certificates:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d subdomain.domain.tld
   ```

2. **Cloudflare SSL** (if using Cloudflare proxy):
   - Set SSL/TLS mode to "Full" or "Full (strict)" in Cloudflare dashboard
   - The self-signed cert will work between Cloudflare and your server

### Credentials Security

- Generated credentials are saved with 600 permissions (owner read/write only)
- `.env` file is also protected with 600 permissions
- Consider using a secrets manager for production
- Rotate credentials periodically
- Never commit `.env` to version control

## Troubleshooting

### Permission Denied

If you get permission errors, ensure you have sudo access:

```bash
sudo ./cloudflare-nginx-setup.sh www example.com
```

### Invalid API Token

Verify your Cloudflare API token has the correct permissions:
- Zone - DNS - Edit
- Zone - Zone - Read

### Nginx Test Failed

Check the nginx error log:

```bash
sudo tail -f /var/log/nginx/error.log
```

### DNS Not Propagating

DNS changes may take a few minutes to propagate. Check with:

```bash
dig subdomain.domain.tld
```

## Customization

### Modify Nginx Template

Edit the `generate_nginx_config()` function in the script to customize:
- Upstream configuration
- SSL protocols/ciphers
- Security headers
- Rate limiting rules
- Proxy settings

### Change SSL Directory

Modify the `SSL_DIR` variable at the top of the script:

```bash
SSL_DIR="/etc/nginx/ssl"
```

### Change Nginx Config Directory

Modify the `NGINX_CONF_DIR` variable:

```bash
NGINX_CONF_DIR="/etc/nginx"
```

## Uninstall

To remove a configured subdomain:

```bash
# Remove nginx config
sudo rm /etc/nginx/sites-enabled/subdomain.domain.tld.conf
sudo rm /etc/nginx/sites-available/subdomain.domain.tld.conf

# Remove SSL certificates
sudo rm -rf /etc/nginx/ssl/subdomain.domain.tld

# Remove DNS record from Cloudflare (manual or use API)
# Reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

## License

This script is provided as-is for educational and development purposes.

## Contributing

Feel free to submit issues or pull requests for improvements.

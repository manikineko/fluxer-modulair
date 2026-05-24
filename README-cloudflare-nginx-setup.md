# Cloudflare + Nginx Domain Setup Script

A comprehensive bash script that automates the setup of subdomains with Cloudflare DNS management, SSL certificate generation, and Nginx configuration.

## Features

- **Cloudflare API Integration**: Automatically creates or updates DNS A records
- **SSL Certificate Generation**: Creates self-signed SSL certificates with OpenSSL
- **Nginx Configuration**: Generates optimized nginx configs for subdomain.domain.tld
- **Random Passwords**: Generates secure 32-character hex passwords for SSL keys and other secrets
- **Automatic Reload**: Tests and reloads nginx configuration automatically
- **Security Headers**: Includes modern security headers (HSTS, X-Frame-Options, etc.)
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **HTTP to HTTPS**: Automatic redirect from HTTP to HTTPS

## Prerequisites

- Linux server with sudo access
- Nginx installed
- Cloudflare account with domain configured
- Cloudflare API Token with Zone:DNS and Zone:Zone permissions

### Install Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl jq openssl nginx

# CentOS/RHEL
sudo yum install -y curl jq openssl nginx
```

## Setup

### 1. Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit zone DNS" template or create custom token with:
   - Zone - DNS - Edit
   - Zone - Zone - Read
4. Copy the generated token

### 2. Set Environment Variable

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
./cloudflare-nginx-setup.sh <subdomain> <domain>
```

### Examples

```bash
# Setup www.example.com
./cloudflare-nginx-setup.sh www example.com

# Setup api.example.com
./cloudflare-nginx-setup.sh api example.com

# Setup staging.mysite.com
./cloudflare-nginx-setup.sh staging mysite.com
```

## What the Script Does

1. **Validates dependencies** (curl, jq, openssl, nginx)
2. **Validates Cloudflare API token**
3. **Gets Zone ID** for your domain from Cloudflare
4. **Determines server IP** automatically
5. **Creates or updates DNS A record** in Cloudflare (proxied through Cloudflare)
6. **Generates SSL certificates**:
   - 4096-bit RSA private key
   - Self-signed certificate (valid 365 days)
   - DH parameters (2048-bit)
   - All stored in `/etc/nginx/ssl/subdomain.domain.tld/`
7. **Generates nginx configuration**:
   - HTTP to HTTPS redirect
   - SSL/TLS configuration with modern ciphers
   - Security headers
   - Rate limiting
   - Proxy to backend on port 8080
   - Health check endpoint
8. **Enables the site** in nginx
9. **Tests nginx configuration**
10. **Reloads nginx** to apply changes

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

### Logs
- Access log: `/var/log/nginx/subdomain.domain.tld_access.log`
- Error log: `/var/log/nginx/subdomain.domain.tld_error.log`

## Generated Credentials

The script generates and saves the following random 32-character hex secrets:

- `SSL_KEY_PASS` - SSL key password
- `BASIC_AUTH_PASS` - Basic authentication password (if needed)
- `UPSTREAM_SECRET` - Secret for upstream communication

All credentials are saved to `/etc/nginx/ssl/subdomain.domain.tld/.credentials` with restricted permissions (600).

## Backend Configuration

The nginx configuration proxies requests to a backend server on `127.0.0.1:8080`. Make sure your application is running on this port.

To change the backend port, edit the generated nginx config:

```bash
sudo nano /etc/nginx/sites-available/subdomain.domain.tld.conf
```

Change the upstream server port, then reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Security Considerations

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
- Consider using a secrets manager for production
- Rotate credentials periodically

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

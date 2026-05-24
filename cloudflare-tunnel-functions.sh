# Install cloudflared if not present
install_cloudflared() {
    if command -v cloudflared &> /dev/null; then
        print_success "cloudflared is already installed"
        return
    fi
    
    print_info "Installing cloudflared..."
    
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
        rpm -i cloudflared-linux-x86_64.rpm
        rm cloudflared-linux-x86_64.rpm
    else
        # Generic
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
        mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
        chmod +x /usr/local/bin/cloudflared
    fi
    
    print_success "cloudflared installed"
}

# Create Cloudflare Tunnel
create_tunnel() {
    local domain=$1
    local tunnel_name=$2
    
    print_info "Creating Cloudflare Tunnel: $tunnel_name"
    
    # Create tunnel
    local tunnel_output
    tunnel_output=$(cloudflared tunnel create "$tunnel_name" 2>&1)
    
    if echo "$tunnel_output" | grep -q "error"; then
        print_error "Failed to create tunnel: $tunnel_output"
        exit 1
    fi
    
    local tunnel_id
    tunnel_id=$(echo "$tunnel_output" | grep -oP 'Your tunnel ID is \K[0-9a-f-]+')
    
    print_success "Tunnel created with ID: $tunnel_id"
    
    # Save tunnel config
    local tunnel_config_dir="/etc/cloudflared"
    mkdir -p "$tunnel_config_dir"
    
    cat > /tmp/tunnel-config.yml <<EOF
tunnel: $tunnel_id
credentials-file: $tunnel_config_dir/$tunnel_id.json
EOF
    
    mv /tmp/tunnel-config.yml "$tunnel_config_dir/config.yml"
    
    echo "$tunnel_id"
}

# Add route to tunnel
add_tunnel_route() {
    local tunnel_name=$1
    local subdomain=$2
    local domain=$3
    local backend_port=$4
    local full_domain="${subdomain}.${domain}"
    
    print_info "Adding route: $full_domain -> localhost:$backend_port"
    
    cloudflared tunnel route dns "$tunnel_name" "$full_domain"
    
    # Add ingress rule to config
    local tunnel_config="/etc/cloudflared/config.yml"
    sed -i '/ingest:/a\  - hostname: '"$full_domain"'\n    service: http://localhost:'"$backend_port" "$tunnel_config"
}

# Create systemd service for cloudflared
create_cloudflared_service() {
    local tunnel_name=$1
    
    print_info "Creating systemd service for cloudflared..."
    
    tee /etc/systemd/system/cloudflared-fluxer.service > /dev/null <<EOF
[Unit]
Description=cloudflared Tunnel Service (Fluxer)
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/cloudflared tunnel run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable cloudflared-fluxer
    print_success "cloudflared service created and enabled"
}

# Start cloudflared service
start_cloudflared() {
    print_info "Starting cloudflared service..."
    
    systemctl start cloudflared-fluxer
    
    if systemctl is-active --quiet cloudflared-fluxer; then
        print_success "cloudflared service started"
    else
        print_error "Failed to start cloudflared service"
        exit 1
    fi
}

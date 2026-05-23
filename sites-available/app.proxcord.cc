server {
    server_name app.proxcord.cc;

    # =========================
    # Main App
    # =========================
    location / {
        proxy_pass http://127.0.0.1:49320;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    # =========================
    # Asset Routes
    # =========================

    # All static assets - proxy directly without path manipulation
    location /avatars/ {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /badges/ {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /media/ {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /web/ {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /fonts/ {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location = /favicon-32x32.png {
        proxy_pass http://127.0.0.1:49321;
    }

    location = /apple-touch-icon.png {
        proxy_pass http://127.0.0.1:49321;
    }

    # =========================
    # Logging
    # =========================

    access_log /var/log/nginx/app.proxcord.cc.access.log;
    error_log  /var/log/nginx/app.proxcord.cc.error.log;

    # =========================
    # SSL
    # =========================

    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    ssl_certificate     /etc/letsencrypt/live/api.proxcord.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.proxcord.cc/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Map required for websocket upgrade
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    listen [::]:80;

    server_name app.proxcord.cc;

    return 301 https://$host$request_uri;
}
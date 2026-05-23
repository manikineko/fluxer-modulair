server {
    listen 80;
    server_name maneki-neko.nl www.maneki-neko.nl;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name maneki-neko.nl www.maneki-neko.nl;

    # Corrected root path
    root /var/www/maneki-neko;
    index index.html;

    # SSL (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/maneki-neko.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maneki-neko.nl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # ========================
    # MAIN PUBLIC MEMORIAL SITE
    # ========================
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Special JS
    location /js/ {
        alias /var/www/maneki-neko/js/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # ========================
    # PRIVATE DISCORD MEMORIAL
    # ========================
    location ^~ /discord-memorial/ {
        alias /var/www/maneki-neko/discord-memorial/;
        try_files $uri $uri/ /discord-memorial/index.html;
        add_header X-Robots-Tag "noindex, nofollow" always;
    }

    # Deny hidden files
    location ~ /\. {
        deny all;
    }

    access_log /var/log/nginx/maneki-neko.nl.access.log;
    error_log /var/log/nginx/maneki-neko.nl.error.log warn;
}

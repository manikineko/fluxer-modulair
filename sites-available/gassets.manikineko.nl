server {
    server_name gassets.manikineko.nl;

    # Root directory
    root /var/www/gassets;
    index index.html;

    # Logging (optional but recommended)
    access_log /var/log/nginx/gassets.manikineko.nl.access.log;
    error_log  /var/log/nginx/gassets.manikineko.nl.error.log;

    # Security headers (good defaults)
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # Cache static assets aggressively
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp|avif|mp4|webm)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }

    # Main location - serve files, fallback to 404
    location / {
        try_files $uri $uri/ =404;
    }

    # Disable directory listing
    autoindex off;

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/gassets.manikineko.nl/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/gassets.manikineko.nl/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = gassets.manikineko.nl) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name gassets.manikineko.nl;
    return 404; # managed by Certbot


}
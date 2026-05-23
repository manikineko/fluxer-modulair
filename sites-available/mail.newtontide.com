server {
    if ($host = mail.newtontide.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name mail.newtontide.com autodiscover.newtontide.com autoconfig.newtontide.com mail.manikineko.nl;

    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;


}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mail.newtontide.com autodiscover.newtontide.com autoconfig.newtontide.com;

    # === SSL Configuration ===
    # Option A: Use Certbot / Let's Encrypt (recommended)
    ssl_certificate /etc/letsencrypt/live/mail.newtontide.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mail.newtontide.com/privkey.pem; # managed by Certbot

    # Option B: If you use another cert, point to it here

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Increase limits for large attachments / SOGo
    client_max_body_size 1G;

    # Proxy to Mailcow
    location /Microsoft-Server-ActiveSync {
        proxy_pass http://127.0.0.1:26666/Microsoft-Server-ActiveSync;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 75;
        proxy_send_timeout 3650;
        proxy_read_timeout 3650;
    }

    location / {
        proxy_pass https://127.0.0.1:26566/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_buffers 64 512k;
        proxy_busy_buffers_size 512k;
        proxy_connect_timeout 75;
        proxy_send_timeout 3650;
        proxy_read_timeout 3650;
    }


}

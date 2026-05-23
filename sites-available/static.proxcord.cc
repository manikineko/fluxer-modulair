server {
    server_name static.proxcord.cc;

    location / {
        proxy_pass http://127.0.0.1:49321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/static.proxcord.cc.access.log;
    error_log /var/log/nginx/static.proxcord.cc.error.log;

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.proxcord.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.proxcord.cc/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    listen [::]:80;
    server_name static.proxcord.cc;
    return 301 https://$host$request_uri;
}

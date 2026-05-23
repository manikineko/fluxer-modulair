server {
    server_name proxcord.cc www.proxcord.cc;

    root /var/www/proxcord;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    access_log /var/log/nginx/proxcord.cc.access.log;
    error_log /var/log/nginx/proxcord.cc.error.log;

    listen 443 ssl; # managed by Certbot
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/proxcord.cc/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/proxcord.cc/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = proxcord.cc) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name proxcord.cc www.proxcord.cc;
    return 404; # managed by Certbot


}

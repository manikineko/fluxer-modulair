#!/bin/bash
# Regenerate nginx configs for proxcord.cc
sudo rm /etc/nginx/sites-enabled/*.conf
sudo rm /etc/nginx/sites-available/*.conf
./nginx-config-only.sh proxcord.cc --fluxer-public-port 49319 --fluxer-admin-port 9899

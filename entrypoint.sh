#!/bin/sh

# 将变量注入 nginx.conf
envsubst '$SOP_API_HOST $CHAT_API_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 启动 nginx
nginx -g 'daemon off;'

#!/bin/sh

# 将变量注入 nginx.conf
envsubst '$SOP_API_HOST $CHAT_API_HOST $COMPANY_API_HOST $CHAT_HISTORY_API_HOST $USER_API_HOST $MOBILE_API_HOST $VIDEO_API_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 启动 nginx
nginx -g 'daemon off;'

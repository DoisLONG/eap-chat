FROM registry.cn-hangzhou.aliyuncs.com/jilimoxing/test:node-20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

FROM registry.cn-hangzhou.aliyuncs.com/jilimoxing/test:nginx1192
COPY --from=build /app/dist /usr/share/nginx/html
# COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

COPY --from=build /app/nginx.conf.template /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN sed -i '1s/^\xEF\xBB\xBF//' /entrypoint.sh \
    && sed -i 's/\r$//' /entrypoint.sh \
    && chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


# nvm use 20
# npm i
# npm run dev

#### 镜像构建是在15机器上，容器部署也在15机器上。端口31118

docker run -d -p 35173:80 -e SOP_API_HOST=14.103.223.101:6007 -e CHAT_API_HOST=14.103.223.101:9010 yourname/chatui:1.0
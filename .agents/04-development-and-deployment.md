# 开发与部署指南

## 环境要求

- Node.js 20
- npm
- 可访问当前后端服务的网络环境

仓库已有 `package-lock.json`。常规开发优先使用 `npm ci` 保持依赖版本一致；若要更新依赖再使用 `npm install`。

## 本地启动

```bash
npm ci
npm run dev
```

Vite 默认启动开发服务器。实际端口以终端输出为准。

本地 API 地址不是从 `.env` 读取，而是硬编码在 `vite.config.js` 的 `server.proxy` 中。切换后端环境时应修改代理目标，并避免把仅个人可用的地址提交到共享分支。

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。当前 npm scripts 没有 lint、typecheck 和 test；仅执行 `npm run build` 不能覆盖所有运行时业务分支。

建议在交付前至少手动验证：

1. 未登录访问业务页会跳到登录页；
2. 登录后能够加载管理端和侧栏；
3. 管理端与用户端 iframe 可切换；
4. 本次改动涉及的列表、抽屉、分页和异常提示正常；
5. 页面刷新不会出现 Nginx 404；
6. 非 superadmin 无法看到或打开模型配置。

## 开发代理

开发代理位于 `vite.config.js`。新增服务时需要：

1. 在 `server.proxy` 添加前缀；
2. 在 `src/services/` 新建或扩展对应 API 封装；
3. 在 `nginx.conf.template` 添加生产代理；
4. 如目标可配置，在 `entrypoint.sh` 的 `envsubst` 白名单中加入变量；
5. 在容器运行环境传入对应变量。

注意：Vite 的 `/monitor-api` 和 `/api-153` 代理目前并未配置，而生产 Nginx 已有对应 location；相关页面在本地开发时可能需要补充代理。

## 容器部署

Dockerfile 分两阶段：

1. Node 20 Alpine 安装依赖并执行 `npm run build`；
2. 将 `dist/` 复制到 Nginx 镜像。

容器启动时，`entrypoint.sh` 使用环境变量渲染 `nginx.conf.template`。

可配置变量包括：

- `SOP_API_HOST`
- `CHAT_API_HOST`
- `COMPANY_API_HOST`
- `CHAT_HISTORY_API_HOST`
- `USER_API_HOST`
- `MOBILE_API_HOST`
- `DASHBOARD_API_HOST`
- `VIDEO_API_HOST`
- `VIDEO_API_HOST_V2`

变量值应是 `host:port`，模板会自行补充 `http://`。

`docker.env` 当前是未被 Git 跟踪的本地文件。除非团队明确要求，不要自动提交它；部署地址或凭据应通过部署系统注入。

## Nginx 路由要求

- `/` 必须回退到 `/index.html`，以支持 Vue Router History 模式；
- `/eap` 必须回退到 `/eap/index.html`，用于用户端静态应用；
- 静态资源 location 不应抢先拦截不存在的 SPA 路由；
- 长连接或大文件相关代理需保留模板中的超时和上传体积设置。

## 新增页面的最小清单

1. 在 `src/pages/` 创建页面；
2. 在 `src/router/index.js` 注册路由；
3. 若出现在侧栏，在 `src/stores/modules/auth.ts` 同步菜单节点；
4. 在三份语言文件中补齐菜单和页面文案；
5. 如需缓存，正确设置 `meta.isKeepAlive` 并验证组件名；
6. 如需接口，在对应 service 中添加方法；
7. 验证登录守卫、面包屑、侧栏高亮和刷新行为。

## 修改接口的最小清单

1. 确认接口属于哪个服务前缀；
2. 保持请求参数命名转换一致，例如部分列表把 `pageNum/pageSize` 转成 `page/page_size`；
3. 确认是否需要 Bearer token；
4. 对上传和长任务选择合理超时；
5. 对 401、业务状态码和网络异常分别验证；
6. 如新增后端主机，同步开发代理和生产代理。

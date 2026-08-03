# 开发环境与运行方式

## 项目与依赖

- `eap-chat` 是 Vue 管理端单页应用；不是后端仓库，也没有本仓库内的数据库迁移或服务端启动命令。
- 当前清单使用 Vue 3、Vite 7、Vue Router 4、Pinia 3、Element Plus、Axios、Vue I18n、Sass；同时保留少量 TypeScript 文件与 `tsconfig.json`。
- 使用 npm 和 `package-lock.json`（lockfile v3）。`package.json` 未声明本地 Node 版本；Docker 构建镜像使用 Node 20。
- `src/main.js` 创建 Vue 应用并注册 Router、Element Plus、Pinia 与 I18n；`@` 映射到 `src`。

## 主要目录

```text
src/            Vue 页面、组件、路由、状态、服务封装和样式
public/         静态资源；其中 public/eap 是另一套静态站点资源
reference-ui/   仅供界面参考，不能覆盖或作为正式数据源
.agents/        本项目协作说明
```

根目录的 `Dockerfile`、`nginx.conf.template` 和 `entrypoint.sh` 是镜像构建与运行时代理配置；`docker.env`、`docker.local.env` 均为本地运行时环境文件，不得提交其值。

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run preview
```

以上是 `package.json` 中现有的全部脚本。未发现 `test`、`lint` 或 `format` 脚本，也未发现 ESLint、Prettier、CI 或 Docker Compose 配置；不要虚构对应命令。按根目录 `AGENTS.md`，验证命令由用户执行，Codex 不主动运行构建、测试或容器操作。

## Docker、Nginx 与环境变量

- Dockerfile 是 Node 构建 + Nginx 运行时的两阶段镜像；构建输出为 `dist`，Nginx 从 `/usr/share/nginx/html` 提供静态 SPA。
- Docker 实际复制 `nginx.conf.template` 和 `entrypoint.sh`。启动脚本以 `envsubst` 生成 Nginx 配置，因此修改代理必须同时核对模板、脚本和调用前缀。
- 模板代理的变量名为 `SOP_API_HOST`、`EXAM_API_HOST`、`CHAT_API_HOST`、`COMPANY_API_HOST`、`CHAT_HISTORY_API_HOST`、`USER_API_HOST`、`DASHBOARD_API_HOST`、`MOBILE_API_HOST`、`VIDEO_API_HOST` 与 `VIDEO_API_HOST_V2`。只记录变量名和安全占位值，绝不写入地址、密码、Token 或密钥。
- 未发现 Compose 文件；不要根据本机容器、日志或环境文件推断其他环境的端口、启动命令或部署拓扑。

## 开发约定

- 保持现有 Vue SFC、`<script setup>`、Element Plus、Pinia、Vue Router、Vue I18n 与 `@` 导入模式；页面可见文案沿用 `src/languages/modules/{zh,en,th}.ts` 的现有结构。
- API 调用放在 `src/services/`；保留各服务现有的 Axios 实例、鉴权头和 401 处理，不在页面硬编码后端地址。
- 修改菜单时同时核对 `src/stores/modules/auth.ts`、`src/router/index.js` 和对应 i18n 键；修改页面接口时同时核对服务封装、Vite 开发代理和 Nginx 运行时代理。
- 先检查调用方和相邻模块，只改任务直接相关文件；不覆盖用户改动、不臆测接口或数据模型、不为未确认需求重构或新增依赖。

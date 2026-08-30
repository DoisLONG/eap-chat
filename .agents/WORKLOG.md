# 本次工作记录

## 创建的文档

- `AGENTS.md`
- `.agents/DEVELOPMENT.md`
- `.agents/ARCHITECTURE.md`
- `.agents/ROUTE_API_MAP.md`
- `.agents/MIGRATION_PLAN.md`
- `.agents/DECISIONS.md`
- `.agents/TODO.md`
- `.agents/WORKLOG.md`
- `.agents/HANDOFF.md`
- `.agents/ACCEPTANCE_CHECKLIST.md`

## 只读分析

- 以 Python 递归扫描项目（排除 `.git`、依赖、构建、缓存、日志及大文件），定位 Docker、环境、Nginx、入口、路由、菜单、服务、页面和本地参考文件。
- 阅读：`Dockerfile`、`docker.env`、两个入口脚本、三个 Nginx 配置、`package.json`、`vite.config.js`、README、应用入口、路由、菜单/布局/权限 store、练习页及子组件、SOP/公司/聊天/仪表盘服务、考试残留页和参考 HTML/脚本。
- 搜索关键词：培训中心、练习管理、练习、考试管理、考试、资料管理、题库管理、评价管理、岗位管理、系统管理、training、practice、exercise、exam、quiz、question、menu、router、route、permission，以及全部 `docker.env` 变量名。
- 执行的只读 Docker 命令：`docker ps -a`、`docker inspect eap-chat`、`docker image inspect eap-chat:local`。

## 已确认结论

- Vue 3 + Vite + Element Plus 管理端；Dockerfile 两阶段构建，Nginx 静态托管。
- 无 Docker Compose 配置；当前 `eap-chat` 容器由 `eap-chat:local` 运行，宿主 `8080` 映射容器 `80`。
- 培训中心/练习管理菜单和路由均为前端静态配置；当前练习页为 `LicenseAdmin.vue`，主要使用 SOP/QA 接口。
- 找到参考文件：`reference-ui/管理端-练习.html`、`reference-ui/管理端-考试.html`、`reference-ui/category-filter.js`。

## 仍待确认

- `docker.env` 的实际外部加载方式；练习/考试的正式后端模型、分类源、权限码和菜单数据库需求。

## 未做的修改

- 未修改任何正式练习管理页面、未新增正式考试管理页面。
- 未修改 Docker、`docker.env`、数据库或迁移。
- 未运行构建、测试、Compose、容器生命周期或镜像操作。


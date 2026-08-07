# 项目理解文档

本目录用于帮助开发者或 AI 编码助手快速理解 `eap-chat`。内容依据当前代码整理，重点描述“项目是什么、代码在哪里、请求怎么走、改动时要注意什么”。

## 建议阅读顺序

1. [01-project-overview.md](./01-project-overview.md)：先了解产品定位、技术栈和目录职责。
2. [02-architecture.md](./02-architecture.md)：理解应用入口、路由、状态、接口代理和部署结构。
3. [03-module-map.md](./03-module-map.md)：按业务功能定位页面、组件与服务文件。
4. [04-development-and-deployment.md](./04-development-and-deployment.md)：本地运行、构建和容器部署。
5. [05-workflows-and-gotchas.md](./05-workflows-and-gotchas.md)：核心业务流程与已知注意事项。

## 一分钟速览

- 这是一个企业培训与知识管理后台，包含仪表盘、素材库、课程/学习管理、练习考试、组织权限和大模型配置。
- 前端使用 Vue 3、Vite、Element Plus、Pinia、Vue Router 和 Vue I18n。
- 管理端源码位于 `src/`；`public/eap/` 是随项目部署的用户端 H5 编译产物，当前仓库中没有它的源码。
- 浏览器请求统一使用 `/userapi`、`/companyapi`、`/mobileapi` 等路径前缀，再由 Vite（开发）或 Nginx（生产）转发到不同后端。
- 登录 token 保存在 `localStorage.token`，多数服务会自动附加 `Authorization: Bearer <token>`。
- 路由表和侧栏菜单分别维护在 `src/router/index.js` 与 `src/stores/modules/auth.ts`，新增管理页通常需要同步修改两处。
- 模型配置菜单和路由只允许用户名为 `superadmin` 的用户访问。
- 推荐使用 Node.js 20；当前项目只有 `dev`、`build`、`preview` 三个 npm 脚本，没有自动化测试和 lint 脚本。

## 文档维护约定

当以下内容发生变化时，请同步更新本目录：

- 新增或删除一级业务模块；
- 修改路由、菜单权限或登录流程；
- 新增后端服务前缀或部署环境变量；
- 调整课程解析、考试对话等核心业务链路；
- 用户端 H5 的集成方式发生变化。

> 文档只描述结构和行为，不应复制 token、API 密钥、密码或生产环境凭据。

# 架构与调用关系

## 应用骨架

```text
src/main.js
  -> App.vue
  -> router/index.js
  -> layouts/ + stores/modules/auth.ts
  -> pages/ + components/ + services/
```

- 路由在 `src/router/index.js` 静态注册；除 `/login` 外，路由守卫要求本地 `token`。`/system/modelSetting` 额外限制为当前用户 `superadmin`。
- 左侧菜单来自 `src/stores/modules/auth.ts` 的静态 `authMenuList`，由布局组件渲染；菜单和路由是两份配置，新增或修改入口必须同步检查二者。
- 路由及菜单文案使用 `src/languages/modules/zh.ts`、`en.ts`、`th.ts`。未确认动态菜单、后端权限码或 `v-auth` 指令的注册来源，不能据此设计权限逻辑。

## 主要模块

| 路径 | 职责 |
| --- | --- |
| `src/pages/dashboard/` | 仪表盘及统计组件 |
| `src/pages/knowledgeManagement/` | 素材库 |
| `src/pages/courseManagement/` | 学习管理 |
| `src/pages/LicenseAdmin.vue`、`src/pages/practiceReview/` | 练习/SOP 列表、生成和题目复核 |
| `src/pages/examManagement/` | 考试管理列表、表单、来源选择、规则与预览 |
| `src/pages/*Management/` | 用户、公司、部门、岗位和模型配置管理 |
| `src/services/` | 按浏览器代理前缀划分的 Axios/API 封装 |
| `src/components/ProTable/` | 列表分页等复用组件 |
| `reference-ui/` | 原型参考，不能迁入正式页面或作为真实数据 |

## 关键调用链

- 练习：`/trainingCenter/practiceManagement` → `LicenseAdmin.vue` / `practiceReview` → `sop.api.js` → `/sop-api`。
- 考试管理：`/trainingCenter/examManagement` → `examManagement/` 组件 → `exam.api.js` → `/exam-api`；题目来源和分类树复用 `sop.api.js` 的 SOP 接口。
- 课程、素材：页面 → `mobile.service.js` → `/mobileapi`；组织和模型配置：页面 → `company.service.js` → `/companyapi`；登录/用户：页面 → `user.service.js` → `/userapi`。
- 浏览器请求先经 Vite 开发代理或 Nginx 模板；模板使用同名前缀转发到运行时环境变量。开发代理目标仅适用于本地开发，不能复制到部署配置。

## 接口与数据边界

- 各 `src/services/*.js` 自行创建 Axios 实例，统一从 `localStorage` 读取 token 并在 401 时清理登录态。扩展接口应使用正确的现有服务实例，而非新建通用客户端或硬编码主机。
- `exam.api.js` 以 `sopApi` 的拦截器为基础，将请求 `baseURL` 改为 `/exam-api`，并要求考试服务响应的 `code === 0`。变更考试响应适配时，先核对所有调用组件。
- 本仓库只证明前端请求路径和代理配置；后端路由、数据库表、权限和生产部署值需要在对应服务/环境中单独确认。不得把参考 UI、历史文档或前端字段当成后端契约。
- 本仓库没有数据库迁移文件。数据库、外部服务、容器与部署环境的变更必须在用户明确授权且目标环境确定后进行。

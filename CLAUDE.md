# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

`eap-chat` 是企业培训平台的 Web 前端（`package.json` 中的旧名 `dap-license-frontend` 可忽略）。Vue 3.5 + Vite 7 + Element Plus + Pinia 3 + Vue Router 4，支持中/英/泰三语。包含三块前端面：

- **管理端**：组织、用户、课程、素材、练习/考试、仪表盘、模型配置
- **用户端 H5**：`public/eap/` 下编译产物，管理端通过 iframe 打开
- **Web 用户端**：`/web/*` 路由（`src/layouts/webUser/`），独立于管理端布局

**项目知识库在 `.agents/`**：编号文档 `01-project-overview.md`～`05-workflows-and-gotchas.md` 是项目理解基线，另有 `DEVELOPMENT.md`、`ARCHITECTURE.md`、`DECISIONS.md`、`TODO.md`、`HANDOFF.md`、`WORKLOG.md`、`ROUTE_API_MAP.md` 等协作记录。开始任何任务前先读相关部分；详细内容以这些文档为准，本文件只做索引和要点提炼。

## 常用命令

```bash
nvm use 20        # Node 20（Docker 构建镜像也是 20）
npm ci            # 常规开发用 ci 保持 lockfile 一致；要升级依赖才用 npm install
npm run dev       # Vite 开发服务器
npm run build     # 构建到 dist/
npm run preview   # 预览构建产物
```

**没有 lint、typecheck、test 脚本，也没有 CI 配置——不要虚构这些命令。** 按项目协作规则，构建/测试/容器操作由用户执行（见下方协作规则），改动后列出待用户验证的事项。

## 架构要点

### 启动链路与鉴权

`src/main.js` → `App.vue`（注册 Router / Element Plus / Pinia / I18n）。`App.vue` 会从 URL 读取 `token` 和 `lang`：token 写入 `localStorage.token`，lang 覆盖浏览器默认语言。

- 路由守卫只检查 `localStorage.token` 是否存在，不主动验证；token 有效性靠后端返回 401。
- 大多数 `src/services/*.js` 自带 Axios 实例：请求加 `Authorization: Bearer <token>`，收到 401 清 token 并跳 `/login`。**鉴权逻辑在多个 service 中重复复制**，改鉴权行为必须全局搜索所有 Axios 实例和原生 `fetch`。
- 模型配置权限是硬编码 `userInfo.name === "superadmin"`，不是通用角色模型。

### 路由、菜单、i18n 三件套

- 页面路由：`src/router/index.js`（静态注册，`createWebHistory()`）
- 侧栏菜单：`src/stores/modules/auth.ts` 的 `authMenuList`（静态数据）
- 文案：`src/languages/modules/{zh,en,th}.ts`，菜单用 `meta.i18nKey`

**菜单和路由是两份独立配置**，只改一个会出现"能访问但菜单不显示"或"菜单存在但页面未注册"。新增侧栏页面必须同时更新路由表、`authMenuList`、三份语言文件，需要缓存时正确设置 `meta.isKeepAlive`。

### 网络层：双份代理配置

浏览器不直接访问后端主机，而是请求同源前缀，由两层代理转发（**两份配置独立维护，会漂移，排查"开发正常生产失败"时先对比**）：

| 前缀 | service | 业务 |
| --- | --- | --- |
| `/userapi` | `user.service.js` | 登录、用户、角色 |
| `/companyapi` | `company.service.js` | 公司、部门、岗位、模型配置 |
| `/mobileapi` | `mobile.service.js` | 课程、素材、OSS |
| `/sop-api` | `sop.api.js` | SOP、QA 生成 |
| `/chatapi` | `chat.service.js` | 考试会话；**流式回答用原生 `fetch`**，不经过 Axios |
| `/exam-api` | `exam.api.js` | 考试管理（基于 `sopApi` 拦截器改 baseURL，响应要求 `code === 0`） |
| `/dashboardapi` / `/videoapi` / `/videoapiv2` / `/monitor-api` / `/api-153` 等 | 对应 service | 各自业务 |

- 开发代理：`vite.config.js` 的 `server.proxy`，目标硬编码在文件里（注意有"四会"环境的注释行）
- 生产代理：`nginx.conf.template`，由 `entrypoint.sh` 用环境变量（`*_API_HOST`，值为 `host:port`）经 `envsubst` 渲染
- 新增服务前缀时：开发代理 + `src/services/` 封装 + nginx 模板 + entrypoint 变量白名单，四处同步
- `/` 必须 `try_files` 回退 `/index.html`（History 路由）；`/eap` 回退 `/eap/index.html`（hash 路由）

### 关键业务流程

- **管理端/用户端切换**：`src/layouts/LayoutVertical/index.vue`，`activeDuan` 存 `localStorage`，用户端走 iframe `/eap/#/?token=...&lang=...`。本地开发时 iframe 指向代码中写死的远程 5174 地址（`setIframeUrl()`），联调 H5 时先检查它。
- **课程创建**：`src/pages/courseManagement/components/operateDrawer.vue`（约 50 KB 的大组件）：上传 OSS → 建 ASR job → 每 10 秒轮询 → 取识别结果 → 建 Excel job → 取结果 → 建课程。ASR/Excel 超时 10 分钟；轮询定时器要随组件卸载清理；新建/编辑共用此组件，状态重置必须完整。
- **练习/考试**：`SopPicker.vue`（选 SOP 或岗位混合出题）→ `ChatExam.vue`（流式回答 + 讯飞 ASR/TTS 录音）。`ChatExam.vue` 是独立全屏页，不在管理端布局内。
- **列表页模式**：`index.vue` + `ProTable`/`SearchForm` + `components/operateDrawer.vue`，通用能力在 `src/components/ProTable/` 和 `src/hooks/useTable.ts`。

## 结构性注意事项

1. **`public/eap/` 是编译产物**：压缩后的 JS/CSS 和播放器依赖，不直接改；用户端业务变更在源项目构建后整体替换。
2. **`reference-ui/` 只作界面参考**：不得用它覆盖正式页面，也不能当真实数据源。
3. **`src/services/xfyunAsr.js` 和 `xfyunTts.js` 含客户端可读取的第三方鉴权配置**：文档、日志、提交中不要复制这些值；正式环境应迁移到后端签名/代理。
4. **旧页面与未接入模块并存**：`LicenseRegister.vue`、`MonitorOverview.vue`、`testCenter/`、`config/menus.js`、`chatHistory.service.js` 不在当前主链路。判断代码是否生效，先从 `router/index.js` 和页面 import 链确认，不要臆测。
5. **混合 JS/TS**：入口和 service 是 `.js`，stores 和部分页面是 `.ts`；`tsconfig.json` 排除了 `.js` 文件。
6. **本仓库只是前端**：不包含后端路由、数据库迁移、权限规则，前端字段和代理配置不构成后端契约；涉及后端/部署的变更须用户明确授权后再动。
7. 根目录有约 1.9 GB 的 `maidalun-embedding-cache.tgz`，是数据文件，不要处理。`docker.env` / `docker.local.env` 是本地环境文件，未跟踪，不要提交其值。

## 协作规则（来自根目录 AGENTS.md）

1. 开始任务前先读 `.agents` 下相关文档（`DEVELOPMENT.md`、`ARCHITECTURE.md`、`DECISIONS.md`、`TODO.md`、`HANDOFF.md`）。
2. 修改代码后更新 `.agents/WORKLOG.md`；重要设计/技术决策更新 `DECISIONS.md`；未完成事项更新 `TODO.md`；会话交接更新 `HANDOFF.md`。
3. 禁止 PowerShell 脚本；文件搜索、目录分析、批量处理优先用 Python 脚本。
4. **所有测试、构建、容器操作由用户执行**，不要主动运行前端构建、启动/停止/重建容器。
5. 修改范围严格限制在当前任务；未确认菜单、路由、接口和数据结构前不进行大规模重构。
6. 不允许用参考 HTML 直接覆盖正式框架页面；正式实现必须沿用现有 Vue、Element Plus、路由、菜单、权限和接口封装体系。
7. 修改完成后列出：修改文件、修改内容、待验证事项。

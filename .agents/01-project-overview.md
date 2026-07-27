# 项目概览

## 项目定位

`eap-chat` 是一个面向企业培训场景的 Web 前端。管理人员可维护组织、用户、培训素材和课程，查看学习数据，并配置模型；学习者可通过内嵌的 H5 用户端学习课程，也可进入 SOP 练习/考试页面进行文本或语音交互。

仓库虽然在 `package.json` 中仍使用早期名称 `dap-license-frontend`，但当前代码的实际业务已经扩展为完整的 EAP 培训平台。

## 主要能力

| 领域 | 能力 |
| --- | --- |
| 身份与权限 | 用户登录、token 鉴权、用户/角色管理、公司/部门/岗位管理 |
| 数据看板 | 总览、学习热力图、部门完成率、成绩排行、公告、任务看板、资源统计 |
| 知识库 | 素材上传、查询、编辑、删除、关联课程 |
| 培训中心 | 课程创建与编辑、视频语音识别、Excel 结果生成、学习任务管理 |
| 练习考试 | SOP 选择、岗位混合出题、流式问答、语音识别与语音合成 |
| 系统配置 | 模型配置列表、详情编辑、连通性测试 |
| 双端展示 | 管理端 Vue 应用 + 内嵌的用户端 H5 静态应用 |
| 多语言 | 简体中文、英文、泰文 |

## 技术栈

| 分类 | 方案 |
| --- | --- |
| 框架 | Vue 3.5，主要使用 Composition API 和 `<script setup>` |
| 构建 | Vite 7，Node.js 20 |
| UI | Element Plus 2.10 |
| 状态 | Pinia 3 + `pinia-plugin-persistedstate` |
| 路由 | Vue Router 4，HTML5 History 模式 |
| 国际化 | Vue I18n 11，支持 `zh` / `en` / `th` |
| 网络 | Axios；考试流式回答使用原生 `fetch` |
| 图表 | ECharts 6 |
| 文档预览 | `@vue-office/docx`、`excel`、`pdf`、`pptx` |
| 富文本 | `marked` + `highlight.js` |
| 样式 | SCSS + CSS 变量 |
| 部署 | 多阶段 Docker 构建 + Nginx 反向代理 |

## 顶层目录

```text
eap-chat/
├─ .agents/                 # 项目理解文档
├─ public/
│  ├─ eap/                  # 用户端 H5 编译产物
│  └─ *.png                 # 管理端公共品牌资源
├─ src/
│  ├─ assets/               # 由构建系统处理的图片等资源
│  ├─ components/           # 可复用业务/基础组件
│  ├─ config/               # 菜单常量、进度条、全局常量
│  ├─ hooks/                # 表格、选择、主题等组合式函数
│  ├─ languages/            # 中/英/泰翻译
│  ├─ layouts/              # 管理端壳层、侧栏、头部、页签
│  ├─ pages/                # 路由页面和页面私有组件
│  ├─ router/               # 静态路由与全局守卫
│  ├─ services/             # 各后端服务的 API 封装
│  ├─ stores/               # Pinia 状态
│  ├─ styles/               # 全局样式与主题
│  ├─ typings/              # TypeScript 全局类型
│  ├─ utils/                # 通用工具
│  ├─ App.vue
│  └─ main.js
├─ Dockerfile
├─ entrypoint.sh            # 容器启动时生成 Nginx 配置
├─ nginx.conf.template      # 生产反向代理模板
├─ vite.config.js           # 本地开发代理
└─ package.json
```

## 代码风格现状

- 项目同时包含 JavaScript 与 TypeScript；入口和多数 service 是 `.js`，stores 与部分 Vue 页面使用 TypeScript。
- `tsconfig.json` 启用了 `strict`，但关闭了 `noImplicitAny`，并排除了所有 `.js` 文件。
- 页面常采用“列表页 + 抽屉组件”的结构，例如用户、公司、部门、岗位、课程和素材管理。
- 通用表格能力位于 `src/components/ProTable` 与 `src/hooks/useTable.ts`。
- 当前没有统一的 Axios 实例；多个 service 文件各自复制了 token 和 401 处理逻辑。
- 当前没有 ESLint、Prettier、单元测试或端到端测试配置。

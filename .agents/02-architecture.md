# 架构与数据流

## 应用启动链路

```text
index.html
  → src/main.js
    → 注册 Vue Router
    → 注册 Element Plus 与全部图标
    → 注册 Pinia（含持久化插件）
    → 注册 Vue I18n
    → 挂载 src/App.vue
      → 初始化主题和语言
      → 渲染当前路由
```

`src/App.vue` 还会读取 URL 中的 `token` 和 `lang`：

- `token` 写入 `localStorage.token`；
- `lang` 覆盖浏览器默认语言，并写入全局 store；
- Element Plus 的组件语言会随 `zh`、`en`、`th` 切换。

## 页面和布局

路由使用 `createWebHistory()`。

### 独立页面

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/login` | `src/pages/Login.vue` | 唯一标记为 `meta.public` 的页面 |
| `/chat/sop` | `src/pages/SopPicker.vue` | SOP 选择与混合出题入口 |
| `/chat/exam` | `src/pages/ChatExam.vue` | 练习/考试对话 |
| `/h5Preview` | `src/pages/h5Preview/index.vue` | H5 预览 |

除 `/login` 外，上述页面仍会经过 token 守卫。

### 管理端页面

`/` 下的页面使用 `src/layouts/LayoutVertical/index.vue`。这个布局包含两个工作区：

1. 管理端：侧栏菜单、头部、面包屑和主内容区域；
2. 用户端：在 iframe 中打开 `/eap/#/?token=...&lang=...`。

本地开发时，用户端 iframe 指向代码中指定的远程 5174 地址；生产环境使用当前站点的 `/eap/`。

## 路由、菜单与权限

- 实际页面路由：`src/router/index.js`。
- 左侧菜单数据：`src/stores/modules/auth.ts`。
- 菜单工具函数：`src/utils/index.ts`。
- 路由守卫只检查 `localStorage.token` 是否存在，不主动验证 token。
- `src/services/*.js` 中的多数 Axios 实例在收到 401 后删除 token，并跳转 `/login`。
- 模型配置使用硬编码规则：`userStore.userInfo.name === "superadmin"`。
- 菜单过滤和路由守卫各自执行一次 superadmin 检查。

新增一个显示在侧栏中的页面时，通常需要同时更新路由表和 `authMenuList`，并在语言文件中补充 `i18nKey`。

## 状态管理

| Store | 持久化 | 职责 |
| --- | --- | --- |
| `sopai-user` | 是 | `token` 字段和 `userInfo`；实际鉴权主要读取 `localStorage.token` |
| `sopai-global` | 是 | 语言、主题色、侧栏折叠、面包屑、页签等 UI 设置 |
| `sopai-auth` | 否 | 静态菜单、可见菜单、扁平菜单和面包屑 |
| `sopai-tabs` | 否 | 已访问页签 |
| `sopai-keepAlive` | 否 | 需要缓存的路由组件名 |

持久化实现位于 `src/stores/helper/persist.ts`。

## 网络层

浏览器不直接使用部署环境的后端主机，而是访问同源前缀：

| 前缀 | Service | 业务 |
| --- | --- | --- |
| `/userapi` | `user.service.js` | 登录、用户、角色、引导配置 |
| `/companyapi` | `company.service.js` | 公司、部门、岗位、模型配置 |
| `/mobileapi` | `mobile.service.js` | 课程、素材、OSS |
| `/sop-api` | `sop.api.js` | SOP、QA 生成、任务状态、组织级联 |
| `/chatapi` | `chat.service.js` | 考试会话与流式回答 |
| `/chathistoryapi` | `chatHistory.service.js` | 会话记录 |
| `/dashboardapi` | `dashboard.service.js` | 仪表盘统计 |
| `/videoapi` | `video.service.js` | 视频 ASR 解析任务 |
| `/videoapiv2` | `videov2.service.js` | Excel 结果生成 |
| `/monitor-api` | `monitor.service.js` | 监控目标、联系人、订阅、告警 |
| `/api-153` | `license.service.js` | License 相关旧接口 |

开发环境由 `vite.config.js` 转发；生产环境由 `nginx.conf.template` 转发。两份配置不是自动同步的，新增前缀时必须同时维护。

## 请求鉴权

除少数旧接口外，大多数 service 的请求拦截器会执行：

```text
localStorage.token
  → Authorization: Bearer <token>
```

收到 HTTP 401 时会删除 token、提示登录失效，并通过 `window.location.href` 返回登录页。

考试回答接口使用原生 `fetch`，用于处理流式返回；它单独拼接 Authorization 请求头。

## 构建与部署

```text
源码
  → Node 20 镜像执行 npm install / npm run build
  → dist/
  → 复制到 Nginx 镜像
  → entrypoint.sh 使用环境变量渲染 nginx.conf.template
  → Nginx 提供 SPA、/eap 静态资源和 API 反向代理
```

管理端使用 History 路由，因此 Nginx 的 `/` location 通过 `try_files ... /index.html` 处理刷新回退。用户端 H5 使用 hash 路由，并由 `/eap` location 提供静态资源。

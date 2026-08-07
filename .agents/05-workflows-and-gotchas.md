# 核心流程与注意事项

## 登录与会话

```text
Login.vue
  → POST /userapi/v1/auth/login
  → localStorage.token = token
  → userStore.userInfo = 用户信息（持久化）
  → 返回 redirect 或默认业务页
  → 路由守卫检查 token
  → service 请求附加 Bearer token
```

注意：

- `userStore` 自身也定义了 `token`，但登录页面只直接写 `localStorage.token`，实际存在两套 token 表达。
- 路由守卫只判断 token 是否存在；有效性依赖后端返回 401。
- 退出或 401 后应同时考虑持久化的用户信息是否需要清理。
- 模型配置权限依赖持久化的 `userInfo.name`，不是通用角色/权限模型。
- 登录页的默认回跳地址目前是 `/license/admin`，该路径未在当前路由表注册，最终会被兜底路由转到 `/dashboard`。

## 管理端与用户端切换

`LayoutVertical/index.vue` 使用 `activeDuan` 在管理端和用户端之间切换：

- 当前端保存在 `localStorage.activeDuan`；
- 用户端通过 iframe 打开 `/eap/#/`；
- token 和语言通过 URL 参数传入；
- `App.vue` 能接收 URL 中的 token/lang；
- 用户首次进入时会调用用户配置接口展示管理端引导。

本地运行时用户端不是来自 `public/eap/`，而是指向代码内的远程开发地址。若本地联调 H5，先检查 `setIframeUrl()`。

## 课程创建与视频解析

核心逻辑在 `courseManagement/components/operateDrawer.vue`：

```text
填写课程和组织范围
  → 上传视频/素材到 OSS
  → 创建 ASR job
  → 每 10 秒轮询 job 状态
  → 获取识别结果
  → 创建 Excel job
  → 获取 Excel 结果
  → 创建或更新课程
```

注意：

- ASR 和 Excel 服务的请求超时为 10 分钟；
- 轮询使用定时器，关闭抽屉或卸载组件时应避免遗留轮询；
- 创建和编辑共用一个大型组件，状态重置必须完整；
- 后端返回字段和页面表单之间存在多处手工映射，改字段时要同时检查提交与回显。

## 资料管理

```text
资料列表
  → 新增/编辑居中弹窗
  → 选择产品/运营/技术及联动的细分方向
  → 上传文件至 /mobileapi/api/v1/materials/upload
  → category / sub_category 随表单提交
  → OfficeViewer/officeCheck 预览
```

弹窗只保留资料名称、所属类别、细分方向、资料描述和文件，不再提供课程、公司、部门或岗位选择。列表删除支持单个和批量；批量删除通过 `Promise.all` 并发执行多个单条删除请求。

## SOP 练习与考试

```text
SopPicker
  → 单个 SOP，携带 sopId/sopName
  或岗位混合出题，携带 position_id
  → ChatExam
  → 开始考试/获取题目
  → fetch 流式回答
  → 可选浏览器录音 + 讯飞 ASR
  → 可选讯飞 TTS 播放回答
  → 离开或结束时完成会话
```

`ChatExam.vue` 逻辑和样式较大。修改时至少覆盖文本输入、录音、播放、流式中断、正常结束和页面离开。

## 国际化

- 全局语言持久化在 `sopai-global`；
- 登录页、头部和 SOP 页面都能切换语言；
- 切换语言会重建用户端 iframe，以便把新语言通过 URL 传入；
- Element Plus 语言包在 `App.vue` 中同步切换。

新增文案时，三份语言文件应保持相同 key 结构。

## 已知结构性注意事项

### 1. 路由与菜单重复

`router/index.js` 和 `stores/modules/auth.ts` 都维护页面树。只改其中一个会导致“能访问但菜单不显示”或“菜单存在但页面未注册”。

### 2. 开发与生产代理可能漂移

`vite.config.js` 与 `nginx.conf.template` 独立维护，当前目标和覆盖范围已有差异。排查“开发正常、生产失败”或相反的问题时，先对比这两处。

### 3. 用户端只有编译产物

`public/eap/` 含压缩后的 JS/CSS 和播放器依赖，不适合直接维护。用户端业务变更应在其源项目构建后整体更新产物。

### 4. API 拦截器重复

多个 service 重复 token 与 401 逻辑。修改鉴权行为时要全局搜索所有 Axios 实例和原生 `fetch`，不能只改一个文件。

### 5. 前端存在第三方语音服务配置

`xfyunAsr.js` 与 `xfyunTts.js` 当前包含客户端可读取的第三方鉴权配置。浏览器端密钥无法保密，正式环境应迁移到后端签名/代理，并轮换已暴露的凭据。文档和日志中不要复制这些值。

### 6. 旧页面与未接入模块并存

- `LicenseRegister.vue`、`MonitorOverview.vue`、`testCenter/` 等代码不在当前主路由中；
- `config/menus.js` 不是当前侧栏的主要数据源；
- `chatHistory.service.js` 暂未发现被当前页面直接引用；
- 判断代码是否在线上生效时，应先从 `router/index.js` 和页面 import 链确认。

### 7. 自动化质量门禁缺失

项目没有测试、lint、格式化和独立 typecheck 脚本。大组件和混合 JS/TS 使运行时回归风险较高，改动后需要针对业务路径做人工验证。

## 排查顺序建议

遇到页面数据问题时，可按以下顺序定位：

1. 路由是否指向预期页面；
2. `localStorage.token` 和持久化用户信息是否正确；
3. 页面实际调用哪个 `src/services/*` 方法；
4. 请求前缀是否被 Vite/Nginx 正确转发；
5. 后端返回是 HTTP 错误还是业务 `status` 错误；
6. 页面是否对参数名或响应字段做了二次映射；
7. 是否受语言、superadmin、用户端 iframe 或缓存状态影响。

# 会话交接

## 当前基线（2026-08-03）

- 仓库：`D:\PL\eap-chat`；当前分支：`feature/zyh-managelxks-2026-7-27`；本次检查时工作区无未提交改动。
- 本次只核对并更新 `.agents` 文档，未改业务代码、配置、依赖、环境文件或容器，未运行构建、测试或服务。
- 当前源码已包含练习管理与考试管理入口、页面和前端 API 封装。是否已在特定后端/环境完整联调，仍需用户或对应服务仓库确认。

## 下一位协作者

1. 先阅读根目录 `AGENTS.md`，再按任务阅读本目录相关文档。
2. 修改菜单、路由、页面或接口前，沿 `ARCHITECTURE.md` 与 `ROUTE_API_MAP.md` 追踪对应调用链。
3. 保持改动最小，保护工作区现有改动和环境变量；验证由用户执行并如实记录结果。

## Web 用户端第一阶段（2026-08-03）

- 已新增独立 `/web` 基础框架及四个占位页面。后续第二阶段应在 `pages/webUser/` 下实现用户端学习、练习、考试业务，不要改入管理端页面或复用管理端 CRUD 接口。
- 当前用户显示读取 Pinia `userInfo.name`，用户端/App/H5 独立跳转仍待确认；验证由用户执行 `npm run dev` 后完成。

## 终端双向导航（2026-08-03）

- 管理端 `LayoutVertical` 端类型栏的 Web 入口使用 `router.push({ name: 'WebUserHome' })`；Web 用户端的管理端入口使用 `router.push({ name: 'Dashboard' })`。两端均未硬编码部署地址。
- 管理端既有用户端 iframe 行为未改，用户端/App/H5 的独立入口仍待确认。

## Web 用户端练习页（2026-08-03）

- 练习页已有筛选、禁用的综合练习区、空状态与实际使用的 `PracticeCard`。当前没有用户端列表 service，故 `practices` 必须保持空数组，不得复用管理端 SOP API 或补入演示数据。
- 后续服务适配为 `PracticeViewModel` 后，卡片通过 `start` emit 交由页面以 `ChatExam` + `{ sopId, sopName, entry: 'web-practice' }` 跳转。`ChatExam` 只对白名单 entry 返回 `/web/practice`，其他来源保持 `/chat/sop`。

## Web 用户端练习筛选（2026-08-03）

- `pages/webUser/practice/index.vue` 现在只读调用 `getSopCategoryTree()` 获取分类树；一级按产品/运营/技术映射到真实节点，二级直接来自该节点 `children`。任何未来练习列表 service 都必须独立确认，不能复用 `getSops`。
- 综合练习只保留白色视觉卡片，按钮点击提示未开放；筛选仅改变页面状态，空列表始终不发起练习列表请求。

## Web 用户端练习列表接入（2026-08-03）

- 新增 `src/services/webUser/practice.service.js`，将后端 snake_case 响应唯一转换为 `PracticeViewModel` camelCase 字段，并通过已有 `sopApi` 请求 `/v1/dataprep/user/practices`。
- 练习页现在独立加载分类树和用户端列表，支持一级/二级分类、点击/回车关键词搜索、服务端分页、加载、空状态、403/网络失败与重试；筛选变动会重置到第一页，旧请求不会覆盖新筛选。
- `PracticeCard.vue` 已改用填空题、问答题和总题量；没有真实进度时显示 `--` 且不渲染 0% 进度条，开始按钮固定为“开始练习”。
- 未实现进度、历史练习和综合练习；用户需在真实已登录环境验证列表及进入/返回 `ChatExam`。

## ChatExam 与 Smart Practice（2026-08-04）

- `ChatExam.vue` 的 `/chatapi/v1/exams/answer` 已按后端 `TrainParams` 发送顶层 `session_id`、`messages`、`streaming` 和 `stream_options`，移除了错误的 `input` 包装。
- start 和 answer 在读取 JSON/SSE 前检查非 2xx；失败会记录 HTTP 状态及后端响应到 Console，并在页面显示现有失败提示，不会解析错误响应为 SSE 空白气泡。
- 未运行构建、浏览器或服务器测试；需与重建后的 Smart Practice 一起由用户联调。

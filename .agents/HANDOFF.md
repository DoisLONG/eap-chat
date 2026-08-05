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

## Web 用户端首页（2026-08-04）

- `pages/webUser/home/index.vue` 已由占位页改为首页组合入口；页面私有卡片位于 `pages/webUser/home/components/`，不修改共享 Web Layout、路由、菜单或 service。
- 当前使用用户明确许可的页面本地 mock 展示模型，覆盖概览、最近学习、推荐课程、今日计划、待考试和学习数据。真实用户端首页接口确认后，应在专用 `services/webUser/` 中创建 adapter，再由页面替换该模型；不得复用管理端 Dashboard、课程或考试 CRUD 接口。
- 首页的“开始练习 / 继续练习”使用 `WebUserPractice`，考试的“查看全部 / 开始考试”使用 `WebUserExam`；顶栏用户名仍由公共壳从 `userInfo.name` 读取。
- 已补齐中英泰首页文案；未运行构建、测试、服务或容器。需由用户验证 `/web/home` 的 1024px、1200px、1440px 布局、路由跳转、实际登录用户名及 `npm run build`。

## Web 用户端首页真实数据接入（2026-08-05）

- 首页已改用 `services/webUser/home.service.js` 的专用接口；练习卡片与考试卡片读取真实数据，开始练习进入 `WebUserPractice`，开始考试/查看全部进入 `WebUserExam`。
- 后端对应组件位于 `beat-backend-github/src/comps/web_user_home/`，提供一个只读首页接口并以 token 的租户/组织信息过滤数据。部署时需按该组件的 Dockerfile 新建服务容器，并在前端 Nginx 环境提供 `WEB_USER_HOME_API_HOST`；实际 Compose 目标尚未确认，不要猜测并修改其他部署文件。
- 当前无用户学习或练习行为表，因此最近学习、今日计划、学习数据和整体学习统计必须为空状态。后续如新增行为记录表，应扩展专用首页接口，不可重新放回 mock。

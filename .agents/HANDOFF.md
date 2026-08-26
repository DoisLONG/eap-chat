# 会话交接

## 练习题目复核响应式布局（2026-08-19）

- `src/pages/practiceReview/index.vue` 已使用 CSS 容器查询，以页面实际可用宽度决定布局：内容宽度大于 1180px 保持原文件/题目复核双栏，宽度不足时自动上下排列；DOCX 适配单独按左侧预览栏宽度触发，栏宽不超过 960px 时保留源文件页边距、填满左栏并提供 48px 外层安全留白，避免标题和正文被裁切。
- 未修改路由、接口、题目或资料数据、依赖、构建与部署配置；未运行构建、测试或浏览器。请用户在大屏、中等宽度（含侧栏展开/折叠）和窄窗口下验证页面布局、DOCX 完整性、筛选、分页、保存和返回。

## 考试抽题配置题型显示修复（2026-08-06）

- 已在 `src/pages/examManagement/components/ExamFormDrawer.vue` 修复中文题型（问答题/填空题等）fallback 为"其他题型"的问题：新增 `typeAliasMap` 中英别名映射与 `canonicalType` 归一化（66/94-95 行），`isAuto` 同步归一化（100 行）；显示经 `exam.types.*` i18n，保存仍提交原始中文值，抽题规则保存逻辑未改。
- 未运行构建、自动化测试或浏览器；未 commit、未 push。需用户 `npm run dev` 验证新建考试的抽题配置页（第二步）各题型分别显示、编辑回显、保存后重新打开正常。

## 用户管理列表精简（2026-08-06）

- 已在 `src/pages/userManagement/index.vue` 移除部门/角色/岗位三列及模板插槽，重排用户名称/邮箱/手机号列宽（minWidth 160/240/140），操作列固定右侧（220px）；内容居中沿用 ProTable 默认对齐，操作按钮（图标+文字、删除 danger）未变。
- 已知遗留：后端强绑定组织字段导致新增用户提交失败，前端已用空字符串占位，待后续后端解除绑定后重新验证新增流程。
- 未运行构建、自动化测试或浏览器；未 commit、未 push。

## 新增用户表单精简（2026-08-06）

- 已在 `src/pages/userManagement/components/UserDrawer.vue` 移除公司/部门/岗位字段及全部联动逻辑，表单保留：用户名称、邮箱、角色、密码、确认密码（必填）+ 手机号（非必填，仅格式校验）；提交时组织字段补空字符串占位，接口调用不变。
- 未运行构建、自动化测试或浏览器；未 commit、未 push。需用户 `npm run dev` 后验证新增/编辑/查看三种方式、手机号可留空、密码一致性校验及提交结果。

## 新增用户弹窗 UI 改造（2026-08-06）

- 已将 `src/pages/userManagement/components/UserDrawer.vue` 由右侧 Drawer 改为居中 Dialog（560px、`align-center`、四周 24px 间距、12px 圆角、header/footer 固定 + body 滚动）；表单逻辑、校验、接口调用全部保留，组件对外接口（props/事件/挂载方式）未变。
- 未运行构建、自动化测试或浏览器；未 commit、未 push。需用户 `npm run dev` 后验证三种打开方式（新增/编辑/查看）的居中显示、小屏适配、三语布局与提交/校验行为。

## 隐藏系统管理菜单（2026-08-06）

- 已在 `src/stores/modules/auth.ts` 将公司管理、部门管理、岗位管理、模型配置四个菜单节点置为 `isHide: true`，并移除 getters 中失效的 superadmin 过滤分支；侧栏对所有用户不再展示这四项。
- 路由表未改：四个页面仍可由 URL 直达，模型配置仍受原 superadmin 守卫限制。若后续要求彻底封禁访问，需修改 `router/index.js` 守卫。
- 未运行构建、自动化测试或浏览器；未 commit、未 push。需用户 `npm run dev` 后验证侧栏与超管/普通用户两种视角。

## ChatExam 用户答案展示（2026-08-05）

- 已在 `src/pages/ChatExam.vue` 修复用户消息 ID、即时持久化、结果卡 `userAnswer` 渲染及循环变量作用域；保留了临时的无内容调试日志，供浏览器确认消息未被删除。
- `@click="send"` 传入的 `MouseEvent` 已通过 `send()` 的严格布尔转换隔离；键盘与鼠标提交共享相同用户消息路径。
- 未运行构建、自动化测试或浏览器；未 commit、未 push。

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

## Web 用户端考试页（2026-08-04）

- `/web/study` 已从占位页改为学习资料浏览页，包含关键词、一级/细分方向筛选、九项分页卡片及加载、空数据、失败和重试状态；公共路由和菜单未改，公共内容容器仅补充 `border-box` 以消除内边距导致的横向溢出。
- 顶部筛选区已对齐管理端资料管理：标题、分类行、浅灰细分方向区和 340px 名称输入框采用相同排列与尺寸；名称搜索行右侧提供带图标的“搜索 / 重置”按钮，搜索、回车、清空和重置均复用现有列表加载并重置到第一页。
- 筛选标题、分类标签、名称标签和输入提示统一使用“学习资料”语义，并已同步中文、英文和泰文。
- 学习资料卡片右上角显示列表接口 `size`：B、KB、MB、GB 均保留一位小数，无效或非正数显示 `-`；展示模型仅映射现有字段，接口请求不变。
- `src/services/webUser/study.service.js` 复用现有资料只读列表调用并集中转换展示模型；未接入课程、详情、预览、学习进度、权限或任何管理端写操作。
- “查看”入口复用管理端纯展示 `officeCheck.vue` / `OfficeViewer`，展示模型将 `file_url` 映射为 `fileUrl`，并按管理端既有 `/mobileapi/${fileUrl}` 规则打开单个全屏预览；缺少地址时显示三语提示。
- 未接入学习详情路由、课程、学习进度、权限或任何管理端写操作。构建、普通学习账号文件权限、支持类型、加载失败、三语和 1024px/1200px/1440px 视觉验证由用户执行。

## 多端统一入口（2026-08-05）

- `src/stores/modules/global.ts` 的持久化状态新增 `currentPlatform`。点击管理端或 Web 端都会进入 `/dashboard`；前者渲染原管理仪表盘，后者复用 `pages/webUser/home/index.vue`。
- `WebUserLayout.vue` 仅复用 `LayoutVertical`，使 `/web/*` 保持兼容的同时使用相同端类型栏、BLUEDOT Logo、顶部栏和菜单样式。`LayoutVertical` 继续通过 `authStore.showMenuListGet` 渲染管理端权限菜单，Web 平台使用首页、学习、练习、考试四项静态菜单。
- 用户需验证平台切换、刷新恢复、`/web/*` 子菜单路由与高亮、浏览器前进/后退及管理端首次引导/H5 iframe；`/dashboard` 导航历史会携带非敏感的平台状态。未运行构建、测试、服务或容器。

## Web 平台顶部标题（2026-08-05）

- 顶部标题实际由 `layouts/components/Header/components/Breadcrumb.vue` 输出。Web 平台在 `/dashboard` 显示当前菜单的“首页”，而不是管理端路由的“仪表盘”；Web 子路由优先显示自身 `meta.titleKey`。
- 管理端标题和面包屑数据源不变。用户需验证 Web `/dashboard` 的“首页”、Web 子页标题以及管理端“仪表盘”和其他管理页标题；未运行构建、测试、服务或容器。

## Web 平台顶部菜单图标（2026-08-05）

- `LayoutVertical` 通过 `provide` 将当前 Web 菜单配置传递给 Header；`Breadcrumb.vue` 按激活路径读取同一菜单项的 `meta.icon`，无需新增图标或第二份图标映射。
- Header 在 Web 首页显示 `House + 首页`，在学习、练习、考试页显示对应菜单图标和路由已有标题；管理端仍使用原有面包屑和图标数据源。
- 用户需验证 Web 四个菜单页、兼容 `/web/home` 路径以及管理端顶部图标；未运行构建、测试、服务或容器。
- `/web/exam`（`WebUserExam`）已从占位页调整为用户端考试筛选、分类树、状态页签、列表容器、空态、错误态、分页状态及两列响应式卡片布局；继续使用既有 `WebUserLayout` 与 `WebPageContainer`。
- 当前没有已确认的用户端考试接口，因此页面不调用 `exam.api.js` 的管理端 CRUD；考试数组和状态统计保持空/`--`，卡片动作均禁用并提示“功能接口待确认”。
- 分类树只读复用 `getSopCategoryTree()`，以实际返回名称渲染；未创建 `services/webUser/exam.service.js`、未使用 mock 或 localStorage。

## Web 用户端考试筛选细化（2026-08-04）

- 考试页的 `selectedPrimaryCategoryId` 和 `selectedSecondaryCategoryId` 是独立状态。一级选择会清空二级；“全部”使两者都为 `null` 并隐藏二级区；二级只读取当前一级分类树节点的 `children`，默认标签使用“全部 + 一级名称”。
- 页面视觉已参照 `D:\PL\HTML\用户端-考试.html` 收紧为浅色筛选卡、满宽浅蓝二级区、标签胶囊、两行搜索、三段状态栏和 1200px 以上两列等宽卡片。用户端考试接口仍未确认，以上筛选状态不得接到管理端 `exam.api.js`；需先确认用户端 endpoint、请求分类字段和状态枚举，再创建独立 adapter/service。

## Web 用户端考试第一阶段接入（2026-08-04）

- `src/services/webUser/exam.service.js` 已接入 Exam 的用户端只读接口：`GET /exam-api/api/v1/user/exams`、`/counts`、`/{id}`；复用既有 Axios token 与 401 处理，不复用管理端 CRUD。
- `/web/exam` 现在以真实后端列表、状态统计、分类/关键词/状态/分页筛选驱动卡片；旧请求不会覆盖新筛选。卡片题型从后端 `question_type_counts` 选择两项真实展示指标，不把填空题归成选择题。
- 开始、继续、作答、结果和历史功能未实现，按钮固定禁用并显示三语提示；尚未执行浏览器、构建或接口联调。

## Web 用户端考试第二阶段（2026-08-04）

- `/web/exam/:examId/answer`（`WebUserExamAnswer`）已使用正式用户端 Exam start/attempt/answer 接口恢复试卷和保存答案；操作均不经 Smart Practice。
- 未实现交卷、评分、结果、历史、补考或超时自动提交；用户需在部署后验证倒计时、刷新恢复和保存失败提示。

## Web 用户端考试第三阶段（2026-08-04）

- 已接入 `POST /api/v1/user/exams/{id}/submit`、`GET /result`，新增结果页路由 `WebUserExamResult`；考试卡片的完成状态可进入结果或评分进度。
- 答题页提交前强制等待当前题保存，保存失败会提示且不静默交卷；超时是客户端尽力调用同一 submit 接口，网络失败显示“尚未确认”与重试，不能保证关闭浏览器后的自动交卷。
- 未运行构建、浏览器或真实接口；仍未实现 history、retake、manual grading、eval report、服务端定时自动交卷或管理端成绩统计。

## ChatExam 与 Smart Practice（2026-08-04）

- `ChatExam.vue` 的 `/chatapi/v1/exams/answer` 已按后端 `TrainParams` 发送顶层 `session_id`、`messages`、`streaming` 和 `stream_options`，移除了错误的 `input` 包装。
- start 和 answer 在读取 JSON/SSE 前检查非 2xx；失败会记录 HTTP 状态及后端响应到 Console，并在页面显示现有失败提示，不会解析错误响应为 SSE 空白气泡。
- 未运行构建、浏览器或服务器测试；需与重建后的 Smart Practice 一起由用户联调。

## 考试重新发布与卡片 tooltip（2026-08-04）

- `pages/examManagement/components/ExamFormDrawer.vue` 不再提供结束时间编辑器。它只读显示“开始时间 + duration”，发布时只提交开始时间；已结束考试默认选择发布并以“重新发布考试”提示用户替换过期开始时间。
- `components/webUser/exam/ExamCard.vue` 已移除可用主按钮的空 `el-tooltip`；禁用按钮和历史按钮仅在存在文案时显示无箭头 tooltip。
- 未运行构建、浏览器或真实接口；部署后按验收清单检查 Element Plus 弹层、时间显示、后端 400/409 与重发后的版本快照。
# 2026-08-05 智能陪练答题页

- 实际页面为 `src/pages/ChatExam.vue`，已与 Smart Practice 的结构化 SSE 同步。需由用户验证首题自动展示、结果/下一题两条气泡、刷新恢复和断流提示。

## Web 用户端首页（2026-08-04）

- `pages/webUser/home/index.vue` 已由占位页改为首页组合入口；页面私有卡片位于 `pages/webUser/home/components/`，不修改共享 Web Layout、路由、菜单或 service。
- 当前使用用户明确许可的页面本地 mock 展示模型，覆盖概览、最近学习、推荐课程、今日计划、待考试和学习数据。真实用户端首页接口确认后，应在专用 `services/webUser/` 中创建 adapter，再由页面替换该模型；不得复用管理端 Dashboard、课程或考试 CRUD 接口。
- 首页的“开始练习 / 继续练习”使用 `WebUserPractice`，考试的“查看全部 / 开始考试”使用 `WebUserExam`；顶栏用户名仍由公共壳从 `userInfo.name` 读取。
- 已补齐中英泰首页文案；未运行构建、测试、服务或容器。需由用户验证 `/web/home` 的 1024px、1200px、1440px 布局、路由跳转、实际登录用户名及 `npm run build`。

## Web 用户端首页真实数据接入（2026-08-05）

- 首页已改用 `services/webUser/home.service.js` 的专用接口；练习卡片与考试卡片读取真实数据，开始练习进入 `WebUserPractice`，开始考试/查看全部进入 `WebUserExam`。
- 后端对应组件位于 `beat-backend-github/src/comps/web_user_home/`，提供一个只读首页接口并以 token 的租户/组织信息过滤数据。部署时需按该组件的 Dockerfile 新建服务容器，并在前端 Nginx 环境提供 `WEB_USER_HOME_API_HOST`；实际 Compose 目标尚未确认，不要猜测并修改其他部署文件。
- 当前无用户学习或练习行为表，因此最近学习、今日计划、学习数据和整体学习统计必须为空状态。后续如新增行为记录表，应扩展专用首页接口，不可重新放回 mock。
## 2026-08-10 PPT/PPTX PDF preview handoff

- Modified `src/components/OfficeViewer/index.vue`, the shared viewer used by the material library and Web study page.
- PPT/PPTX now selects `VueOfficePdf`; browser-side `VueOfficePptx` parsing, options, callbacks, and reset handling were removed. File type labels and `/mobileapi` URLs are unchanged.
- Requires the Learn `/api/v1/files/access` implementation that maps an original PPT/PPTX URI to its generated PDF cache. User must run the browser and build verification.

## Web 用户端智能陪练答题 UI 收紧（2026-08-11）

- 仅修改 `src/pages/ChatExam.vue`、`src/components/chat/AnswerResultCard.vue` 与 `src/components/chat/NextQuestionCard.vue` 的展示样式。桌面端普通 AI 消息收紧为聊天区域 62% / 最大 760px；结果卡收紧为 78% / 最大 900px，移动端保留额外右侧边距。
- 结果卡缩小外层 padding、圆角、阴影、标题、状态标签、得分、分隔和详情区间距；答案与解析内容区采用内容自适应高度与更小 padding，状态颜色、结构与解析逻辑不变。
- 未修改 API、SSE、`messages`、评分、下一题、路由或语音逻辑；未运行构建、测试、浏览器、服务或容器操作。需由用户验证桌面与手机端的短文本、长文本和结果/下一题连续展示。

## 智能陪练结果卡标题区微调（2026-08-11）

- `ChatExam.vue` 进一步收紧普通 AI 消息至 60% / 最大 720px，结果卡至 74% / 最大 840px；移动端结果卡为 `calc(100% - 60px)`，避免贴满可视区域。
- `AnswerResultCard.vue` 仅用 CSS 调整现有标题区：桌面端“答题结果 + 本题判定已完成”在左侧同一行，状态标签紧邻得分左侧；手机端采用两行网格，保持同一信息顺序。未改动 API、SSE、消息、评分、下一题、路由或语音逻辑。

## 智能陪练结果卡再次收紧（2026-08-11）

- `ChatExam.vue` 将普通 AI 消息调整为 58% / 最大 680px，结果卡调整为 70% / 最大 780px；移动端结果卡为 `calc(100% - 64px)`。
- `AnswerResultCard.vue` 外层 padding 为 `14px 18px`，得分数字为桌面端 26px、移动端 24px。未修改 API、SSE、消息、评分、下一题、路由或语音逻辑。

## 2026-08-11 智能陪练得分与提示框对齐

- 得分数字已进一步调整为桌面端 `22px`、移动端 `20px`。
- 下一题提示框已复用结果卡的宽度：桌面端 `70%`、最大 `780px`；移动端 `calc(100% - 64px)`，并与结果卡左侧对齐。
- 未改动任何业务逻辑；请用户在桌面端和移动端确认结果卡与提示框左右边界一致。

## 本地用户端 iframe 地址修复（2026-08-11）

- `src/layouts/LayoutVertical/index.vue` 在 Vite 开发环境显式加载当前站点的 `/eap/index.html#/`，替代失效的远程 H5 地址；生产环境保持 `/eap/#/`。
- 未修改 H5 编译产物、接口、路由或数据模型；未运行构建、测试或浏览器。用户需刷新后验证“用户端”入口。

## 用户端 SOP 开始练习路由修复（2026-08-11）

- `src/pages/SopPicker.vue` 中单个 SOP 和混合出题确认均从未注册的 `/chat/exam` 改为已注册的 `/web/chat/exam`；保留 `sopId`、`sopName`、`sopVer` 或 `position_id` 查询参数。
- 未修改 `ChatExam.vue`、路由表、接口或数据模型；未运行构建、测试或浏览器。用户需在已登录环境验证两种入口、首题加载与返回路径。

## 用户端切换清除 Web 高亮（2026-08-11）

- `src/layouts/LayoutVertical/index.vue` 在点击用户端时同步将平台状态从 `web` 切回 `admin`，避免 Web 端高亮与用户端同时出现。
- 未修改路由、iframe 地址、接口或数据模型；未运行构建、测试或浏览器。用户需验证 Web、用户端和管理端之间的连续切换。

## 2026-08-11 智能陪练移动端反馈卡收紧

- `AnswerResultCard.vue` 的移动端顶部已调整为“标题与状态 / 副标题 / 得分”三行；答案和解析改为图标、标题、内容同行，长内容自然换行，保留原有蓝紫背景与状态色。
- `ChatExam.vue` 的移动端普通 AI 气泡、用户气泡和输入区已收紧；结果卡与下一题提示框仍使用 `calc(100% - 64px)`，避免贴边，桌面端规则不受影响。
- 用户需验证 360px、390px 和 430px 宽度下的无横向滚动、底部输入区遮挡和结果/下一题卡对齐；未改动任何业务逻辑。

## 2026-08-11 SOP 练习移动端分页排版

- `SopPicker.vue` 手机端已保留全部分页能力，并使用两行网格展示：上一页/页码/下一页位于第一行，跳页与总条数位于第二行。
- 仅调整 CSS，并增加底部内容留白以避免固定导航遮挡；未修改 SOP 查询、分页参数、跳转或任何业务逻辑。请用户验证窄屏分页与最后一项内容的可见性。

## 2026-08-11 资料预览默认渲染修复

- `OfficeViewer.vue` 默认状态改为 `transform: none`，仅在用户缩放或拖动时应用原有缩放/平移变换。
- `h5Preview/index.vue` 和资料库 `officeCheck.vue` 已移除对所有子元素的全局过渡，避免干扰文档首次渲染。未修改预览地址、文件类型判断、接口或其他业务逻辑；请用户验证各类文件及缩放拖动。
# 2026-08-26 复核页 DOCX 预览交接

- 已修复 `src/pages/practiceReview/index.vue` 中窄屏将 `.docx` 强制铺满容器的样式。该样式是文字从两行变三行及复杂图片右侧裁剪的直接原因。
- 当前策略为保持原始 DOCX 页宽、使用现有横向滚动查看；若业务要求任意宽度下仍完整等比显示复杂 Word 排版，后续需确认后端是否可提供 DOCX 转 PDF 预览文件。
- 待用户在目标部署环境用含图片、表格的 DOCX 进行宽屏和窄屏验收；未执行构建、测试、容器或部署操作。
# 2026-08-26 复核页 DOCX 整页预览交接

- `src/pages/practiceReview/index.vue` 已从“原始页宽 + 横向滚动”改为“原始版式 + 等比缩小”。页面渲染完成后会依据左侧可用宽度计算缩放，窗口宽度变化时会重新计算。
- 为避免 `@vue-office/docx` 在窄屏把页面改成 100% 宽导致文字重排，代码锁定了渲染器写入的页面尺寸；预览不改接口或后端。
- 待用户在目标环境验证含图片和表格的 DOCX 在 1024px、1280px、宽屏下均无横向滚动、无图片裁剪、无额外文字换行；未运行构建、测试、容器或部署。

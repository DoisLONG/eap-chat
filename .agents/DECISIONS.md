# 决策记录

## 2026-08-03 文档基线审查

- 历史条目反映当时的判断，不自动构成当前实现规则；当前代码、`DEVELOPMENT.md`、`ARCHITECTURE.md` 与 `ROUTE_API_MAP.md` 优先。
- 当前前端已存在考试管理路由、页面和 `/exam-api` 封装。其后端契约、权限、数据库和部署状态仍须在对应服务和目标环境确认，不能因前端请求存在而推断完成联调。
- 协作文档不记录具体后端地址、容器端口、运行态或环境变量值；仅保留可安全执行的配置名称与验证边界。

## 2026-08-03 Web 用户端第一阶段

- Web 用户端使用独立的 `/web` 路由和 `layouts/webUser/WebUserLayout.vue`，不接入管理端 `authMenuList` 或 `LayoutVertical`，以避免混淆用户流程与管理流程。
- 管理端端类型入口复用已确认的内部 `/dashboard` 路由；用户端/App/H5 独立入口未确认，当前作为禁用项处理，不猜测地址。
- 顶部用户名称仅使用现有登录状态中的 `userInfo.name`；缺失时采用三语通用占位，不虚构用户资料。

## 2026-08-03 终端双向导航

- 管理端与 Web 用户端同属当前 Vue Router 应用，终端切换统一使用已确认的 route name：`WebUserHome` 与 `Dashboard`；不使用完整 URL 或 `window.location`。
- 管理端既有“用户端”仍由 `activeDuan` 与 iframe 管理，本次只新增 Web 端入口，不改变其状态、尺寸计算或 iframe 地址逻辑。

## 2026-08-03 Web 用户端练习页

- 用户端练习列表的接口、权限和响应契约未确认；页面在此之前只保留空数组、页面筛选状态和不绑定接口的展示模型，不得用管理端 SOP 接口或原型数据补齐列表。
- 单项练习只允许经 `{ sopId, sopName, entry: 'web-practice' }` 进入既有 `ChatExam`。返回逻辑只识别这一个固定来源标识并返回 `WebUserPractice`，不接受任意 `returnUrl`；没有该标识的 App/H5 流程继续回 `/chat/sop`。

## 2026-08-03 Web 用户端分类筛选

- Web 用户端允许只读复用管理端的 `getSopCategoryTree()`，因为它仅提供通用分类树；练习列表仍未确认，严禁调用 `getSops` 或将分类树推断为用户可练习内容。
- 管理端 `searchForm.vue` 直接驱动管理端列表查询，不能作为 Web 用户端组件复用。Web 页面私有实现保留同一 `id / name / children` 与一级变化清空二级的规则，避免引入管理端业务耦合。

## 2026-08-03 Web 用户端练习列表接入

- 用户端列表已确认使用独立的 `GET /sop-api/v1/dataprep/user/practices` 契约；新增 `services/webUser/practice.service.js` 复用 `sopApi`，不复用管理端 `getSops`。
- 分类树继续只读复用 `getSopCategoryTree()`；页面只把分类树中的真实 ID 作为一级或二级筛选参数提交。
- 服务端当前不提供用户进度或历史记录，因此卡片将 `progressPercent: null` 显示为 `--`，不伪造 0% 或“继续练习”状态。

## 2026-08-04 Web 用户端考试页

- 当前只确认 `/exam-api/api/v1/exams` 为管理端 CRUD；未确认用户端考试列表、状态统计、开始/继续、结果或历史契约。因此 `/web/exam` 仅实现可靠的展示、筛选状态和空态，不调用管理端接口或构造 mock 数据。
- 分类按钮只读复用已确认的分类树并显示其真实名称；考试状态页签仅维护页面 UI 选中态，在后端枚举确认前不作为请求参数。

## 2026-08-04 ChatExam 练习协议

- Smart Practice 的 `TrainParams` 是顶层 `session_id` 与 `messages`；ChatExam 不再发送历史的 `{ input: {...} }` 包装，也不发送后端未定义的 `source_file_name`。
- ChatExam 在解析 SSE 前必须检查 HTTP 状态和响应体；422、500 或网络错误显示既有错误提示并记录控制台错误，不能保留空白教练气泡。

## 2026-07-28 恢复决策

| 决策 | 结论 | 依据/影响 |
|---|---|---|
| 练习管理来源 | 保持 `zyh` 已合入版本 | `547efc7` 已含 `d110508`。 |
| 考试管理来源 | 保持 `5a013fe` 的选择性内容 | 当前文件与该提交一致，不覆盖其他模块。 |
| 考试 API | 不伪造 CRUD/发布 | 后端未发现管理端考试契约。 |

| 决策 | 结论 | 依据/影响 |
|---|---|---|
| 协作文档位置 | `.agents` 固定在 `D:\PL\eap-chat\.agents` | 用户明确要求；根目录 `AGENTS.md` 作为入口规则。 |
| `docker.env` | 它是文件，不是目录 | Dockerfile 不读取它；运行态值与其一致，但注入命令待确认。 |
| Docker Compose | 不作假定 | 扫描未发现有效 Compose 配置，文档仅记录未发现。 |
| Docker/端口结论 | 必须同时参考 Dockerfile、Nginx、Docker inspect | 本次确认 `80` 容器内监听、`8080:80` 运行态映射。 |
| 改造顺序 | 先分析再修改 | 练习当前是 SOP/QA 流程，参考原型是练习实体管理，不能直接映射。 |
| 参考 HTML | 不直接覆盖正式页面 | 仅作为布局、字段、交互目标；正式实现沿用 Vue/Element Plus。 |
| 技术体系 | 沿用现有技术栈 | Vue 3、Vite、Router、Pinia、Element Plus、Axios；不新增依赖。 |
| 分类能力 | 优先确认正式数据源，之后再考虑共享 | 原型分类是 localStorage 静态数据，现有正式分类接口未找到。 |
| 数据库 | 第三阶段 A 不修改 | 练习继续使用既有 `sop_info`、`sop_version` 与 Milvus QA；不新增 practice 表、不执行迁移。 |
| QA 保存契约 | 统一为单一对象调用 | 前端 `saveQaList({ sop_info_id, file_name, records })` 对齐后端 `/v1/dataprep/qa/save`；不保留缺少 `file_name` 的旧调用。 |
| QA 题型值 | 保存后端原始值 | 后端生成并存储 `填空题` / `问答题`；UI 可翻译显示，但保存不得写入翻译结果。 |
| 练习页面改造 | 在现有 SOP→QA 链路上完成 | “生成练习”复用上传 SOP、解析、生成 QA 和复核流程；不迁入参考 HTML 的 localStorage 模拟模型。 |
| 分类与资料选择 | 本阶段不实现 | 没有可靠的正式一级/二级分类映射；资料库接口及其与 SOP 的关系未确认，保留既有上传流程。 |
| 练习筛选布局 | 仅保留分类按钮与名称搜索 | 移除页面顶部标题区，以及筛选区的公司、部门、岗位和展开/收起控件；不影响生成练习弹窗内既有组织选择。 |
| 一级/二级分类行为 | 不修改接口或数据库 | 前端分别维护一级和二级状态；优先匹配 `primary_category`、`secondary_category`、`sop_type`、`sop_type_name`、`category`、`category_name`。仅单类型字段时，使用 AI Portal 等二级值到一级分类的兼容映射；无匹配字段的记录只在“全部”显示。 |
| 后端修改 | 本阶段不修改 | 后端已有保存所需业务字段与 Milvus/版本处理；前端修正即可匹配实际契约。 |
| 正式页面 | 已完成练习管理改造；不实施考试 | 仅改造既有练习管理路由页面及其直接组件，不新增考试菜单、页面或接口。 |
| 公共组件 | 暂不抽取 | 两个页面的正式字段和数据源尚未稳定；避免过早抽象。 |
| SOP 正式分类 | 使用后端分类树和二级 `category_id` | “产品/运营/技术”等数据迁入版本化 MySQL 迁移；前端不再用原型名称或 ID 进行记录匹配。 |
| 练习文件解析 | 不在 UI 暴露上传类型或解析模式 | Dataprep 以真实后缀决定解析器：PDF/DOC/DOCX→`operation`、XLS/XLSX→`sop`；旧 `file_type` 请求字段仅为兼容保留且被忽略。 |
| 练习描述存储 | 使用独立 `description` 字段 | `remark` 继续保存异步任务失败原因，避免生成失败覆盖用户填写的练习描述。 |
| 生成练习组织字段 | 移除可见组织/日期表单，岗位仅取登录上下文 | 后端 `generate_qa` 的 `position_id` 仍必传；缺少当前登录用户岗位时前端明确阻止提交，不构造默认岗位。 |

## 2026-08-04 Web 用户端考试第一阶段

| 决策 | 结论 | 依据/影响 |
|---|---|---|
| 用户端考试 API | 使用独立 `services/webUser/exam.service.js` | 仅调用 `/exam-api/api/v1/user/exams*`，不复用管理端 `exam.api.js` 业务方法。 |
| 题型展示 | 以后端 `question_type_counts` 为准 | 填空题、选择题、问答题和未知题型保持独立，adapter 选择卡片前两项真实指标。 |
| 操作能力 | 第一阶段全部禁用 | 尚无 start/continue/result/history 接口，ViewModel 中 `can*` 固定为 false，不能伪造权限。 |

## 2026-08-04 Web 用户端考试第三阶段

- 结果页只依据 Exam 服务返回的 `showAnswer` 渲染答案和解析；前端不保存或推断标准答案。
- 超时交卷为浏览器端尽力行为，统一调用正式 submit；网络/关闭浏览器无法保证成功，不宣称具备服务端自动交卷能力。

## 2026-08-04 考试重新发布与 tooltip

- 管理端结束时间只作只读预计值展示，最终事实由 Exam 后端根据开始时间和时长计算。
- 用户端卡片 tooltip 只包装禁用按钮且必须有实际文案，避免 Element Plus 对空内容创建悬浮层；历史按钮仍保留有意义的禁用提示。

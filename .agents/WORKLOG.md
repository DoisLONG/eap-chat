# 本次工作记录

## 2026-08-06 考试结果详情页显示修复（Web 用户端 `/web/exam/:id/result`）

- 定位：`src/pages/webUser/exam/result.vue` 直接使用 `t("web.exam.unanswered")`，但该 key 在 zh/en/th 三份语言文件中均缺失，页面原样显示 key；未提交答案的题目后端 `result_status` 返回 `wrong`，被错误显示为"错误"；状态 `<span>` 在窄容器内换行成竖排；题目 `question_text` 自带 `【素材MA……】` 长编号前缀，标题过长。
- 修复：
  - 语言文件补 key：zh `unanswered: "未答题数"`、en `Unanswered`、th `ยังไม่ตอบ`（顺带修复 `answer.vue` 交卷确认框里同 key 的原样显示）；新增每题状态 key `notSubmitted`/`notSubmittedAnswer`（未提交/未提交答案）。
  - `result.vue` 状态判断改为 `questionStatus(question)`：无 `userAnswer`（或 `result_status === "unanswered"`）→ 蓝色"未提交"；已作答按 `result_status` 显示正确（绿）/错误（红）/部分得分/正在评分；用户答案对未提交题显示"未提交答案"。
  - 每题改为左右布局：左侧 `__question-main`（题目、用户答案、本题得分、正确答案/解析），右侧固定宽度 `status-tag` 状态组件；`.status-tag` 设 `white-space: nowrap` + `min-width: 76px` 保证横向显示不竖排。
  - 新增 `cleanQuestionText()` 剥离题首素材来源前缀，只展示真实题目内容；沿用原 `answerLabel` 并加 fallback 参数。真实数据格式为 `[material-<uuid>--<时间戳>_<文件名>] 题目`，正则 `^\s*(?:[\[【]\s*(?:material-|素材)[\s\S]*?[\]】]\s*)+` 同时兼容 `[]`/`【】` 两种括号及连续多个前缀块，且不误删 `[判断题]` 之类正文括号；经 node 以真实样例验证。
  - 卡片左边框色随新状态（`is-unsubmitted` 蓝色替代原 `is-unanswered`）。
- 未修改后端、数据库、接口（`getUserExamResult` 映射不变）或路由；未运行构建、测试或服务。需由用户 `npm run dev` 验证：结果页汇总"未答题数"正常显示；未作答题显示蓝色"未提交"、用户答案显示"未提交答案"；已作答正确/错误红绿区分；状态标签横向不换行；题目标题无 `[material-…]` / `【素材…】` 前缀；三语切换正常。

## 2026-08-06 考试抽题配置题型显示修复

- 定位：`new_px_management_practice_question.question_type` 存中文值，`/sop-api/v1/dataprep/qa/list` 原样返回；`ExamFormDrawer.vue` 的 `normalizedType` 只识别英文枚举，中文题型 label 全部 fallback 到 `exam.types.other`，问答题/填空题被合并显示。
- 修复（`src/pages/examManagement/components/ExamFormDrawer.vue`）：
  - 66 行新增 `typeAliasMap` 中英文题型别名映射（问答题/填空题/单选题/多选题/判断题 → 标准英文枚举）；
  - 94-95 行新增 `canonicalType` 归一化函数，`normalizedType` 先归一化再查 `typeLabels`，中文题型不再 fallback 为 other，问答题/填空题分别展示；
  - 100 行 `isAuto` 改用 `canonicalType` 判断，中文“问答题”正确默认人工阅卷（manual）。
- 保存逻辑（129 行 `rulesPayload`）未改：`question_type` 提交 `item.type` 原始值（即后端 qa/list 返回的中文），与数据库/接口契约一致，不会被提交为 other；`saveExamRules` 为纯透传。
- 未修改后端、数据库、接口或发布逻辑；未运行构建、测试或服务。需由用户 `npm run dev` 验证：新建考试第二步抽题配置中问答题、填空题等题型分别显示、数量/分值/阅卷方式正常；编辑已有考试回显正确；保存后重新打开仍正常。

## 2026-08-06 用户管理列表精简

- `src/pages/userManagement/index.vue`：columns 移除部门、角色、岗位三列及对应模板插槽；保留用户名称（minWidth 160，含名称搜索）、邮箱（minWidth 240）、手机号（minWidth 140）、操作（fixed right，宽度由 280 收敛为 220）。
- 表格内容居中沿用 ProTable 默认 `align: center`；查看/编辑/删除按钮保持图标+文字、删除为 danger 链接样式，间距为 el-button 统一 12px。
- 接口请求（`getUserList`）、数据结构（`dataCallback`）不变；未修改后端、数据库、路由或 Docker；未运行构建、测试或服务。需由用户 `npm run dev` 验证列表展示、搜索、操作与新增/编辑/删除流程。

## 2026-08-06 新增用户表单精简

- `src/pages/userManagement/components/UserDrawer.vue`：移除公司、部门、岗位三个表单项及相关校验规则、数据加载（`getCompanyList`/`getDeptList`/`getPostList`）、联动逻辑（`changeCompany`/`changeDept`）和未再使用的导入；保留用户名称、邮箱、角色、密码、确认密码五个必填字段，手机号保留为非必填（仅格式校验）。
- 提交时对已移除的组织字段补默认空值占位（`company_id`/`department_id`/`position_id` 为空字符串），保留 `createUser`/`updateUser` 接口调用与参数结构；弹窗高度随内容自动收紧。
- 未修改后端、接口、数据库、路由或 Docker；未运行构建、测试或服务。需由用户 `npm run dev` 验证新增/编辑/查看三种方式的字段显示、手机号可留空、提交与校验行为。

## 2026-08-06 新增用户弹窗 UI 改造

- `src/pages/userManagement/components/UserDrawer.vue`：右侧 `el-drawer`（500px）改为居中 `el-dialog`（560px，`align-center`），保留全部表单字段、校验规则、公司/部门/岗位联动与接口调用，组件名、props、事件名不变。
- 新增 scoped 样式（`:global(.user-dialog)` 精确匹配，沿用资料弹窗的 Teleport 样式写法）：`max-width/max-height: calc(100vw - 48px / 100vh - 48px)` 保证四周间距、12px 圆角、flex 纵向布局使 header/footer 固定、body 超高时内部滚动、header/footer 上下分隔线。
- 未修改后端、接口、数据库、路由或 Docker；未运行构建、测试或服务。需由用户 `npm run dev` 验证新增/编辑/查看三种打开方式的居中显示、三语布局与提交。

## 2026-08-06 隐藏系统管理菜单

- `src/stores/modules/auth.ts` 中“公司管理”“部门管理”“岗位管理”“模型配置”四个菜单节点置为 `isHide: true`，侧栏对所有用户（含 superadmin）均不再展示，与代码库既有隐藏路由机制一致。
- 同步移除三个 getter（`showMenuListGet` / `flatMenuListGet` / `breadcrumbListGet`）中已失效的“非 superadmin 过滤模型配置”逻辑及 `useUserStore` 导入；隐藏统一由 `isHide` 承担。
- 路由表 `router/index.js` 未改：四个页面仍可通过 URL 直达（模型配置仍受原 superadmin 守卫限制），本任务只隐藏菜单入口。
- 未修改后端、接口、数据库或 Docker；未运行构建、测试或服务。需由用户启动 `npm run dev` 验证：所有角色登录后侧栏“设置中心”下仅剩“权限管理→用户管理”，模型配置及公司/部门/岗位管理不再出现。

## 2026-08-05 ChatExam 用户答案展示

- 用户提交时先以唯一消息 ID 写入并立即持久化；结构化 `result` 消息保存本次本地 `userAnswer`，结果卡固定显示该字段。
- `send()` 仅接受严格的 `true` 作为自动请求标记，避免点击事件对象被误判为自动请求而跳过用户消息。
- “已自动进入下一题”提示移回对应 `v-for` 作用域，避免引用未定义的 `m`、`messageIndex`。
- 未改后端接口、评分逻辑或其他业务页面；待用户在浏览器联调验证。

## 2026-07-31 考试分类标签

- `src/pages/examManagement/index.vue` 的分类列改为复用练习管理的双标签视觉：一级分类为蓝色圆角标签，二级分类为灰色圆角标签；混合考试仅显示一级“混合”标签。
- 未修改考试接口、后端、数据库、路由或 Docker；未运行构建、测试或服务。

## 2026-07-31 考试弹窗自适应

- `src/pages/examManagement/components/ExamFormDrawer.vue` 去除固定 `1060px` 宽度，桌面端弹窗宽度改为视口宽度减 48px、最大 1600px；高度为视口减 48px、最大 900px（支持 `100dvh`，并保留 `100vh` 回退）。步骤条从滚动容器移出，标题、步骤条和 footer 固定，仅中间表单区域滚动；切换步骤或重新打开时，该区域会回到顶部。900px 以下维持视口减 24px 的单列布局。
- 修正 Teleport 场景下的 scoped CSS：弹窗外壳及 Element Plus 的 header/body/footer 使用 `:global(...)` 精确匹配，避免 `:deep(...)` 编译后依赖不存在的作用域祖先。
- 根据最终视觉目标将桌面弹窗收敛为最大 `1060px × 720px` 的居中窗口；视口不足时仍按安全边距缩小，避免大屏上铺满遮罩区域。
- 经用户确认，最终桌面尺寸进一步收敛为最大 `900px × 600px`；小于 900px 的窄屏仍使用视口减 24px，避免固定像素导致小屏溢出。
- 对齐“生成练习”弹窗的实际视觉尺度，考试弹窗桌面端最终调整为最大 `720px × 560px`；小屏自适应与中间内容独立滚动规则保持不变，并合并此前多轮覆盖规则为唯一尺寸定义。
- 恢复 `align-center` 所需的自动外边距，使弹窗重新水平、垂直居中；考试类型改为产品、技术、运营、混合四列同排。
- 根据实际截图将桌面弹窗从 `720px × 560px` 放大到 `1060px × 720px`；视口不足时仍按安全边距缩小，footer 固定和中间内容独立滚动保持不变。
- 未修改考试接口、后端、数据库、路由或 Docker；未运行构建、测试或服务。

## 2026-07-30 练习描述

- 生成弹窗新增可选练习描述；编辑弹窗改为可输入并提交同一 `description` 字段。
- 未执行构建、测试、数据库迁移、容器或服务器操作。

## 2026-07-30 开发代理地址

- `vite.config.js`：曾调整当前生效的 Vite 开发代理目标，保留各接口前缀和重写规则；具体地址不记录在协作文档中。
- 未运行构建、测试、服务或容器操作；需由用户重启 `npm run dev` 后验证聊天接口。

## 2026-07-28 学练考评恢复

- 当前 HEAD 已同时保留 `zyh` 的练习管理和 `5a013fe` 的考试管理；分类树 API 已有唯一导出，删除历史重复实现。
- 未运行构建、测试、服务、接口或数据库操作。

## 创建的文档

- `AGENTS.md`
- `.agents/DEVELOPMENT.md`
- `.agents/ARCHITECTURE.md`
- `.agents/ROUTE_API_MAP.md`
- `.agents/MIGRATION_PLAN.md`
- `.agents/DECISIONS.md`
- `.agents/TODO.md`
- `.agents/WORKLOG.md`
- `.agents/HANDOFF.md`
- `.agents/ACCEPTANCE_CHECKLIST.md`

## 只读分析

- 以 Python 递归扫描项目（排除 `.git`、依赖、构建、缓存、日志及大文件），定位 Docker、环境、Nginx、入口、路由、菜单、服务、页面和本地参考文件。
- 阅读：`Dockerfile`、`docker.env`、两个入口脚本、三个 Nginx 配置、`package.json`、`vite.config.js`、README、应用入口、路由、菜单/布局/权限 store、练习页及子组件、SOP/公司/聊天/仪表盘服务、考试残留页和参考 HTML/脚本。
- 搜索关键词：培训中心、练习管理、练习、考试管理、考试、资料管理、题库管理、评价管理、岗位管理、系统管理、training、practice、exercise、exam、quiz、question、menu、router、route、permission，以及全部 `docker.env` 变量名。
- 执行的只读 Docker 命令：`docker ps -a`、`docker inspect eap-chat`、`docker image inspect eap-chat:local`。

## 已确认结论

- Vue 3 + Vite + Element Plus 管理端；Dockerfile 两阶段构建，Nginx 静态托管。
- 无 Docker Compose 配置；当前 `eap-chat` 容器由 `eap-chat:local` 运行，宿主 `8080` 映射容器 `80`。
- 培训中心/练习管理菜单和路由均为前端静态配置；当前练习页为 `LicenseAdmin.vue`，主要使用 SOP/QA 接口。
- 找到参考文件：`reference-ui/管理端-练习.html`、`reference-ui/管理端-考试.html`、`reference-ui/category-filter.js`。

## 仍待确认

- `docker.env` 的实际外部加载方式；练习/考试的正式后端模型、分类源、权限码和菜单数据库需求。

## 未做的修改

- 未修改任何正式练习管理页面、未新增正式考试管理页面。
- 未修改 Docker、`docker.env`、数据库或迁移。
- 未运行构建、测试、Compose、容器生命周期或镜像操作。

## 第三阶段 A：练习管理接口契约收口与页面改造

### 阅读、核对与只读操作

- 按任务要求阅读前端 `AGENTS.md`、`.agents/ARCHITECTURE.md`、`ROUTE_API_MAP.md`、`MIGRATION_PLAN.md`、`DECISIONS.md`、`TODO.md`、`HANDOFF.md`，以及后端 `AGENTS.md` 与 `.agents` 的前后端映射、服务、数据模型、权限、决策和交接文档。
- 阅读并追踪前端 `src/services/sop.api.js`、`src/pages/LicenseAdmin.vue`、`src/components/exam/ReviewDialog.vue`、`src/pages/components/licenseAdmin/searchForm.vue`、`editDrawer.vue`、组织服务与 `ProTable`；读取 `reference-ui/管理端-练习.html`、`reference-ui/category-filter.js`，仅作为界面原型参考。
- 阅读后端 `D:\PL\eap\beat-backend\src\comps\dataprep\main.py`、Milvus QA 处理和 SOP 版本代码，确认 `/v1/dataprep/qa/save` 的实际请求与写入链路。
- 仅执行 Python 文件读取/搜索及 `git diff`、`git status` 等只读检查；未执行构建、测试、Docker、数据库或真实删除请求。

### 已完成修改

- `src/services/sop.api.js`：将 QA 保存统一为 `saveQaList({ sop_info_id, file_name, records })`，补齐后端必需的 `file_name`。
- `src/components/exam/ReviewDialog.vue`：按实际契约保存 QA，校验题目、答案、解析，保留后端题型值，支持新增、编辑、单条删除与空状态。
- `src/pages/LicenseAdmin.vue`：将既有 SOP 上传→QA 生成链路呈现为“生成练习”；重构列表字段、任务状态/进度、题目复核入口和失败提示；移除错误的第二套 QA 保存路径；保留批量删除循环。
- `src/pages/components/licenseAdmin/searchForm.vue`：加强名称搜索与组织筛选提示，修正岗位查询误将 `position_id` 当作 `department_id` 的参数问题。
- `src/pages/components/licenseAdmin/editDrawer.vue`：补齐编辑加载状态收尾和接口错误提示。
- 更新本目录下映射、决策、待办、交接和验收文档。

### 本阶段边界

- 未修改 `D:\PL\eap\beat-backend` 的正式代码或文档；后端保存契约可由前端修正匹配。
- 未修改数据库、迁移、Docker、`docker.env`、菜单、路由或考试相关页面/接口。
- 未将参考原型的分类常量、localStorage 数据或资料库接口写入正式练习页面。

## 练习管理顶部与筛选区调整

- 修改 `src/pages/LicenseAdmin.vue`：删除顶部“练习管理”标题和说明区，以及对应样式；其余表格、生成、复核、编辑、删除、分页和接口逻辑保持不变。
- 修改 `src/pages/components/licenseAdmin/searchForm.vue`：删除公司、部门、岗位、展开/收起和带删除图标的重置控件；替换为“全部 / 产品 / 运营 / 技术”分类按钮、名称搜索、搜索和重置。
- 分类切换会重新查询列表；当前 SOP 列表接口不支持分类参数，前端只对返回项中的 `sop_type`、`sop_type_name`、`category` 作精确匹配，无法匹配的记录仅在“全部”显示。
- 未修改后端、数据库、接口、Docker 或考试管理；未执行构建和测试。

## 练习管理二级分类筛选

- 修改 `src/pages/components/licenseAdmin/searchForm.vue`：恢复产品、运营、技术各自的二级分类区域；一级“全部”时隐藏，一级切换时自动选择对应“全部××”，重置时清空并隐藏。
- 修改 `src/pages/LicenseAdmin.vue`：分别维护 `activePrimaryCategory` 和 `activeSecondaryCategory`，优先用列表返回的真实分类字段匹配；对单类型字段使用 AI Portal、AI Hub、BEAT、BAMS、公司章程、K8s 到一级分类的前端兼容映射。
- 未修改后端接口、数据库或考试管理；未执行构建和测试。

## SOP 真实分类接入

- `searchForm.vue` 改为由分类树动态渲染一级、二级按钮；“全部”及“全部{一级名称}”仅为前端筛选项。一次一级或二级点击只触发一次列表请求。
- `LicenseAdmin.vue` 请求分类树，列表将名称、类别、版本和格式化时间作为可见列；公司、部门、岗位和题目状态列已隐藏，复核仍保留在操作列。
- 生成练习与编辑抽屉均要求先选一级、再选二级分类，并仅提交 `category_id`；`sop.api.js` 增加分类树调用及上传分类参数。未运行构建或测试。

## 练习管理原型视觉收口

- 读取 `D:\PL\HTML\管理端-练习.html` 和 `category-filter.js`，仅复用筛选、标签、工具栏和表格视觉/交互目标，不使用原型的 localStorage 或 mock 数据。
- 调整 `LicenseAdmin.vue`：名称双行回退、分类标签、未分类灰色标签、操作列不换行、版本空值和统一时间展示；列表请求失败时清空当前表格数据并提示错误。
- 调整 `searchForm.vue`：一级/二级分类按钮尺寸、圆角、间距、悬停态及独立搜索行更接近原型；仍按真实分类 ID 每次点击仅发起一次筛选请求。
- 未修改后端、数据库、接口地址、环境配置、考试功能；未运行构建或测试。

## 练习编辑弹窗改造

- 阅读 `LicenseAdmin.vue`、`editDrawer.vue`、`ReviewDialog.vue`、`sop.api.js` 及 `D:\PL\HTML\管理端-练习.html`，确认编辑、题目复核和分类树的既有调用关系。
- `editDrawer.vue` 由右侧抽屉改为居中、可滚动的 Element Plus 弹窗，按两列表单展示一级/二级分类、上传类型、版本、当前文件和练习描述；取消、关闭和保存后都会销毁局部状态。
- 分类树继续复用父页数据，保存时只提交二级 `category_id`；保存成功后触发既有 `refresh`，由父页保持当前筛选和分页重新加载列表。
- 未改动 `LicenseAdmin.vue`、`ReviewDialog.vue`、`sop.api.js`、后端、数据库或接口路径；未执行构建和测试。

## 练习生成弹窗与真实文件类型调整

- 完整阅读本项目协作文档、`D:\PL\HTML\管理端-练习.html`、`category-filter.js`，并追踪 `LicenseAdmin.vue`、`editDrawer.vue`、`sop.api.js` 与后端 `generate_qa` / loader 注册表。
- `editDrawer.vue`：标签维持两列网格并将 Element Plus 标签设为 `92px`、`white-space: nowrap`；上传类型由 `filename` 后缀优先回显为 `PDF`、`DOC`、`DOCX`、`XLS`、`XLSX`，保持只读，不再显示 SOP 业务类型。
- `LicenseAdmin.vue`：生成练习弹窗改为上传类型、所属类别、细分方向、解析模式、选择文件的紧凑单列表单；删除公司、部门、岗位、发布时间、结束时间及其校验、状态、联动请求。选择格式后 `accept` 精确联动，先选文件可自动识别类型；底部按原型使用右对齐的“取消 / 生成”。
- `sop.api.js`：保留 `files`、`file_type`、`position_id`、`strategy`、`category_id` 请求字段；删除已移除的 `start_time`、`end_time`。后端仍要求岗位，弹窗只读取当前登录用户 `position_id`，缺失时不提交。
- 未修改后端、数据库、Docker、全局主题、其他页面或组织 API；未运行构建和测试。

## 生成练习取消组织依赖

- `src/pages/LicenseAdmin.vue`：删除生成弹窗岗位临时状态、登录态岗位复制、岗位缺失拦截及调用参数；保留真实文件、分类、解析模式校验和生成加载态。
- `src/services/sop.api.js`：岗位参数改为可选兼容参数；仅合法非空值提交，`undefined`、`null`、空字符串、`None`、`null` 和 `0` 均不写入 multipart，解析模式字段保留。
- 未修改用户端混合练习、菜单、路由、数据库结构、迁移、Docker 或租户字段；未运行构建、测试或服务。

## 2026-07-30 通用 PDF 练习解析

- `LicenseAdmin.vue` 将 PDF 的 `file_type` 从 `sop` 改为既有 `operation`，使普通 PDF 走后端已注册的 `OpGuidePdfDataLoader`；DOC/DOCX 与该路径保持一致，XLS/XLSX 仍走 SOP 解析。
- 未改动后端、数据库、Docker 或接口字段；未运行构建、测试或服务。

## 2026-07-30 练习解析与编辑界面收口

- `LicenseAdmin.vue` 删除上传类型和解析模式；`sop.api.js` 不再提交 `file_type`、`strategy` 或岗位，文件选择可混合支持 PDF、DOC、DOCX、XLS、XLSX。
- `ReviewDialog.vue` 的按钮与成功提示改为“保存”；`editDrawer.vue` 缩至 720px，仅显示类别、细分方向和只读练习描述。
- 未修改数据库、Docker、路由或菜单；未运行构建、测试或服务。

## 2026-07-29 考试管理列表改造

- 考试列表改为后端分页、分类/状态/名称筛选；移除逐行加载详情的 N+1 请求。
- 保留四张分类统计卡片、考试抽屉、来源选择、规则配置和发布流程；列表增加分类快捷筛选、工具栏、来源/题型/规则双层展示、刷新、选择与批量删除。
- 批量删除只允许勾选后端标记为可删除的草稿；未运行构建、测试或服务。
- 补充当前 `eap-chat` / `eap-exam` Docker 运行态与安全重建步骤；未执行容器重建。

## 2026-07-31 考试管理预览与编辑

- 列表表格统一为 64px 单元格容器；分类双标签和预览/编辑/删除操作均使用同一垂直居中布局。
- `ExamPreviewDialog.vue` 读取考试详情和服务端分页的已发布试卷快照；草稿明确显示尚未生成固定试卷，不再把候选题目伪装为实际试卷。
- 编辑抽屉增加详情加载态和请求序号保护，编辑不同考试不会被旧详情响应覆盖；保存后仍复用既有刷新当前筛选和分页的逻辑。
- 未执行构建、测试、服务、数据库操作或迁移。

## 2026-07-31 考试操作按钮无响应

- Element Plus 表格行是 Vue 响应式 Proxy，`structuredClone(row)` 会在预览和编辑点击处理函数中抛出 `DataCloneError`，导致弹窗状态未更新。
- 改为 `structuredClone(toRaw(row))`；Vite 热更新即可在本地开发页生效，生产静态前端仍需重建发布。
# 2026-08-03 `.agents` 审查与更新

- 仅检查并更新 `.agents`；未改业务代码、配置、依赖或环境文件，未运行构建、测试、服务或容器操作。
- 以当前 `package.json`、路由、静态菜单、服务封装、Vite、Dockerfile、Nginx 模板和 Git 状态为准，移除互相矛盾的历史运行态与未实现结论。
- 明确当前无测试、Lint、格式化、CI 和 Compose 配置；保留用户执行验证、代理边界、接口契约确认和敏感信息保护要求。

## 2026-08-03 Web 用户端第一阶段基础框架

- 新增独立的 `/web` 路由、Web 用户端 Layout、端类型导航、功能菜单、顶部栏、公共内容容器与首页/学习/练习/考试占位入口；未复用或修改管理端 Layout、菜单和业务页面。
- 顶部栏从现有 Pinia `userInfo.name` 读取用户名称，缺失时显示三语“当前用户”占位；用户端/App/H5 独立跳转地址尚未确认，因此保持禁用状态。
- 新增 `web` 三语文案与限定在 `.web-user-layout` 下的样式变量；未创建接口、mock 数据、service、store 或 hook，未运行构建、测试、服务或容器操作。

## 2026-08-03 管理端与 Web 用户端双向导航

- `LayoutVertical/index.vue` 的既有端类型栏新增 Web 端 button，使用 Vue Router 的 `WebUserHome` 路由 name 进入 `/web/home`；保留原有用户端 iframe 及 `activeDuan` 行为。
- `WebUserTerminalNav.vue` 的管理端入口改为已确认的 `Dashboard` 路由 name，返回 `/dashboard`；未新增主机、端口、接口或 mock 数据，未运行构建、测试、服务或容器操作。

## 2026-08-03 Web 用户端练习页

- `pages/webUser/practice/index.vue` 从占位页面改为筛选、禁用的综合练习区域、列表总数与正式空状态；当前 `practices` 保持空数组，不请求用户端以外的接口，也不使用 mock、localStorage 或管理端 SOP 数据。
- 新增实际被页面使用的 `PracticeCard.vue`，仅接收明确标注为页面展示模型的字段，并通过 `start` emit 将动作交还给页面；历史练习按钮保持禁用。
- 页面未来以 `{ sopId, sopName }` 进入 `ChatExam` 并带固定 `entry=web-practice`。`ChatExam.vue` 仅新增该固定标识的安全返回分支，其他入口仍返回 `/chat/sop`；未改会话、SSE、接口、历史或鉴权逻辑。
- 新增练习页三语文案；未运行构建、测试、服务或容器操作。

## 2026-08-03 Web 用户端练习筛选与综合练习视觉修正

- Web 练习页复用管理端 `getSopCategoryTree()` 的 `{ id, name, children }` 分类树和一级切换时清空二级选择的规则；没有复用管理端 `searchForm.vue`，因为其与管理端表格查询、参数和中文文案耦合。
- 一级“全部 / 产品 / 运营 / 技术”仍为页面状态；选择具体一级后显示真实 `children` 二级分类，保留二级 `id`，失败时显示轻量提示且不伪造分类。该请求仅取分类树，未调用练习列表 `getSops`。
- 搜索区移到分类区下方左侧；综合练习改为白色卡片和可点击主按钮，点击仅提示三语“暂未开放”。空状态将筛选无结果的主标题与辅助说明分离，避免重复文案。
- 未修改 ChatExam、管理端、列表接口、后端、数据库、Docker 或代理，未运行构建、测试、服务或容器操作。

## 2026-08-03 Web 用户端练习列表接入

- 新增独立用户端练习 service，并复用 `sopApi` 的认证和 401 处理；请求参数由页面 camelCase 映射为后端 snake_case，响应只在 service 中映射为卡片模型。
- 练习页接入真实列表、分类筛选、关键词、服务端分页、加载/空/错误/重试状态；卡片改为展示填空题、问答题、总题量和真实可空进度。
- 同步中文、英文、泰文文案，移除 Web 练习页对“选择题数量”和“继续练习”的使用；删除 `sop.api.js` 中未使用的 Router 调用。
- 未运行构建、开发服务、Docker 或真实接口；未修改后端、数据库、运行容器或 ChatExam。

## 2026-08-04 Web 用户端考试页面

- `pages/webUser/exam/index.vue` 由占位页改为筛选面板、真实分类树、状态切换、加载/错误/空态、分页状态和响应式考试列表容器；当前没有用户端考试列表契约，列表始终保持空数组，不调用管理端 `/exam-api/api/v1/exams`。
- 新增 `components/webUser/exam/ExamCard.vue`，定义未来稳定展示模型的卡片结构、类别样式映射、时间/题量/时长/总分展示及禁用操作视觉；未构造示例考试。
- 三语新增用户端考试文案。未修改路由、管理端考试页、后端、数据库、代理、Docker 或环境变量；未运行构建、测试、服务或真实接口。

## 2026-08-04 ChatExam 请求与错误边界

- `/chatapi/v1/exams/answer` 改为直接发送后端 `TrainParams` 所需的顶层 `session_id`、`messages` 和流式字段，移除导致 FastAPI 422 的 `input` 包装与未使用文件名字段。
- `/v1/exams/start` 和 `/v1/exams/answer` 均在解析前校验 HTTP 状态；非 2xx 或空响应体不再作为 SSE 读取，页面显示既有错误提示并在 Console 输出响应信息。
- 未运行构建、测试、服务或容器操作；未改前端代理、环境变量、数据库或其他业务页面。

## 2026-08-04 Web 用户端考试筛选视觉与二级分类调整

- `pages/webUser/exam/index.vue` 复用已确认的 `getSopCategoryTree()` 返回值：一级切换保存真实一级 `id`、清空二级 `id`；选择“全部”时二级栏隐藏且两个分类 ID 均为 `null`；二级按钮只从所选一级的真实 `children` 渲染。
- 筛选卡、横向浅蓝二级分类区、两行搜索、紧凑三段状态栏、列表标题和两列卡片间距按 `D:\PL\HTML\用户端-考试.html` 的颜色、圆角、阴影与密度调整；空态保留在列表区域，不添加演示考试。
- 当前仍未确认用户端考试列表及二级分类请求契约，因此未调用管理端 `/exam-api`、未新建 service、未发送分类或状态参数；未修改管理端考试页、路由、后端、数据库、Docker 或配置，未运行构建、测试、服务或真实接口。

## 2026-08-04 Web 用户端考试第一阶段接入

- 新增 `services/webUser/exam.service.js`，通过既有 `sopApi` 的 token/401 处理和 `/exam-api` 前缀调用用户端列表、状态统计和详情接口；snake_case 仅在 adapter 中转换为稳定卡片 ViewModel。
- 考试页现已真实请求列表与 counts，并支持分类、关键词、状态、分页、加载、错误重试与请求竞态保护；未调用管理端 CRUD、Smart Practice 或 mock/localStorage。
- 考试卡片按真实题型聚合显示填空题、选择题、问答题或未知题型，且开始/继续/结果/历史按钮全部禁用并有三语说明。
- 未运行构建、开发服务、真实接口、Docker 或数据库操作。

## 2026-08-04 Web 用户端考试第二阶段

- `src/services/webUser/study.service.js` 将资料列表现有 `file_url` 集中映射为 `fileUrl`，继续沿用 `title`、`fileType` 展示字段和原列表接口。
- `src/pages/webUser/study/index.vue` 启用卡片“查看”，复用管理端纯展示 `officeCheck.vue` / `OfficeViewer`，按既有规则使用 `/mobileapi/${fileUrl}` 打开单个全屏预览；关闭后保留当前筛选和分页。
- 缺少 `fileUrl` 时使用三语 Element Plus 提示，不打开空预览；不支持类型和加载失败继续由现有预览组件处理。
- 未修改管理端、路由、公共 Layout、接口参数、代理、权限、依赖或部署；未运行构建、测试、服务或容器操作，验证由用户执行。

## 2026-08-05 多端统一入口

- `global` Pinia store 新增并持久化 `currentPlatform`；端类型切换仅保存 `admin` / `web`，不保存敏感数据。
- `LayoutVertical` 根据平台切换管理端权限菜单或 Web 的首页、学习、练习、考试菜单；Web 端按钮与管理端按钮均回到 `/dashboard`，Web 子菜单继续沿用既有 `/web/*` 路由并复用同一 Layout。
- `/dashboard` 在 Web 平台直接复用 `pages/webUser/home/index.vue`，管理端仪表盘请求仅在管理端显示时加载；未修改接口、代理、权限、部署或路由路径，未运行构建、测试、服务或容器。

## 2026-08-05 Web 平台顶部标题

- `Breadcrumb.vue` 在 `currentPlatform === 'web'` 时不再读取 `/dashboard` 的管理端面包屑配置；Web 首页从当前菜单读取标题，子页面优先使用各自路由的 `meta.titleKey`。
- 管理端继续使用原有 `authStore.breadcrumbListGet` 与路由标题逻辑；未修改路由、菜单、接口或左侧导航，未运行构建、测试、服务或容器。

## 2026-08-05 Web 平台顶部菜单图标

- `LayoutVertical` 向 Header 提供当前 Web 静态菜单配置；`Breadcrumb.vue` 按当前激活菜单路径复用其 `meta.icon`，并继续使用路由的 `meta.titleKey` 输出页面标题。
- `/dashboard` 在 Web 平台显示 `House + 首页`；学习、练习、考试分别复用其菜单图标和已有“中心”标题。管理端仍使用原有 `authStore.breadcrumbListGet`，未修改路由、接口、依赖或业务页面。
- 未运行构建、测试、服务或容器，待用户验证平台切换和各 Web 菜单标题。
- 考试卡片按后端 `can_start/can_continue` 启用开始/继续；开始经确认框调用正式 Exam API，成功进入 Web 用户端答题路由。
- 新增答题页：恢复安全试卷、展示五类题型、自动/切题保存、进度、基于 server_now/expires_at 的倒计时及超时锁定；不使用 localStorage，不调用 ChatExam。
- 未运行构建、服务或真实接口。

## 2026-08-04 Web 用户端考试第三阶段

- 答题页新增确认交卷、最新答案保存等待、提交中保护及倒计时到零后的尽力交卷；成功后固定跳转结果页，不再保留可编辑状态。
- 新增 `/web/exam/:examId/result`，使用 submit/result 正式接口展示评分中或已评分汇总和逐题结果；仅以后端 `showAnswer` 决定是否渲染正确答案与分析。
- 列表“查看结果”按后端 `can_view_result` 启用。三语文案同步；未运行构建、服务、Docker、数据库或真实接口。

## 2026-08-04 考试重新发布与用户端卡片 tooltip

- 管理端发布步骤只允许编辑开始时间；预计结束时间只读展示并按开始时间加考试时长计算，提交不再发送 `end_time`。已结束考试默认进入重新发布选择，必须改为未来开始时间，并显示独立确认提示。
- Web 用户端考试卡片仅在按钮禁用且提示文案非空时渲染 `el-tooltip`；正常可用的开始/继续/查看结果按钮不再创建空 tooltip，所有保留 tooltip 均关闭箭头。
- 同步中、英、泰文案；未修改路由、API 路径、数据库、Docker 或配置，未运行构建、服务或真实接口。
# 2026-08-05 智能陪练结构化答题消息

- `ChatExam.vue` 进入页面后自动创建或恢复会话，内部发送首题请求但不渲染“开始考试”用户消息；初始化失败显示可重试入口。
- 前端按 SSE `result`、`next_question`、`summary` 事件分别创建教练消息对象，保留 `[DONE]`、metadata 与旧文本 SSE 的兼容分支。
- 未运行构建、测试、服务或容器操作；根目录协作规则要求由用户执行验证。

## 2026-08-04 Web 用户端首页

- `src/pages/webUser/home/`：将首页占位页实现为欢迎/学习概览、最近学习、AI 推荐课程、今日学习计划、待参加考试与学习数据六个私有展示组件；页面布局使用既有 Web Layout 的 1440px 内容容器和 1199px 栅格降级规则。
- 首页 mock 展示模型仅保留在 `pages/webUser/home/index.vue`，经用户明确授权用于无用户端接口阶段；未新增 service、Axios 实例、localStorage 数据或管理端接口调用。后续接入接口时应以用户端契约替换该展示模型。
- 首页的“开始练习 / 继续练习”通过 `WebUserPractice` 路由进入 `/web/practice`，考试操作通过 `WebUserExam` 路由进入 `/web/exam`；顶部真实用户名继续由现有 `WebUserTopBar.vue` 的 `userInfo.name` 处理。
- `src/languages/modules/{zh,en,th}.ts`：同步新增首页可见文案，未改导航、路由或公共 Layout。
- 修复首页卡片重叠：移除“最近学习”卡片的百分比最小高度，令 CSS Grid 以卡片实际内容参与首行高度计算，避免其底部操作区溢出覆盖下一行。
- 修复内容区留白：`WebPageContainer.vue` 使用 `border-box` 的 `min(100%, 1440px)` 容器宽度，保留统一 28px 内边距，使页面卡片与功能菜单之间稳定分隔。
- 首页文案调整：推荐区标题改为“练习”，相关操作按钮改为“开始练习 / 继续练习”，并同步英文、泰文翻译。
- 首页考试操作文案调整为“开始考试”，并同步英文、泰文翻译；跳转仍指向 `/web/exam`。
- 已执行 `git diff --check`，无空白错误；按项目规则未运行构建、测试、服务或容器操作，需由用户验证首页视觉、跳转、登录用户名和 `npm run build`。

## 2026-08-05 Web 用户端首页真实练习与考试数据接入

- 首页新增 `services/webUser/home.service.js`，从专用用户端首页接口读取练习和待参加考试；移除首页的本地 mock 展示数据。开始练习始终跳转 `WebUserPractice`，开始考试跳转 `WebUserExam`。
- 练习、考试卡片均支持加载、失败重试、真实空数据；最近学习、今日计划、整体学习进度、学习数据因当前没有用户学习/练习记录表而明确显示空状态，不伪造个人数据。
- 增加开发代理和生产 Nginx 代理配置，生产环境需注入 `WEB_USER_HOME_API_HOST`。补齐中英泰文案；未运行构建、测试、服务、容器或数据库操作。

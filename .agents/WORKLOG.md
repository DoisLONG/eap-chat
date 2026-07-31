# 本次工作记录

## 2026-07-31 考试分类标签

- `src/pages/examManagement/index.vue` 的分类列改为复用练习管理的双标签视觉：一级分类为蓝色圆角标签，二级分类为灰色圆角标签；混合考试仅显示一级“混合”标签。
- 未修改考试接口、后端、数据库、路由或 Docker；未运行构建、测试或服务。

## 2026-07-30 练习描述

- 生成弹窗新增可选练习描述；编辑弹窗改为可输入并提交同一 `description` 字段。
- 未执行构建、测试、数据库迁移、容器或服务器操作。

## 2026-07-30 开发代理地址

- `vite.config.js`：将全部当前生效的 Vite 开发代理 `target` IP 改为 `118.196.142.69`，保留各接口端口、前缀和重写规则；注释中的备用地址未改。
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

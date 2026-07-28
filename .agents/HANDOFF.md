# 会话交接

## 学练考评恢复（2026-07-28）

- 练习管理来源：`zyh`/`d110508`；考试管理来源：`5a013fe`。
- 考试页面、菜单、路由、三语文案与 `exam.api.js` 已在 HEAD；后端仍没有管理端 CRUD/发布接口。

## 定位信息

- 项目：`D:\PL\eap-chat`
- 技术栈：Vue 3、Vite、Vue Router、Pinia、Element Plus、Axios、Vue I18n、npm。
- Dockerfile：`D:\PL\eap-chat\Dockerfile`
- Nginx 模板：`D:\PL\eap-chat\nginx.conf.template`
- 运行容器：`eap-chat`；镜像：`eap-chat:local`；容器内/Nginx 端口 `80`；宿主端口 `8080`。
- 运行时变量值与 `docker.env` 一致；源码无自动加载逻辑，实际外部注入命令待确认。

## 页面链路

- 菜单文件：`D:\PL\eap-chat\src\stores\modules\auth.ts`
- 路由文件：`D:\PL\eap-chat\src\router\index.js`
- 左侧菜单渲染：`D:\PL\eap-chat\src\layouts\LayoutVertical\index.vue`、`src\layouts\components\Menu\SubMenu.vue`
- 练习管理页面：`D:\PL\eap-chat\src\pages\LicenseAdmin.vue`
- 子组件：`src\pages\components\licenseAdmin\searchForm.vue`、`editDrawer.vue`、`src\components\exam\ReviewDialog.vue`
- 练习 API：`D:\PL\eap-chat\src\services\sop.api.js`；`company.service.js` 仍供生成练习弹窗的组织选择使用，已不用于列表筛选。
- 练习浏览器前缀：`/sop-api`，由 `SOP_API_HOST` 转发至运行态 `118.196.142.69:6007`；组织选择经 `/companyapi`、`COMPANY_API_HOST` 至 `118.196.142.69:8010`。
- QA 保存已统一：`POST /sop-api/v1/dataprep/qa/save`，请求体为 `{ sop_info_id, file_name, records }`。每条记录必须有 `question`、`answer`、`content`；当前业务还必须传有效 `sop_info_id` 才能创建版本。
- 练习页面已在原路由内完成第三阶段 A 改造：`LicenseAdmin.vue`、`searchForm.vue`、`editDrawer.vue`、`ReviewDialog.vue` 和 `sop.api.js`。无后端、数据库、菜单或路由改动。
- 当前筛选区没有独立顶部标题，含一级/二级分类按钮和名称搜索。分别使用 `activePrimaryCategory`、`activeSecondaryCategory`；一级“全部”隐藏二级区域。列表优先匹配 `primary_category`、`secondary_category`、`sop_type`、`sop_type_name`、`category`、`category_name`，并对单类型字段采用二级到一级的前端兼容映射；无分类字段的记录仅显示在“全部”。

## 参考与考试

- 练习参考：`D:\PL\eap-chat\reference-ui\管理端-练习.html`
- 考试参考：`D:\PL\eap-chat\reference-ui\管理端-考试.html`
- 分类原型：`D:\PL\eap-chat\reference-ui\category-filter.js`
- 考试会话残留：`src\services\chat.service.js`、`src\pages\ChatExam.vue`；未发现正式考试管理 API。
- 考试管理预计新增：`src\pages\examManagement\index.vue`（及必要局部组件）、`src\services\exam.service.js`、路由、auth 菜单和三份语言文件；先确认后端契约后再创建。

## 下一步

1. 由用户手动验证练习列表、名称与分类按钮筛选、SOP 上传生成、任务状态、QA 新增编辑删除保存、单条/批量删除和 SOP 编辑。
2. 如需分类或从资料库选择文件，先确认正式分类数据源、资料接口与 SOP 的关系；不得使用 `reference-ui/category-filter.js` 的原型常量。
3. 考试管理仍未实施。获得确认后，才从 `src/stores/modules/auth.ts`、`src/router/index.js` 和实际后端契约开始最小入口改动。

## SOP 分类（等待用户执行后端迁移）

- 正式接口：`POST /sop-api/v1/dataprep/sop/categories/tree`；练习列表 `POST /sop-api/v1/dataprep/sops` 新增 `name`、`primary_category_id`、`category_id`。
- `LicenseAdmin.vue`、`searchForm.vue`、`editDrawer.vue` 与 `sop.api.js` 已接入分类树和二级分类保存。列表只展示名称、所属类别、版本、创建/更新时间和操作；无分类 SOP 显示“未分类”。
- 后端迁移未执行前，分类树和含 `category_id` 的列表 SQL 不可用于本地库；用户需先执行 `sql/migrations/20260724_add_sop_category.sql`。

## 练习管理视觉实现

- 参考文件已改为 `D:\PL\HTML\管理端-练习.html`、`D:\PL\HTML\category-filter.js`。当前 Vue 页面不嵌入原型 HTML，分类和列表仍使用正式接口。
- 筛选区使用动态分类树、36px 一级按钮与 32px 二级胶囊按钮；名称搜索单独成行。表格仅展示目标列，名称为标题/文件名双行，类别为一级/二级标签，未分类为灰色标签。
- 操作列保留复核题目、编辑、删除；批量删除、分页、上传生成和 QA 流程未改变。列表请求错误时显示空列表而非遗留旧数据。

## 练习编辑弹窗

- `src\pages\components\licenseAdmin\editDrawer.vue` 现为 Element Plus 居中 `el-dialog`（标题“编辑练习”、`72vw`、最大 `1200px`、内容区滚动），不再使用右侧抽屉。
- 弹窗复用父页传入的分类树；先选一级、再选二级，实际保存只调用既有 SOP 更新接口并提交二级 `category_id`。保存成功后向 `LicenseAdmin.vue` 触发既有 `refresh`，当前筛选/分页状态不变。
- 上传类型、版本、当前文件和练习描述为只读展示：当前 SOP 更新接口未提供这些字段的持久化能力。编辑弹窗不加载 QA；题目复核仍只通过 `ReviewDialog.vue` 完成。

## 本次练习生成弹窗调整

- `LicenseAdmin.vue` 的真实生成入口已调整为单列：上传类型、所属类别、细分方向、解析模式、选择文件。公司、部门、岗位、发布时间、结束时间及其局部状态、校验、组织查询都已删除，未影响其他页面的组织 API。
- 上传类型显示并自动识别真实后缀 `PDF`、`DOC`、`DOCX`、`XLS`、`XLSX`；Element Plus 文件选择器的 `accept` 与选择类型联动。服务端仍用既有 `file_type` 枚举，当前映射 PDF/XLS/XLSX→`sop`、DOC/DOCX→`operation`，未改请求字段名。
- 生成练习不再读取、校验或提交登录用户的 `position_id`；文件、分类和解析模式校验及加载态保留。后端将岗位作为可选归属处理，缺省记录不会因此阻断生成。
- 编辑弹窗的两列标签宽度固定为 92px 且不换行；上传类型按已有文件名后缀只读回显，不再显示“SOP 文件”。原型底部按钮已落实为右对齐“取消 / 生成”。

## 岗位解绑边界

- 用户端 Smart Practice 的混合练习仍按岗位筛选，未作改动；无岗位生成的题目不会自动进入该链路。
- 前端不新增或提交 tenant 字段；Dataprep 当前也未从可信身份写入或过滤 `tenant_id`。租户隔离需后续由服务端鉴权上下文单独实现。
- 未修改数据库结构或迁移；岗位为空由后端写入 SQL `NULL`，不以 `0` 或固定岗位替代。

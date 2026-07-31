# 菜单、路由与 API 映射

## 恢复后的实际映射（2026-07-28）

| 功能 | 前端页面 | 前端 API | 请求路径 | 后端路由 | 状态 |
|---|---|---|---|---|---|
| 练习分类 | `LicenseAdmin.vue` | `getSopCategoryTree` | `POST /sop-api/v1/dataprep/sop/categories/tree` | Dataprep 分类树路由 | 已确认，唯一导出 |
| 考试管理 | `examManagement/index.vue` | `exam.api.js` | 无（明确 unavailable） | 无 CRUD/发布路由 | 前端恢复；后端缺失 |
| 用户答题 | `ChatExam.vue` | `chat.service.js` | `/chatapi/v1/exams/{start,answer,finish}` | Smart Practice | 非管理接口 |

绝对路径均位于 `D:\PL\eap-chat`。确认状态中的“前端+代理已确认”不代表后端业务契约已经联调。

| 功能 | 菜单配置文件 | 菜单权限码 | 浏览器路由 | 路由配置文件 | 页面组件 | 子组件 | API封装文件 | 请求方法 | 浏览器请求路径 | Nginx转发规则 | 环境变量 | 后端地址/端口 | 确认状态 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 培训中心 | `src/stores/modules/auth.ts` | 未发现 | `/trainingCenter` | `src/router/index.js` | 布局父路由，无独立组件 | `LayoutVertical`、`SubMenu` | 无 | 无 | 无 | 无 | 无 | 无 | 已确认静态菜单/路由 |
| 练习管理入口 | `src/stores/modules/auth.ts` | 未发现；页面含待确认 `v-auth='add'` | `/trainingCenter/practiceManagement` | `src/router/index.js` | `src/pages/LicenseAdmin.vue` | `ProTable`、`searchForm.vue`、`editDrawer.vue`、`ReviewDialog.vue` | 多个见下列 | — | — | — | — | — | 已确认 |
| 练习列表 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `ProTable`、`searchForm.vue` | `src/services/sop.api.js` `getSops` | POST | `/sop-api/v1/dataprep/sops` | `/sop-api/ → http://$SOP_API_HOST/` | `SOP_API_HOST` | `118.196.142.69:6007` | 前端+代理已确认 |
| 练习名称/组织筛选 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `searchForm.vue` | `sop.api.js`、`company.service.js` | POST | `/sop-api/v1/dataprep/sops`；`/companyapi/v1/company/query`、`department/query`、`position/query` | 对应 `/sop-api/`、`/companyapi/` | `SOP_API_HOST`、`COMPANY_API_HOST` | `118.196.142.69:6007`；`118.196.142.69:8010` | 前端+代理已确认；无一级/二级分类筛选 |
| 导入资料并生成 QA（生成练习） | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | Element Plus 上传表单 | `sop.api.js` `generateQa` | POST multipart | `/sop-api/v1/dataprep/generate_qa` | `/sop-api/ → http://$SOP_API_HOST/` | `SOP_API_HOST` | `118.196.142.69:6007` | 发送文件、二级 `category_id` 与可选 `description`；本阶段将现有上传 SOP→生成 QA 流程展示为“生成练习” |
| 生成任务状态 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | Element Plus `Progress`、`Tag` | `sop.api.js` `getTaskStatus` | POST | `/sop-api/v1/dataprep/task_status` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认；仅在后端实际返回百分比时展示确定进度，否则显示生成状态 |
| 题目列表/详情 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `components/exam/ReviewDialog.vue` | `sop.api.js` `getQaList` | POST | `/sop-api/v1/dataprep/qa/list` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认 |
| 题目编辑、删除、新增（复核） | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `ReviewDialog.vue` | `sop.api.js` `saveQaList` | POST | `/sop-api/v1/dataprep/qa/save` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认；保存请求使用唯一对象契约，见下节 |
| 练习/SOP 编辑 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `components/licenseAdmin/editDrawer.vue` | `sop.api.js` `updateSopTitle` | POST | `/sop-api/v1/dataprep/sops/record/update` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认；提交既有标题/组织字段与可选 `description` |
| 单条/批量删除 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `ProTable` | `sop.api.js` `deleteSop` | POST | `/sop-api/v1/dataprep/delete_sop` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认 |
| 资料选择（参考目标） | 不存在 | 待确认 | 不存在 | 不存在 | 不存在 | 现有资料库可供调研 | `mobile.service.js` 有资料列表 | GET | `/mobileapi/api/v1/materials/list` | `/mobileapi/ → http://$MOBILE_API_HOST/` | `MOBILE_API_HOST` | `118.196.142.69:7010` | 仅可复用线索；尚未接入练习页 |
| 考试管理 | 不存在 | 未发现 | 不存在 | 不存在 | 不存在 | 不存在 | 未发现专用封装 | — | — | — | — | — | 待新增 |
| 用户考试会话（非管理页） | 无左侧菜单 | 未发现 | `/chat/exam` | `src/router/index.js` | `src/pages/ChatExam.vue` | — | `src/services/chat.service.js` | POST / 流式 POST | `/chatapi/v1/exams/start`、`answer`、`finish` | `/chatapi/ → http://$CHAT_API_HOST/` | `CHAT_API_HOST` | `118.196.142.69:9010` | 已确认；不等同考试管理 |

## QA 保存契约（第三阶段 A 已收口）

- 服务端实现：`D:\PL\eap\beat-backend\src\comps\dataprep\main.py` 的 `update`；浏览器经 `/sop-api/` 转发。
- HTTP：`POST /sop-api/v1/dataprep/qa/save`，JSON 请求体必须为一个对象：`{ sop_info_id, file_name, records }`。
- `records` 是 QA 数组；每一项后端必填 `question`、`answer`、`content`。前端同时传递并保留 `row`、`position`、`position_id`、`type`、`difficulty_factor`；其中 `type` 使用后端已生成的中文值（`填空题` / `问答题`），不再写入界面翻译值。
- `file_name` 是后端声明的必填参数；`sop_info_id` 在函数签名有默认值，但保存完成时会创建 `sop_version`，因此当前业务链路中也必须提供有效 SOP ID。
- 成功响应：`{ status: 200, message: "成功", result: "修改成功" }`。缺少单条必填字段时，处理函数返回 `{ status: 500, message, record }`；HTTP/服务异常的外层结构仍需联调确认。
- QA 列表 `POST /sop-api/v1/dataprep/qa/list` 使用 `{ id: sop_info_id }`，返回 `results` 项含 `id`、`row`、`position`、`question`、`answer`、`content`、`type`、`difficulty_factor`、`position_id`。

## 考试管理预计映射（待确认）

| 事项 | 当前已有能力 | 后续最小改动 | 待确认 |
|---|---|---|---|
| 左侧菜单 | 静态 Pinia 菜单 | `src/stores/modules/auth.ts` 加入培训中心子项；增加 i18n 文案 | 是否将来接入后端菜单/权限码 |
| 路由 | 静态 router | `src/router/index.js` 注册 `/trainingCenter/examManagement` | 路由名及权限策略 |
| 页面 | Element Plus、ProTable、抽屉/弹窗模式可复用 | 新建 `src/pages/examManagement/index.vue`，按实际复杂度再加局部组件 | 后端字段、状态及发布流程 |
| 分类筛选 | 无正式统一来源 | 先确认分类数据契约；双页面稳定后才抽公共组件 | 一级/二级分类接口与数据归属 |
| 考试 API | 仅用户答题会话与统计 | 新建 `src/services/exam.service.js` 仅在后端契约确认后 | 列表、试卷、题目来源、发布、记录 API |

## 考试管理已确认映射（2026-07-31）

| 功能 | 前端请求 | 后端路由 | 说明 |
|---|---|---|---|
| 考试列表/筛选 | `GET /exam-api/api/v1/exams` | `GET /api/v1/exams` | 名称、状态、一级/二级分类、`exam_type` 和分页 |
| 详情/编辑回填 | `GET /exam-api/api/v1/exams/{id}` | `GET /api/v1/exams/{id}` | 返回基础信息、来源、规则、范围和发布设置，不返回整卷题目 |
| 真实题目预览 | `GET /exam-api/api/v1/exams/{id}/questions` | `GET /api/v1/exams/{id}/questions` | 仅返回已发布/结束考试的快照题目，服务端分页 |

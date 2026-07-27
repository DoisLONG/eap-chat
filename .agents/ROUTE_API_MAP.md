# 菜单、路由与 API 映射

绝对路径均位于 `D:\PL\eap-chat`。确认状态中的“前端+代理已确认”不代表后端业务契约已经联调。

| 功能 | 菜单配置文件 | 菜单权限码 | 浏览器路由 | 路由配置文件 | 页面组件 | 子组件 | API封装文件 | 请求方法 | 浏览器请求路径 | Nginx转发规则 | 环境变量 | 后端地址/端口 | 确认状态 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 培训中心 | `src/stores/modules/auth.ts` | 未发现 | `/trainingCenter` | `src/router/index.js` | 布局父路由，无独立组件 | `LayoutVertical`、`SubMenu` | 无 | 无 | 无 | 无 | 无 | 无 | 已确认静态菜单/路由 |
| 练习管理入口 | `src/stores/modules/auth.ts` | 未发现；页面含待确认 `v-auth='add'` | `/trainingCenter/practiceManagement` | `src/router/index.js` | `src/pages/LicenseAdmin.vue` | `ProTable`、`searchForm.vue`、`editDrawer.vue`、`ReviewDialog.vue` | 多个见下列 | — | — | — | — | — | 已确认 |
| 练习列表 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `ProTable`、`searchForm.vue` | `src/services/sop.api.js` `getSops` | POST | `/sop-api/v1/dataprep/sops` | `/sop-api/ → http://$SOP_API_HOST/` | `SOP_API_HOST` | `118.196.142.69:6007` | 前端+代理已确认 |
| 练习名称/组织筛选 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `searchForm.vue` | `sop.api.js`、`company.service.js` | POST | `/sop-api/v1/dataprep/sops`；`/companyapi/v1/company/query`、`department/query`、`position/query` | 对应 `/sop-api/`、`/companyapi/` | `SOP_API_HOST`、`COMPANY_API_HOST` | `118.196.142.69:6007`；`118.196.142.69:8010` | 前端+代理已确认；无一级/二级分类筛选 |
| 导入资料并生成 QA | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | Element Plus 上传表单 | `sop.api.js` `generateQa` | POST multipart | `/sop-api/v1/dataprep/generate_qa` | `/sop-api/ → http://$SOP_API_HOST/` | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认；是否等同参考“生成练习”待确认 |
| 生成任务状态 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | — | `sop.api.js` `getTaskStatus`；页面也直接 fetch | POST | `/sop-api/v1/dataprep/task_status` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认 |
| 题目列表/详情 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `components/exam/ReviewDialog.vue` | `sop.api.js` `getQaList` | POST | `/sop-api/v1/dataprep/qa/list` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认 |
| 题目编辑、删除、新增（复核） | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `ReviewDialog.vue` | `sop.api.js` `saveQaList` | POST | `/sop-api/v1/dataprep/qa/save` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | UI 已确认；`saveQaList` 形参与调用体不一致，后端契约待确认 |
| 练习/SOP 编辑 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `components/licenseAdmin/editDrawer.vue` | `sop.api.js` `updateSopTitle` | POST | `/sop-api/v1/dataprep/sops/record/update` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认；仅标题与组织字段 |
| 单条/批量删除 | 同上 | 同上 | 同上 | 同上 | `LicenseAdmin.vue` | `ProTable` | `sop.api.js` `deleteSop` | POST | `/sop-api/v1/dataprep/delete_sop` | 同上 | `SOP_API_HOST` | `118.196.142.69:6007` | 已确认 |
| 资料选择（参考目标） | 不存在 | 待确认 | 不存在 | 不存在 | 不存在 | 现有资料库可供调研 | `mobile.service.js` 有资料列表 | GET | `/mobileapi/api/v1/materials/list` | `/mobileapi/ → http://$MOBILE_API_HOST/` | `MOBILE_API_HOST` | `118.196.142.69:7010` | 仅可复用线索；尚未接入练习页 |
| 考试管理 | 不存在 | 未发现 | 不存在 | 不存在 | 不存在 | 不存在 | 未发现专用封装 | — | — | — | — | — | 待新增 |
| 用户考试会话（非管理页） | 无左侧菜单 | 未发现 | `/chat/exam` | `src/router/index.js` | `src/pages/ChatExam.vue` | — | `src/services/chat.service.js` | POST / 流式 POST | `/chatapi/v1/exams/start`、`answer`、`finish` | `/chatapi/ → http://$CHAT_API_HOST/` | `CHAT_API_HOST` | `118.196.142.69:9010` | 已确认；不等同考试管理 |

## 考试管理预计映射（待确认）

| 事项 | 当前已有能力 | 后续最小改动 | 待确认 |
|---|---|---|---|
| 左侧菜单 | 静态 Pinia 菜单 | `src/stores/modules/auth.ts` 加入培训中心子项；增加 i18n 文案 | 是否将来接入后端菜单/权限码 |
| 路由 | 静态 router | `src/router/index.js` 注册 `/trainingCenter/examManagement` | 路由名及权限策略 |
| 页面 | Element Plus、ProTable、抽屉/弹窗模式可复用 | 新建 `src/pages/examManagement/index.vue`，按实际复杂度再加局部组件 | 后端字段、状态及发布流程 |
| 分类筛选 | 无正式统一来源 | 先确认分类数据契约；双页面稳定后才抽公共组件 | 一级/二级分类接口与数据归属 |
| 考试 API | 仅用户答题会话与统计 | 新建 `src/services/exam.service.js` 仅在后端契约确认后 | 列表、试卷、题目来源、发布、记录 API |


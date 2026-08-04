# 菜单、路由与 API 映射

本表仅依据当前前端源码、Vite 配置和 Nginx 模板。路径存在不等于已完成后端联调。

## 培训中心

| 菜单/路由 | 页面 | 直接服务 | 变更时同时检查 |
| --- | --- | --- | --- |
| `/trainingCenter/studyManagement` | `pages/courseManagement/index.vue` | `mobile.service.js` | `auth.ts`、router、i18n、`/mobileapi` 代理 |
| `/trainingCenter/practiceManagement` | `pages/LicenseAdmin.vue` | `sop.api.js` | `auth.ts`、router、`practiceReview/`、`/sop-api` 代理 |
| `/trainingCenter/practiceManagement/review/:sopId` | `pages/practiceReview/index.vue` | `sop.api.js` | 复核数据和源文件接口；该路由隐藏菜单 |
| `/trainingCenter/examManagement` | `pages/examManagement/index.vue` | `exam.api.js`、`sop.api.js` | `auth.ts`、router、三语文案、`/exam-api` 与 `/sop-api` 代理 |

## 当前代理边界

| 浏览器前缀 | 前端服务模块 | Nginx 环境变量 |
| --- | --- | --- |
| `/sop-api` | `sop.api.js` | `SOP_API_HOST` |
| `/exam-api` | `exam.api.js` | `EXAM_API_HOST` |
| `/chatapi` | `chat.service.js` | `CHAT_API_HOST` |
| `/companyapi` | `company.service.js` | `COMPANY_API_HOST` |
| `/chathistoryapi` | `chatHistory.service.js` | `CHAT_HISTORY_API_HOST` |
| `/userapi` | `user.service.js` | `USER_API_HOST` |
| `/dashboardapi` | `dashboard.service.js` | `DASHBOARD_API_HOST` |
| `/mobileapi`、`/eap/mobileapi` | `mobile.service.js` | `MOBILE_API_HOST` |
| `/videoapi`、`/videoapiv2` | `video.service.js`、`videov2.service.js` | `VIDEO_API_HOST`、`VIDEO_API_HOST_V2` |

`/monitor-api` 与 `/api-153` 也在 Nginx 模板中，但模板将它们指向固定上游，当前代码分别经 `monitor.service.js` 与 `license.service.js` 调用。修改这些边界前需先确认目标环境；不得把固定地址复制进代码或协作文档。

## 高影响接口封装

- `sop.api.js`：SOP 列表、分类树、QA 生成/轮询/复核/保存、SOP 更新和删除。
- `exam.api.js`：考试列表、详情、题目分页、创建/更新、来源/规则/对象保存、发布/撤回和删除；接口根路径为 `/api/v1/exams`，由 `/exam-api` 代理。
- `chat.service.js`：用户答题会话，不等同于考试管理。
- `services/webUser/exam.service.js`：Web 用户端正式考试列表、开始、恢复、单题保存、交卷与结果，经 `/exam-api`，不调用 `/chatapi`。
- `company.service.js`、`user.service.js`、`mobile.service.js`、`dashboard.service.js`：分别服务组织/模型配置、认证/用户、课程/素材和仪表盘。

修改 API 前，先从页面调用点追到服务函数，再核对浏览器前缀、Vite rewrite、Nginx `proxy_pass` 和实际后端契约。不要仅因名称相似复用聊天考试接口或假定后端 CRUD、数据库字段、权限码存在。

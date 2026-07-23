# 架构与调用关系

## 前端结构（已确认）

```text
D:\PL\eap-chat\src
├─ main.js / App.vue                 Vue、Router、Pinia、I18n、Element Plus 入口
├─ router\index.js                  静态路由与 token 路由守卫
├─ stores\modules\auth.ts           静态左侧菜单数据及显示过滤
├─ layouts\LayoutVertical\index.vue 管理端双栏布局与左侧菜单渲染
├─ layouts\components\Menu\SubMenu.vue
├─ pages\LicenseAdmin.vue            当前“练习管理”实际路由页面
├─ components\exam\ReviewDialog.vue 题目复核、编辑、删除组件
└─ services\                         Axios 服务封装
```

构建流程为 `src` → Vite `dist` → Docker 第二阶段 `/usr/share/nginx/html` → Nginx。`/eap` 另有静态目录回退至 `/eap/index.html`，与当前 Vue 管理端构建输出无直接调用关系。

## 浏览器、Nginx 与后端

| 浏览器前缀 | 模板转发 | 运行容器变量（已确认） | 运行后端地址 | 前端调用示例 |
|---|---|---|---|---|
| `/sop-api/` | `http://$SOP_API_HOST/` | `SOP_API_HOST` | `118.196.142.69:6007` | `sop.api.js` |
| `/chatapi/` | `http://$CHAT_API_HOST/` | `CHAT_API_HOST` | `118.196.142.69:9010` | `chat.service.js` |
| `/companyapi/` | `http://$COMPANY_API_HOST/` | `COMPANY_API_HOST` | `118.196.142.69:8010` | `company.service.js` |
| `/chathistoryapi/` | `http://$CHAT_HISTORY_API_HOST/` | `CHAT_HISTORY_API_HOST` | `118.196.142.69:6022` | `chatHistory.service.js` |
| `/userapi/` | `http://$USER_API_HOST/` | `USER_API_HOST` | `118.196.142.69:9011` | `user.service.js` |
| `/dashboardapi/` | `http://$DASHBOARD_API_HOST/` | `DASHBOARD_API_HOST` | `118.196.142.69:6020` | `dashboard.service.js` |
| `/mobileapi/`、`/eap/mobileapi/` | `http://$MOBILE_API_HOST/` | `MOBILE_API_HOST` | `118.196.142.69:7010` | `mobile.service.js` |
| `/videoapi/` | `http://$VIDEO_API_HOST/` | `VIDEO_API_HOST` | `118.196.142.69:8000` | `video.service.js` |
| `/videoapiv2/` | `http://$VIDEO_API_HOST_V2/` | `VIDEO_API_HOST_V2` | `118.196.142.69:8001` | `videov2.service.js` |
| `/monitor-api/` | `http://153.35.82.15:8080/api/` | 无 | 固定地址 `153.35.82.15:8080` | `monitor.service.js` |
| `/api-153/` | `http://153.35.82.15:31117/` | 无 | 固定地址 `153.35.82.15:31117` | `license.service.js` |

模板中的 `proxy_pass` 尾部带 `/`，所以代理会去掉上述浏览器前缀。Vite 开发代理也去掉相同前缀，但其目标地址与当前 Docker 运行容器不同；不可把开发代理目标当作生产容器后端。

## 菜单、路由与权限

- 路由是 `src/router/index.js` 中的静态注册；未发现按后端接口返回菜单、动态 `addRoute` 或菜单数据库调用。
- 左侧菜单来自 Pinia `src/stores/modules/auth.ts` 的静态 `authMenuList`，经 `showMenuListGet` 和 `getShowMenuList` 过滤 `meta.isHide` 后，由 `LayoutVertical` / `SubMenu` 渲染。
- 培训中心静态父菜单为 `/trainingCenter`；其子项为学习管理与练习管理。
- 路由守卫只验证本地 token；`/system/modelSetting` 另以 `userInfo.name === 'superadmin'` 限制。未发现练习管理或考试管理的菜单权限码、角色码或后端权限菜单接口。
- `LicenseAdmin.vue` 使用了 `v-auth="'add'"`，但在本次扫描的应用入口与源码中未找到该指令注册位置；该按钮级权限是否生效为待确认。

## 练习管理现有链路（已确认到前端与代理）

`培训中心` → `auth.ts` 的“练习管理” → `/trainingCenter/practiceManagement` → `router/index.js` → `pages/LicenseAdmin.vue` → `ProTable`、`components/licenseAdmin/searchForm.vue`、`components/licenseAdmin/editDrawer.vue`、`components/exam/ReviewDialog.vue` → `services/sop.api.js` 与 `services/company.service.js` → `/sop-api`、`/companyapi` → Nginx 模板 → `SOP_API_HOST`、`COMPANY_API_HOST` → 运行容器后端地址。

当前页面的业务语义是 SOP/资料导入、异步生成 QA、题目复核及 SOP 元数据编辑；它并不存在与参考 HTML 一一对应的“练习实体”接口。后续改造前必须确认新练习的数据模型与后端接口。

## 考试能力现状

- 已有用户答题会话：`services/chat.service.js` 的 `/chatapi/v1/exams/start`、`/answer`、`/finish`，页面为独立路由 `/chat/exam` 的 `pages/ChatExam.vue`。
- 仪表盘存在考试统计调用：`dashboard.service.js` 的 `/dashboardapi/api/dashboard/department-exam` 等。
- `pages/testCenter/index.vue` 是未接入左侧菜单的占位页面；其路由在 `router/index.js` 中被注释，且使用用户列表 API，不可直接作为考试管理实现复用。
- 未发现考试管理列表、试卷、发布、考试记录、独立题库或考试权限码的正式 API 封装；SOP 的 QA 列表与保存接口可作为题目数据线索，但是否可复用为题库待确认。

## 分类能力

- 正式练习页没有分类 API 或公共分类筛选组件；它的筛选为名称与公司/部门/岗位。
- 参考 `category-filter.js` 的“产品/运营/技术”及二级方向仅为本地原型数据，不能作为正式数据源。
- 现有 `courseManagement`、资料库中的静态课程类别与参考分类不同；正式分类接口与字段仍待确认。

## 本地参考 UI 分析（仅作目标，不可直接复用 HTML）

### `reference-ui/管理端-练习.html`

- 布局：双侧栏管理端外壳、顶部栏、筛选面板和列表面板；参考菜单含资料、练习、考试、题库、评价。
- 筛选：一级类别/细分方向标签、名称输入、查询和重置。表格展示名称、类别、版本、创建/更新时间，并支持多选、批量删除、刷新、编辑和删除。
- 生成/编辑：弹窗选择类别、细分方向、文件类型、版本、资料管理文件和描述；资料选择后自动带入类别和文件类型，并提示自动生成题目。
- 题目：编辑模式显示题目管理区，支持关键词、题型（选择题/回答题）筛选、题目数、新增、编辑、删除。
- 原型实现：数据保存在浏览器 `localStorage`（`bluedot_practices`、`bluedot_materials`），自动题目是 mock 函数，不是后端接口。因此只能借鉴交互目标，不能把其数据或函数迁入正式页面。

### `reference-ui/管理端-考试.html`

- 布局：同一管理端外壳；顶部有产品、技术、运营、混合考试统计卡，点击可筛选或开始相应类别的新建。
- 列表：考试名称搜索、状态（已发布/草稿/已结束）与共享分类筛选；支持新建、批量删除、预览、编辑、删除。
- 新建/编辑抽屉：四步——基础信息与题目来源练习、题型/数量/分值和规则、试卷预览、发布信息。
- 规则：普通类别考试选择同类别练习；混合考试原型要求至少选择两个不同类别练习；配置选择题/回答题数量与单题分值、时长、及格线、随机组卷等开关。
- 发布：原型展示草稿、已发布、已结束，并在最后一步配置起止时间；数据保存在 `bluedot_exams`，无网络请求。

### `reference-ui/category-filter.js`

- 原型一级类别：产品、运营、技术；二级方向：产品（AI Portal、AI Hub、BEAT、BAMS）、运营（公司章程）、技术（K8s）。
- 脚本提供标签 UI、值标准化和 `matches(record)` 本地过滤；仅处理原型记录字段 `primary` / `secondary`。
- 正式实现前必须以已确认的分类接口、字段、权限和空值规则替换这些常量；不能认定它们是生产数据。

# 功能模块地图

## 页面入口

| 模块 | 路由 | 主要页面 | 主要服务 |
| --- | --- | --- | --- |
| 登录 | `/login` | `src/pages/Login.vue` | `user.service.js` |
| 仪表盘 | `/dashboard` | `src/pages/dashboard/` | `dashboard.service.js`、`user.service.js`、`company.service.js` |
| 资料管理 | `/knowledge/materialLibrary` | `src/pages/knowledgeManagement/materialLibrary/` | `mobile.service.js`、`company.service.js` |
| 学习/课程管理 | `/trainingCenter/studyManagement` | `src/pages/courseManagement/` | `mobile.service.js`、`video.service.js`、`videov2.service.js`、`company.service.js` |
| 练习管理 | `/trainingCenter/practiceManagement` | `src/pages/LicenseAdmin.vue` | `sop.api.js`、`company.service.js` |
| SOP 选择 | `/chat/sop` | `src/pages/SopPicker.vue` | `sop.api.js` |
| 考试对话 | `/chat/exam` | `src/pages/ChatExam.vue` | `chat.service.js`、`xfyunAsr.js`、`xfyunTts.js` |
| 用户管理 | `/system/permissionManagement/user` | `src/pages/userManagement/` | `user.service.js`、`company.service.js` |
| 公司管理 | `/system/permissionManagement/company` | `src/pages/companyManagement/` | `company.service.js` |
| 部门管理 | `/system/permissionManagement/dept` | `src/pages/deptManagement/` | `company.service.js` |
| 岗位管理 | `/system/permissionManagement/position` | `src/pages/positionManagement/` | `company.service.js` |
| 模型配置 | `/system/modelSetting` | `src/pages/modelSetting/` | `company.service.js` |
| 用户端 H5 | iframe `/eap/` | `public/eap/` 编译产物 | 由该静态包自行发起请求 |

## 仪表盘

`src/pages/dashboard/index.vue` 负责整体布局和网络状态，子卡片分别请求数据：

- `overview.vue`：顶部概览数据；
- `heatmap.vue`：30 天学习热力图与用户总数；
- `deptCompletionRate.vue`：部门考试/学习完成率；
- `gradesRank.vue`：成绩排行，并可按部门和 SOP 筛选；
- `announcement.vue`：公告；
- `studyTaskDashboard.vue`：学习任务看板；
- `resourceOverview.vue`：资源汇总；
- `guide/`：首次进入仪表盘的引导。

## 资料管理

入口为 `src/pages/knowledgeManagement/materialLibrary/index.vue`：

- 中文侧栏、路由标题、面包屑和页签统一显示“资料管理”，路由路径仍保持 `/knowledge/materialLibrary`；
- 页面通过 `ProTable` 的 `searchForm` 插槽提供卡片式筛选区，支持资料名称和“全部 / 产品 / 运营 / 技术”一级分类；产品、运营、技术各自显示对应的二级分类胶囊按钮；
- 一级分类复用列表接口已有的 `category` 参数；当前未发现二级分类请求字段，因此二级分类只维护页面状态，不新增接口参数；重置会清空名称、恢复一级“全部”并隐藏二级分类；
- 列表、分页、筛选和批量删除在 `index.vue`；
- 新增/编辑/上传在 `components/operateDrawer.vue`；
- 课程关联在 `components/CourseSelectDialog.vue`；
- Office 文件预览使用 `components/officeCheck.vue` 和全局 `OfficeViewer`。

主要数据来自 `/mobileapi/api/v1/materials/*`。

## 课程管理

入口为 `src/pages/courseManagement/index.vue`，核心复杂度集中在约 50 KB 的 `components/operateDrawer.vue`。

该抽屉同时处理：

- 课程基本信息、公司/部门/岗位范围；
- 素材选择与上传；
- 视频上传到 OSS；
- 创建视频 ASR 任务并轮询状态；
- 获取识别结果；
- 创建 Excel 生成任务并读取结果；
- 最终创建或更新课程。

修改该文件时，应重点验证“新建”“编辑”“视频解析中”“解析失败”“解析完成”几种状态。

## SOP 与练习考试

### 练习配置

`src/pages/LicenseAdmin.vue` 是当前路由中的练习管理页，负责 SOP/QA 数据查询、删除、状态展示和编辑。相关抽屉/筛选组件在 `src/pages/components/licenseAdmin/`。

`src/pages/LicenseRegister.vue` 和 `src/services/license.service.js` 属于另一组 License 旧接口，目前不在主路由表中。

### 考试流程

- `SopPicker.vue` 获取用户可用 SOP，并跳转至 `/chat/exam?sopId=...&sopName=...`；
- 混合模式通过 `components/SopPicker/mixTest.vue` 选择岗位，并携带 `position_id`；
- `ChatExam.vue` 负责考试状态、流式答案、录音、讯飞 ASR/TTS 和结束会话。

`ChatExam.vue` 是独立全屏页面，不进入管理端布局。

## 组织与用户

公司、部门、岗位页面采用相同模式：

```text
index.vue
  → ProTable / SearchForm
  → components/operateDrawer.vue
  → company.service.js
```

用户管理额外调用 `user.service.js` 获取角色和执行增删改查，并调用 `company.service.js` 获取组织选项。

## 模型配置

- 列表：`src/pages/modelSetting/index.vue`；
- 详情：`src/pages/modelSetting/detail/index.vue`；
- API：`company.service.js` 中的 `/v1/system/model-config/*`；
- 可见性：仅 `userInfo.name === "superadmin"`。

详情页体积较大，包含不同模型参数、保存与全部连接测试逻辑。

## 通用组件和 Hooks

| 路径 | 用途 |
| --- | --- |
| `src/components/ProTable/` | 表格、列配置、分页 |
| `src/components/SearchForm/` | 动态搜索表单 |
| `src/components/Grid/` | 响应式表单网格 |
| `src/components/SelectFilter/` | 选择型筛选 |
| `src/components/OfficeViewer/` | Office/PDF 文件预览 |
| `src/components/MarkdownRenderer.vue` | Markdown + 代码高亮 |
| `src/hooks/useTable.ts` | 列表加载与分页状态 |
| `src/hooks/useSelection.ts` | 表格选择状态 |
| `src/hooks/useHandleData.ts` | 删除等操作的确认与反馈 |
| `src/hooks/useTheme.ts` | 主题初始化与颜色设置 |

## 国际化

翻译文件：

- `src/languages/modules/zh.ts`
- `src/languages/modules/en.ts`
- `src/languages/modules/th.ts`

菜单优先使用路由/菜单项的 `meta.i18nKey`。新增界面文案时应同时补齐三种语言，避免直接把中文写在模板中。

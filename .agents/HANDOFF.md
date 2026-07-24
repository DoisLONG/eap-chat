# 会话交接

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
- 练习 API：`D:\PL\eap-chat\src\services\sop.api.js`；组织筛选 API：`src\services\company.service.js`
- 练习浏览器前缀：`/sop-api`，由 `SOP_API_HOST` 转发至运行态 `118.196.142.69:6007`；组织选择经 `/companyapi`、`COMPANY_API_HOST` 至 `118.196.142.69:8010`。
- QA 保存已统一：`POST /sop-api/v1/dataprep/qa/save`，请求体为 `{ sop_info_id, file_name, records }`。每条记录必须有 `question`、`answer`、`content`；当前业务还必须传有效 `sop_info_id` 才能创建版本。
- 练习页面已在原路由内完成第三阶段 A 改造：`LicenseAdmin.vue`、`searchForm.vue`、`editDrawer.vue`、`ReviewDialog.vue` 和 `sop.api.js`。无后端、数据库、菜单或路由改动。

## 参考与考试

- 练习参考：`D:\PL\eap-chat\reference-ui\管理端-练习.html`
- 考试参考：`D:\PL\eap-chat\reference-ui\管理端-考试.html`
- 分类原型：`D:\PL\eap-chat\reference-ui\category-filter.js`
- 考试会话残留：`src\services\chat.service.js`、`src\pages\ChatExam.vue`；未发现正式考试管理 API。
- 考试管理预计新增：`src\pages\examManagement\index.vue`（及必要局部组件）、`src\services\exam.service.js`、路由、auth 菜单和三份语言文件；先确认后端契约后再创建。

## 下一步

1. 由用户手动验证练习列表、名称/组织筛选、SOP 上传生成、任务状态、QA 新增编辑删除保存、单条/批量删除和 SOP 编辑。
2. 如需分类或从资料库选择文件，先确认正式分类数据源、资料接口与 SOP 的关系；不得使用 `reference-ui/category-filter.js` 的原型常量。
3. 考试管理仍未实施。获得确认后，才从 `src/stores/modules/auth.ts`、`src/router/index.js` 和实际后端契约开始最小入口改动。

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

## 参考与考试

- 练习参考：`D:\PL\eap-chat\reference-ui\管理端-练习.html`
- 考试参考：`D:\PL\eap-chat\reference-ui\管理端-考试.html`
- 分类原型：`D:\PL\eap-chat\reference-ui\category-filter.js`
- 考试会话残留：`src\services\chat.service.js`、`src\pages\ChatExam.vue`；未发现正式考试管理 API。
- 考试管理预计新增：`src\pages\examManagement\index.vue`（及必要局部组件）、`src\services\exam.service.js`、路由、auth 菜单和三份语言文件；先确认后端契约后再创建。

## 下一步

先确认：练习实体与分类字段、资料选择接口、题目保存契约、考试管理 API/权限/菜单来源。确认后从 `src/stores/modules/auth.ts` 和 `src/router/index.js` 做最小考试入口改动，再实施页面。


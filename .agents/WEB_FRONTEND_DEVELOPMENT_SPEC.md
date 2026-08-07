# Web 用户端前端开发规范

> 适用范围：Web 用户端的首页、学习、练习、考试，以及它们共用的 Layout、路由、组件、样式和 service。本文以 `eap-chat` 当前源码和 `D:\PL\HTML\Web端-首页.html`、`Web端-资料.html`、`Web端-练习.html`、`Web端-考试.html` 为依据；原型只说明界面目标，不是实现代码或接口契约。

## 1. 目的与边界

**必须**把 Web 用户端作为本项目中新增的一组独立 Vue 页面实现，不能改造成管理端的别名。

| 范围 | 当前事实 | 本规范的处理 |
| --- | --- | --- |
| 管理端 | 根路由使用 `src/layouts/index.vue` / `LayoutVertical`，入口包括课程、练习管理、考试管理。 | 保持原有目录、路由、菜单和业务含义，不在其中新增用户端业务。 |
| 当前 App/H5 | 管理端 Layout 在选择“用户端”时嵌入 `/eap/` iframe。 | 不复制其 iframe、固定地址或 H5 页面；Web 用户端独立走 Vue Router。 |
| Web 用户端 | 当前尚无 `/web` 路由、Web Layout 或页面目录。 | 按本文新增 `webUser` 专属目录和 `/web` 路由。 |
| HTML 原型 | 含原生跳转、`onclick`、`alert` / `confirm`、localStorage 和字段兜底。 | 只取布局、区域、视觉和交互意图；这些实现一律不迁入正式代码。 |

这里的“学习”对应用户学习内容，不等同于管理端的“学习管理”；“练习”和“考试”也不等同于管理端的生成、发布、复核和维护操作。目录、路由名、service 名必须带 `webUser` 前缀或位于 `webUser/` 下，避免混淆。

## 2. 当前项目已确认事实

- 入口为 `src/main.js`：Vue 3 应用已注册 Vue Router、Element Plus、Pinia、Vue I18n；`@` 指向 `src`。
- 页面使用 Vue SFC 和 `<script setup>`；现有 JS 与 TS/TSX 并存。新增普通用户端页面默认使用 `<script setup>`，不因本次新增一套 TS 规范或依赖。
- 路由在 `src/router/index.js` 静态注册，使用 `createWebHistory()`；除 `meta.public` 外均由 `localStorage.token` 守卫到 `/login`。
- 管理端侧栏菜单来自 `src/stores/modules/auth.ts` 的 `authMenuList`，不是 `src/config/menus.js`（后者当前未被主 Layout 使用）。菜单和路由为两份配置。
- 现有 `src/layouts/LayoutVertical/index.vue` 同时承载管理端和 H5 iframe，**不适合直接放入 Web 用户端**；改它会影响现有管理端和 H5。
- 全局主题主色为 `--el-color-primary: #1677ff`；全局样式在 `src/styles/`。现有 `common.scss` 已有管理端的 `.card`、表格等样式，Web 用户端不能复用这些通用类来承载自身布局。
- `src/languages/modules/{zh,en,th}.ts` 是三语字典，`src/languages/index.ts` 以 Composition API 模式创建 i18n。
- service 均通过浏览器前缀创建 Axios 实例并统一带 token、处理 401；已有 `sop.api.js`、`exam.api.js`、`mobile.service.js` 等。现有方法主要证明管理端调用链，不证明用户端接口已存在。
- 当前没有 Web 用户端目录或路由；没有 `lint`、`test`、`format` 脚本。可用的最终构建检查是 `npm run build`，由用户执行。

## 3. 推荐目录与文件归属

下面是**落地后的推荐结构**，不是当前已存在的结构。只在实际开始相应功能时创建所需的最小文件；不要先批量建空目录或“万能组件”。

```text
src/
├─ layouts/
│  └─ webUser/
│     ├─ WebUserLayout.vue
│     └─ components/
│        ├─ WebUserTerminalNav.vue
│        ├─ WebUserMenu.vue
│        ├─ WebUserTopBar.vue
│        └─ WebPageContainer.vue
├─ pages/
│  └─ webUser/
│     ├─ home/index.vue
│     ├─ study/index.vue
│     ├─ practice/index.vue
│     └─ exam/index.vue
├─ components/
│  └─ webUser/
│     ├─ common/              # 仅四页至少复用两次的展示组件
│     │  ├─ WebLoadingState.vue
│     │  ├─ WebEmptyState.vue
│     │  └─ WebErrorState.vue
│     ├─ practice/             # PracticeCard、PracticeHistoryDialog 等
│     └─ exam/                 # ExamCard、ExamHistoryDialog 等
├─ services/
│  └─ webUser/                # 已确认的用户端接口，不放管理端 CRUD
├─ hooks/
│  └─ useWebUser*.js          # 仅跨两个以上组件复用的行为
├─ config/
│  └─ webUser/                # 仅跨页面共享的静态常量/状态映射
└─ styles/
   └─ webUser.scss             # 仅 Web Layout 导入的设计变量和壳样式
```

| 位置 | 放什么 / 不放什么 | 主要负责人 | 易冲突文件 |
| --- | --- | --- | --- |
| `layouts/webUser/` | 壳、端类型栏、功能菜单、顶栏、路由出口、统一内容容器；不放首页/学习/练习/考试业务。 | 公共外壳负责人 | `WebUserLayout.vue`、菜单组件、`webUser.scss` |
| `pages/webUser/<page>/` | 一个路由页面及该页面专有的组合逻辑；不复制导航、顶栏或其他页面卡片。 | 对应页面负责人 | 仅自己目录，通常不冲突 |
| `components/webUser/common/` | 相同 API 和视觉、被至少两个页面使用的无业务基础展示组件；不放含四页分支的大 Props 万能组件。 | 公共外壳负责人协调 | `CategoryFilter.vue` 若确认复用后才创建 |
| `components/webUser/practice` / `exam` | 该领域专用卡片、历史弹窗；不放页面根组件。 | 练习/考试负责人 | 各自目录 |
| `services/webUser/` | 已确认的用户端请求、响应适配、字段映射；不放 UI 状态、`ElMessage`、硬编码主机。 | 对应接口页面负责人，先与服务负责人确认 | 同一业务 service |
| `hooks/`、`config/webUser/` | 复用行为与共享静态状态映射；一次性逻辑留在页面。 | 首个提出者，经共享文件协调 | 共享常量 |

页面组件是路由入口，负责取数、组合子组件和页面状态；公共组件不直接请求某一页面的接口。`WebPageContainer.vue` 只负责宽度、内边距和 slot，不接收业务数据。

## 4. 公共外壳规范

**必须只实现一个** `src/layouts/webUser/WebUserLayout.vue`。它包含：左侧端类型切换区、Web 功能菜单、顶部栏/用户信息、主内容背景、`<router-view>` 和当前菜单高亮。四个页面只能把自己的内容放进路由出口。

```vue
<!-- pages/webUser/practice/index.vue：只写本页内容 -->
<template>
  <WebPageContainer>
    <PracticeFilter @search="loadList" />
    <PracticeList :items="items" />
  </WebPageContainer>
</template>
```

禁止在任一页面再次写 `<aside>`、品牌、端类型栏、顶部用户区或整页背景。页面也不得改 62px/204px 壳宽、顶栏高度、全局菜单顺序和主容器宽度；这类改动由公共外壳负责人统一提交。

端类型栏中的 Web 项为当前项。管理端跳转可使用已存在的内部路径；当前 H5 仅在管理端 Layout 中以 iframe 存在，**其独立跳转地址、是否保留在 Web 壳中均待确认**，不得复制本地/环境地址。顶栏用户信息应从已登录用户状态读取；展示字段和缺省头像规则待确认，不得使用原型的 `user-001`。

桌面端基线为 1024px 及以上：主容器 `min-width: 0`，内容区可缩放；1024–1199px 将多列内容降为单列或两列，1200px 及以上使用完整栅格。移动端导航折叠方案未确认，不能以原型的 `min-width: 1100px` 直接限制正式页面。

## 5. 路由规范

推荐统一前缀 `/web`，并在 `src/router/index.js` 中新建一个与管理端根 Layout 平级的路由节点：

```text
/web                         → 重定向 /web/home
/web/home                    name: WebUserHome       → pages/webUser/home/index.vue
/web/study                   name: WebUserStudy      → pages/webUser/study/index.vue
/web/practice                name: WebUserPractice   → pages/webUser/practice/index.vue
/web/exam                    name: WebUserExam       → pages/webUser/exam/index.vue
/web/practice/:practiceId    name: WebUserPracticeSession（隐藏）
/web/exam/:examId            name: WebUserExamSession（隐藏）
```

- 页面文件与路由一一对应，路由 `name` 使用 PascalCase `WebUser + 领域 + 用途`，不复用 `PracticeManagement`、`ExamManagement` 等管理端名称。
- 四个列表/首页均为 `WebUserLayout` 子路由；答题、学习详情等若确认需要独立全屏体验，可仍置于 `/web` 父级并通过 `meta.activeMenu` 指回列表菜单。不要让隐藏详情页出现在菜单。
- 菜单高亮以 `route.path` 为基础、详情页优先 `route.meta.activeMenu`；由壳组件统一计算。不得由每个页面各自维护 `active`。
- `createWebHistory()` 和 Nginx 的 `try_files ... /index.html` 已支持 SPA 深链接的基础条件；新增 `/web` 后须由用户验证刷新、直接访问、前进和后退。当前兜底路由会把未知路径重定向到 `/dashboard`，实现时必须先注册 `/web` 再保留该兜底。
- 公共外壳负责人维护 `router/index.js` 的 `/web` 骨架。页面负责人不得直接编辑该共享文件；需要详情路由时提交路径、name、`activeMenu` 和页面文件给负责人统一合入。

## 6. 人员职责与修改边界

| 角色 | 可以负责 | 不可以负责 |
| --- | --- | --- |
| 公共外壳负责人 | Web Layout、端类型/功能菜单、顶栏、路由骨架、`webUser.scss`、内容容器、三种基础状态组件。 | 把首页、学习、练习或考试私有接口/展示逻辑塞进公共文件。 |
| 首页负责人 | 欢迎/进度、最近学习、推荐、今日计划、待考试、学习数据等首页业务区域及其接口展示。 | 复制或修改公共导航、顶栏、全局设计变量。 |
| 学习负责人 | 学习资料/课程列表、筛选、学习详情入口、页面私有组件和已确认接口。 | 把管理端的“课程新增、编辑、删除”操作搬到用户端。 |
| 练习负责人 | 练习列表/筛选、综合练习入口、开始/继续、历史练习、练习专有组件和已确认接口。 | 把 SOP 上传、生成 QA、题目复核等管理流程当作用户端练习流程。 |
| 考试负责人 | 考试列表/筛选、状态切换、开始/继续、结果、历史考试、考试专有组件和已确认接口。 | 把创建、发布、撤回、删除考试等管理端操作放入用户端。 |

修改共享文件（路由、Layout、菜单、设计变量、三语字典、公共筛选、基础 service）前，先在协作渠道说明目的、影响页面和准备修改的键/路径；由指定负责人合并。页面负责人应优先只修改自己的 `pages/webUser/<page>/` 与私有组件目录。

## 7. Vue 组件与状态组织

- **必须**使用 Vue SFC 的 `<script setup>`、`@` 别名和 Element Plus；新页面默认保持 JS，只有实际复用既有 TS 类型时才使用 `lang="ts"`。
- 文件使用 PascalCase：`WebUserLayout.vue`、`WebPageContainer.vue`、`PracticeCard.vue`、`ExamHistoryDialog.vue`；路由入口可固定为各目录的 `index.vue`。组件名不要叫 `Home.vue`、`List.vue` 这类跨端易冲突名称。
- Props 在脚本中用 camelCase、模板中用 kebab-case；事件用动词短语和 kebab-case，例如 `@search`、`@retry`、`@close`。子组件通过 Props/Emits 传递数据和动作，不直接改父页面状态。
- 组件出现以下任一情况时拆分：独立卡片/弹窗、可单独加载/重试的区域、同一段模板超过一个清晰职责。仅在一个页面出现一次的 10–30 行展示不用为了“复用”拆文件。
- 不做一个由大量 `type`、`mode`、`showXxx` Props 同时渲染首页、学习、练习、考试的万能组件。`PracticeCard` 与 `ExamCard` 的业务字段不同，分别实现。
- 只有两个以上组件确实复用同一行为，才在 `src/hooks/` 创建 `useWebUserXxx.js`；一次性筛选、弹窗开关、列表加载留在页面。跨页面静态状态映射放 `src/config/webUser/`，页面私有常量就近声明。
- 页面模板禁止堆放请求 URL、响应字段兼容链、复杂数据转换和手工 DOM 操作；这些进入 service/adapter 或专用子组件。

## 8. 样式与设计规范

四份原型共同使用蓝色 `#1677ff`、浅蓝灰背景、白色卡片、圆角卡片、62px 端类型栏、204px 菜单栏与 38px 控件。原型存在冲突：首页内容最大宽度为 1280px、其他三页为 1440px；首页/资料顶栏为 60px、练习/考试为 76px；最小宽度同时出现 1024px 和 1100px。正式 Web 用户端统一如下：

| 项目 | 统一值 |
| --- | --- |
| 主色 | 继承 `var(--el-color-primary)`（当前为 `#1677ff`），不另设页面主色 |
| 页面背景 / 卡片 / 文字 / 边框 | `#f4f8fc` / `#fff` / `#26364a` / `#e6edf5` |
| 端类型栏 / 功能菜单 | 62px / 204px |
| 顶栏 / 内容最大宽度 / 页面内边距 | 60px / 1440px / 28px |
| 卡片 | 12px 圆角、`1px solid #e6edf5`、轻阴影 `0 4px 14px rgba(31,61,96,.06)` |
| 按钮与输入框 | 38px 高、7px 圆角；优先使用 Element Plus 尺寸，不用原生按钮样式覆盖 |
| 断点 | `<=1199px` 降低内容列数；`<=1023px` 的移动端导航方案待确认 |

`src/styles/webUser.scss` 由 Web Layout 导入，并将变量限定在 `.web-user-layout` 下，例如：

```scss
.web-user-layout {
  --web-page-bg: #f4f8fc;
  --web-surface: #fff;
  --web-line: #e6edf5;
  --web-rail-width: 62px;
  --web-menu-width: 204px;
  --web-header-height: 60px;
  --web-content-max-width: 1440px;
}
```

页面局部样式放各自 SFC 的 `<style scoped lang="scss">`，并使用上述变量；禁止大段行内 `style`、复制原型整段 CSS、改写 `theme.css` 或页面自定 `#1677ff`。覆盖 Element Plus 时先使用组件 Props；确需选择器时置于本页面/组件的 `:deep()`，目标精确且说明原因，禁止大量 `!important`。`common.scss` 的管理端 `.card` 不是 Web 用户端卡片基类。

## 9. Element Plus 交互规则

- 按钮、输入框、选择框、分页、对话框、空状态、骨架屏、加载遮罩、表单优先采用 `el-*` 组件；语义容器可用 `section`、`article`、`header`、`nav`。
- 成功/失败/提示使用 `ElMessage`；确认删除、开始不可逆考试、离开未保存答题使用 `ElMessageBox.confirm`。正式代码禁止 `alert()`、`confirm()` 和内联 `onclick`。
- 发起请求的按钮**必须**绑定 `:loading`，请求期间同时 `:disabled`；取消、关闭和重复提交必须有明确规则。请求失败要保留当前筛选或已输入内容。
- 弹窗使用 `v-model`，关闭时重置本次临时状态；提交前用 `el-form` 的 `rules` / `validate` 校验，不用仅靠按钮禁用代替必填校验。
- 不为还原原型引入第二个 UI 框架或新的弹窗/表格依赖。

## 10. 接口、数据模型与状态规范

### 10.1 调用边界

页面不得写主机、端口、`/exam-api` 等前缀，也不得创建 Axios 实例。请求统一放 `src/services/webUser/`；可在后端契约确认后复用已有 service 的 Axios 实例/401 处理，不能复制拦截器。

现有事实是：`sop.api.js` 服务 SOP 生成/QA 复核，`exam.api.js` 服务管理端考试 CRUD、发布、撤回，`mobile.service.js` 服务管理端课程/资料。这些都**不是**用户端的已确认 API。以下方法名只是契约确认后的目标语义，不能先按原型虚构接口或字段：

```js
// services/webUser/practice.service.js（仅在后端确认后创建）
export const getPracticeList = (params) => /* 已确认的用户端请求 */
export const getPracticeHistory = (practiceId, params) => /* 已确认的用户端请求 */
export const startPractice = (practiceId) => /* 已确认的用户端请求 */
```

同理，考试可使用 `getExamList`、`startExam`、`getExamResult` 等语义明确的方法，但不能直接调用管理端的 `createExam`、`publishExam`。用户端与管理端若恰好共用同一后端资源，也要在 service 中以用户权限和用户流程单独命名，且先确认授权/字段是否一致。

开发代理和生产 Nginx 已按相同浏览器前缀转发，运行时使用环境变量。新增用户端 API 前须同时确认：调用的 service、浏览器前缀、Vite rewrite、Nginx 模板和真实后端契约；文档和页面不得记录固定环境地址。

### 10.2 字段与格式

- API 原始响应只在 service 层或紧邻 service 的 adapter 转一次；例如 `toPracticeListItem(response)`。组件只消费稳定的展示模型。
- 禁止在多个组件散布 `item.name ?? item.title ?? ...` 的原型式兜底。后端尚未确认时显示“待确认”，不写兼容猜测。
- 请求分页、关键词、状态筛选由页面维护 `pageNum`、`pageSize`、筛选值；service 负责映射为后端实际字段。筛选变化重置到第一页，重试复用同一参数。
- 状态值使用共享常量或本页常量，提交给后端保持真实值；`$t()` 仅用于显示。日期、百分比、分数、时长优先复用 `src/utils/dateFormat.js` 中已存在的方法；缺少且确认有跨页需求时再新增一个小的格式化函数。
- `localStorage` 仅沿用已存在的 token、Pinia 持久化等已确认能力。禁止读取/写入原型的 `bluedot_*`、`practiceHistory`、`practiceResults` 或伪造数据键。

### 10.3 页面状态

每个数据区域**必须**覆盖：首次加载、成功、空数据、失败与重试、401、无权限、提交中、成功、失败、重复点击、慢请求和刷新。

- 常规列表使用 `loading` + `WebLoadingState`（或 `v-loading`）、空数组用 `WebEmptyState`、可恢复错误用 `WebErrorState` + `@retry`。
- 401 继续由现有 Axios 拦截器清 token 并跳转登录；页面不再重复跳转逻辑。
- 403/权限不足的展示和是否隐藏入口**待确认**；在确认前不得把管理端 `v-auth` 当作用户端权限方案。
- 操作成功后只刷新受影响的列表/详情，失败不假装成功，也不吞掉异常。

## 11. 国际化规范

现有中文、英文、泰文文件为 `src/languages/modules/{zh,en,th}.ts`。新增 Web 用户端可见文本**必须**在三个文件同步增加相同层级键，建议命名空间：

```text
web.nav.home
web.home.welcome
web.study.empty
web.practice.start
web.exam.status.pending
web.common.retry
```

路由菜单、按钮、筛选标签、状态、空状态、错误和确认文案均调用 `t('web...')` 或 `$t('web...')`；后端返回的状态码/状态值不得作为翻译值提交回后端。不要复制现有页面中散落的中文硬编码；新代码以三语完整为准。

## 12. Git 与多人协作

共享文件的默认负责人是公共外壳负责人：`router/index.js`、`layouts/webUser/`、`styles/webUser.scss`、Web 菜单配置、三语字典和公共状态/筛选组件。各页面负责人尽量只在自己的 `pages/webUser/<page>/`、私有组件和对应 service 中工作。

1. 开始较大修改前先拉取并查看当前 diff；不得覆盖他人未提交改动。
2. 需要共享文件时先同步，由负责人或约定的一个人合并；不要多人同时整理同一份路由或三语文件。
3. 一个提交只表达一个目的，例如 `feat(web-user): add practice list view`；不要把无关格式化、重命名和业务改动混在一起。
4. 提交前查看 `git diff`；发生冲突后先理解两边业务，再删除冲突标记，不能只让文件“能编译”。
5. 推荐分支名 `feat/web-user-home`、`feat/web-user-study`、`feat/web-user-practice`、`feat/web-user-exam`；这只是建议，当前仓库未发现强制分支策略。

## 13. 禁止事项

- 直接复制四份 HTML、原生页面跳转、内联 `onclick`、`alert()`、`confirm()`、localStorage mock 数据或原型字段兜底。
- 在页面硬编码后端地址、端口或 token；新建页面级 Axios 实例；把原型当成接口契约。
- 复制公共导航、顶部栏或再定义一套 Web 主题、公共尺寸；在共享文件塞入只服务一个页面的业务。
- 随意新增依赖、替换 Vue/Element Plus、修改无关管理端页面，或把用户端练习/考试与管理端 SOP、题目复核、发布 CRUD 混用。
- 未确认接口时伪造 CRUD、吞掉异常、为构建通过删除校验；在代码、文档、提交中写入 token、密码或真实环境变量。
- 为当前页面进行无关大重构，或一次任务修改其他页面业务代码。

## 14. 完成标准

通用完成条件：

- [ ] 路由可访问，菜单跳转、刷新、前进/后退和高亮正确；页面使用唯一 Web Layout，没有重复导航/顶栏。
- [ ] 加载、空、失败、重试、401、权限不足（如已确认）及主要操作的 loading/防重复都可用。
- [ ] 所有新增可见文案已同步中文、英文、泰文；1024px、1200px、1440px 常见桌面宽度无明显溢出。
- [ ] 请求字段来自真实后端契约，代理前缀一致；无 mock、原型 localStorage、`alert()` 或 `confirm()` 残留。
- [ ] 用户执行 `npm run build` 成功，且未修改无关管理端功能。

页面专项验收：

| 页面 | 额外验收 |
| --- | --- |
| 首页 | 进度、最近学习、推荐、计划、待参加考试、学习数据分别有独立的加载/空/失败展示；跳转使用 Router。 |
| 学习 | 关键词/分类筛选会重置页码；资料/课程详情入口、无结果与真实下载/查看权限按已确认接口处理。 |
| 练习 | 列表、筛选、综合练习、开始/继续、历史记录状态明确；答题页恢复与保存规则先经接口确认。 |
| 考试 | 待参加/进行中/已完成状态使用真实状态值；开始需确认、防重复；继续、结果、历史记录和截止限制按真实契约处理。 |

## 15. 待确认清单

- Web 用户端登录用户资料、端类型栏中 H5 的跳转规则，以及用户端权限/403 语义。
- 首页聚合数据、学习资料/课程的用户可见范围、分类数据源。
- 用户端练习和考试的列表、开始、继续、提交、历史、结果接口、字段、授权和状态枚举。
- 学习详情、练习答题、考试答题是否采用独立全屏子路由，以及 1024px 以下移动端适配目标。

在以上事项确认前，允许完成静态 Layout、路由骨架和状态组件；不允许用原型数据或管理端 CRUD 补齐“看起来可用”的功能。

# 开发环境与运行方式

## 技术栈（已确认）

- 前端：Vue 3（SFC）、Vite 7、Vue Router 4、Pinia 3、Element Plus、Axios、Vue I18n、Sass。
- 包管理器：npm；锁文件为 `D:\PL\eap-chat\package-lock.json`。
- 脚本：`npm run dev`（Vite 开发服务器）、`npm run build`（`vite build`）、`npm run preview`（`vite preview`）。本次未执行。
- 前端入口：`D:\PL\eap-chat\src\main.js`；路由入口：`D:\PL\eap-chat\src\router\index.js`。

## 项目主结构扫描

```text
D:\PL\eap-chat
├─ Dockerfile / docker.env / entrypoint.sh / nginx.conf.template
├─ package.json / package-lock.json / vite.config.js / index.html / README.md
├─ src\                 Vue 管理端源码
├─ public\              静态资源（含 eap 子站静态产物）
├─ reference-ui\        本地参考 HTML 与分类原型脚本
├─ .agents\             协作文档（本次创建）
└─ AGENTS.md             协作规则（本次创建）
```

扫描发现：`Dockerfile`、`docker.env`、`nginx.conf`、`nginx.conf.template`、`nginx.generated.conf`、`entrypoint.sh`、`entrypoint.container.sh`、`package.json`、`package-lock.json`、`vite.config.js`、`src`、`public`、`README.md`。未发现 `.env`/`.env.*`、Docker Compose 配置、`pnpm-lock.yaml`、`yarn.lock`、`vue.config.*`、`next.config.*`、`webpack.config.*`、`Jenkinsfile`、`.gitlab-ci.yml`、`.github`、`deploy`、`start.sh`。

## Docker 与 Nginx（已确认）

- Dockerfile：`D:\PL\eap-chat\Dockerfile`，两阶段构建。
  1. `registry.cn-hangzhou.aliyuncs.com/jilimoxing/test:node-20-alpine`：复制 `package*.json`，执行 `npm install --registry=https://registry.npmmirror.com`，复制源码，执行 `npm run build`。
  2. `registry.cn-hangzhou.aliyuncs.com/jilimoxing/test:nginx1192`：把 `/app/dist` 复制至 `/usr/share/nginx/html`，复制 `nginx.conf.template` 和 `entrypoint.sh`，暴露 `80`，执行 `/entrypoint.sh`。
- 镜像是纯前端静态站点镜像；最终页面由 Nginx 提供。
- 启动脚本 `D:\PL\eap-chat\entrypoint.sh` 使用 `envsubst` 把指定环境变量写入 `/etc/nginx/nginx.conf`，然后以 `nginx -g 'daemon off;'` 启动。
- 镜像实际使用的模板为 `D:\PL\eap-chat\nginx.conf.template`；`nginx.conf` 与 `nginx.generated.conf` 是源码中的其他 Nginx 配置文件，Dockerfile 未复制它们。
- 模板确认：`listen 80`、静态根目录 `/usr/share/nginx/html`、入口 `index.html`、SPA 回退 `try_files $uri $uri/ /index.html`。

## 环境变量与 Compose

- `D:\PL\eap-chat\docker.env` 是文件。Dockerfile 不复制或读取它；它只能在容器运行时由外部传入。
- 启动脚本会替换：`SOP_API_HOST`、`CHAT_API_HOST`、`COMPANY_API_HOST`、`CHAT_HISTORY_API_HOST`、`USER_API_HOST`、`DASHBOARD_API_HOST`、`MOBILE_API_HOST`、`VIDEO_API_HOST`、`VIDEO_API_HOST_V2`。
- 当前项目未发现 Docker Compose 配置（未发现 `docker-compose.yml`、`docker-compose.yaml`、`compose.yml` 或 `compose.yaml`）。未执行任何 Compose 命令。
- 当前运行容器的九个变量值与 `docker.env` 一致，但 Docker inspect 无法证明其启动时是否使用了 `--env-file docker.env`；实际注入命令为待确认。

## 当前运行态（只读确认）

- 容器：`eap-chat`；镜像：`eap-chat:local`；状态：运行中。
- Dockerfile 声明端口、Nginx 监听端口、容器暴露端口均为 `80/tcp`。
- Docker inspect 端口绑定：`0.0.0.0:8080 -> 80/tcp` 和 `[::]:8080 -> 80/tcp`；本机访问端口为 `8080`。
- 启动链：镜像原生 Entrypoint `/docker-entrypoint.sh`，Cmd `/entrypoint.sh`；无挂载目录。

## 本次禁止的操作

- 不运行构建、预览、测试或自动化测试；测试由用户执行。
- 不启动、停止、删除、重建容器；不构建、删除、拉取镜像。
- 不修改数据库、不执行迁移、不修改 `docker.env`。
- 不使用 PowerShell 脚本。

## SOP 分类（迁移待执行）

- 练习页通过 `/sop-api/v1/dataprep/sop/categories/tree` 读取正式分类树；浏览器代理仍使用既有 `SOP_API_HOST`，未修改 `docker.env`。
- 分类筛选只将“全部”作为前端状态；一级/二级分类 ID、名称和树结构均由 Dataprep 返回。生成练习和编辑 SOP 实际提交二级 `category_id`。

## 练习管理界面

- 页面视觉以 `D:\PL\HTML\管理端-练习.html` 和 `category-filter.js` 为参考：筛选卡片、紧凑的 36px 一级按钮、32px 胶囊二级按钮、独立名称搜索行和表格工具栏均保留 Vue/Element Plus 实现。
- 原型的静态记录、localStorage 和 mock 题目未使用；列表、分类、编辑和生成仍走现有 `sop.api.js` 接口。

## 练习编辑弹窗

- `src/pages/components/licenseAdmin/editDrawer.vue` 保留原文件入口，内部已由右侧抽屉改为 Element Plus 居中 `el-dialog`；分类树继续由父页加载后传入，不重复请求接口。
- 编辑保存仍只调用既有 `POST /v1/dataprep/sops/record/update`，提交 `record_id`、原 `title`、原 `position_id` 与二级 `category_id`。当前后端不支持文件类型、版本、文件替换或描述更新，因此这些字段在弹窗中仅作只读展示，避免伪造保存。
- QA 复核继续由 `src/components/exam/ReviewDialog.vue` 独立处理；编辑弹窗不请求或渲染 QA 数据。

## 练习生成与文件类型（本次更新）

- 生成练习弹窗只保留上传类型、所属类别、细分方向、解析模式和选择文件；公司、部门、岗位、发布时间、结束时间的可见项、校验、局部状态与组织查询均已移除。
- 界面上传类型只显示后端加载器实际支持的后缀：`PDF`、`DOC`、`DOCX`、`XLS`、`XLSX`；文件选择后会自动识别后缀，选择类型后文件选择器仅接受对应后缀。
- `/v1/dataprep/generate_qa` 的请求字段名未变；前端不再提交已移除的 `start_time`、`end_time`，也不再从登录态读取或提交 `position_id`。岗位为后端可选归属：合法值才随兼容调用提交，缺省时生成不受阻断。

## 考试管理 Docker 重建（2026-07-29）

- 当前本机运行态：`eap-chat:local` 为容器 `eap-chat`（宿主 `8081` → 容器 `80`）；`eap-exam:local` 为容器 `eap-exam`（宿主 `7020` → 容器 `7020`）；两者均在 `eap-training-local` 网络，且没有源码挂载。
- 修改源码后只执行 `docker restart` 不会换用新镜像；必须重新构建镜像并按原有环境变量重建容器。不要从 `docker inspect` 复制或提交包含密码、JWT 密钥或账户服务地址的完整环境变量。
- 前端重建命令：`docker build -t eap-chat:local D:\PL\eap-chat`。在考试容器先就绪后，按既有安全环境文件重建：`docker run -d --name eap-chat --network eap-training-local -p 8081:80 --env-file D:\PL\eap-chat\docker.env eap-chat:local`。重建前需要先停止并删除同名旧容器；这会短暂中断本地页面。
- 访问地址为 `http://localhost:8081/trainingCenter/examManagement`；`docker.env` 中的 `EXAM_API_HOST` 必须保持指向 Docker Desktop 可访问的 `host.docker.internal:7020`，不要写死数据库或账户服务地址。

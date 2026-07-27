# 项目协作规则

1. 每次开始任务前，先阅读 `.agents` 下与任务相关的文档。
2. 开始修改前必须阅读 `.agents/DEVELOPMENT.md`、`ARCHITECTURE.md`、`DECISIONS.md`、`TODO.md` 和 `HANDOFF.md`。
3. 每次修改代码后更新 `.agents/WORKLOG.md`；重要设计或技术决策更新 `DECISIONS.md`；未完成事项更新 `TODO.md`；会话交接更新 `HANDOFF.md`。
4. 禁止使用 PowerShell 脚本；文件搜索、目录分析和批量处理优先使用 Python 脚本。
5. 所有测试由用户执行。Codex 不主动运行前端或后端构建、自动化测试，也不启动、停止、删除或重建容器。
6. 修改范围必须严格限制在当前任务。未确认菜单、路由、接口和数据结构前，不允许大规模重构。
7. 不允许直接用参考 HTML 覆盖正式框架页面。参考 HTML 仅用于确认界面、布局、字段和交互目标；正式实现必须沿用当前 Vue、Element Plus、路由、菜单、权限和接口封装体系。
8. 修改完成后必须列出修改文件、修改内容和待验证事项。


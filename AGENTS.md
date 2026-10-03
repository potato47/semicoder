# 新手程序员 · Agent 工作约定

## 开始工作

阅读 [工程文档](docs/README.md)、[架构](docs/architecture.md) 和相关模块文档。网站内容在 `content/`，工程说明在 `docs/`，不要混用。旧 Astro 基线保存在 `archive/astro-before-rebuild`。

## 架构边界

- 单应用 TanStack Start / React，Cloudflare Workers 运行服务端，D1 保存动态数据。
- Bun 负责工具链；Workers 代码不得依赖 Bun API、文件系统或进程内持久状态。
- 数据库、密钥和权限检查放在 `src/server/`，客户端只能通过服务端函数访问。
- 服务端每次写入校验会话、输入、权限；不得相信前端管理员标记。
- 内容稳定 ID 不随 URL 改变；生产构建不能包含草稿或私有数据。
- 数据库采用提交到 Git 的增量迁移，禁止生产 schema push。
- 当前使用 Cloudflare 免费套餐；不得自动升级或添加付费服务。公开内容优先由 Assets 提供，避免消耗动态请求额度；不配置付费版 CPU 上限。

## 质量标准

- TypeScript strict；Oxlint 检查代码；Oxfmt 统一格式。不引入第二套 lint / format 工具链。
- 使用 `bun run fmt`、`bun run lint:fix` 本地修复，提交前执行 `bun run check`、`bun run test`、`bun run test:workers`、`bun run build`。
- 不关闭规则掩盖问题；局部禁用必须附具体理由。不手改生成文件。
- 测试验证行为、权限和失败场景；修改接口时更新相应测试。

## 文档维护与完成标准

- 每次变更根据 `docs/impact.json` 同步维护文档；无文档影响需在 PR 的 `docs-impact: none — 原因` 声明中解释。
- `bun run docs:generate` 生成技术清单，`bun run docs:check` 检查链接与一致性。生成器只写 `docs/generated.md`。
- 架构决策写 ADR；运行方式改变更新部署手册；本文件只记录长期规则，不追加开发日志。
- 交付须说明变更、验证和外部阻塞；未验证的登录、部署、生产数据不得声称成功。
- 不提交密钥、真实用户数据或测试会话。部署环境与 OAuth 应用分离。

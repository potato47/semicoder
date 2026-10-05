# 开发与质量

使用 Bun 1.4.2 与 Node 24。执行 `bun install --frozen-lockfile`、`bun run prepare`、`bun run db:local`、`bun run dev`。复制 `.dev.vars.example` 为 `.dev.vars` 后按需填入本地密钥；无 OAuth 密钥也可开发内容页面。

Oxlint 检查 JS/TS、React Hooks 与可访问性；warning 阻断 CI。Oxfmt 是唯一格式入口：两空格、分号、双引号、100 列、LF、保留 Markdown 换行。Markdown/MDX 由 npm 版 Oxfmt 内置引擎处理，保留 Node 环境。TypeScript strict 单独执行类型检查，未启用 type-aware lint。

`bun run check` 汇总只读检查。`bun run test` 验证内容和纯逻辑，`bun run test:workers` 验证实际 D1 行为，`bun run build` 构建 Worker、预渲染页面及中文搜索。`bun run fmt` 和 `bun run lint:fix` 只用于本地修复。

新增生成文件须明确加入排除范围并增加一致性检查，不可忽略整个业务目录。CI 安装和生成类型后执行检查，不自动修复、提交或放宽规则。文档影响映射见 `impact.json`；PR 必须更新对应文档，或提供带原因的 `docs-impact: none — ...` 声明。

构建后执行 `bun run build:check`：扫描客户端产物中的草稿标识和正文，并加载实际 Pagefind WebAssembly 索引验证公开内容的中文搜索及类型筛选。CI 和部署脚本均执行此检查。

`bun run build` 使用内容生成器的 `--production` 模式；如果设置了 `CONTENT_PREVIEW=true`，在写入产物前直接失败。预览草稿只使用开发服务。内容与路由变更需额外验证 `bun run build:check` 的静态 HTML、canonical、锚点和项目搜索检查。

时间首页依赖固定版本 `lunar-typescript@1.8.6`（MIT，无第三方运行时依赖），通过 Bun lockfile 管理，作为客户端代码打包，不加载在线历法接口。升级时需回归春节换年、闰月、除夕、节气交接和时区边界。`tests/unit/time.test.ts` 使用独立 Bun 子进程设置 `TZ`，验证不同访客时区与夏令时，不修改其他测试的全局时区；`tests/unit/chinese-calendar.test.ts` 验证历法、缓存与失败降级。

首页浏览器验收覆盖 1440 / 768 / 390 / 320px、浅深色主题、时间数字稳定性、无横向溢出、后台恢复与路由离开后的计时器清理。生产构建检查须确认首页保留固定占位、无脚本提示与 canonical，hydration 无日期不匹配。

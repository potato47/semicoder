# 新手程序员 · semicoder.dev

中文个人技术门户：博客、项目展示、项目文档、中文搜索、GitHub 登录评论和审核后台。

TanStack Start / React / Query · Bun · Cloudflare Workers / D1 · Drizzle · Better Auth · Oxlint / Oxfmt。

## 本地开发

需要 Bun 1.4.2 和 Node 24。

```bash
bun install --frozen-lockfile
bun run db:local
bun run dev
```

打开 http://localhost:3000 。无需密钥即可浏览项目与文档；动态评论先初始化本地 D1。真实登录需将 `.dev.vars.example` 复制为 `.dev.vars` 并配置 GitHub OAuth、Turnstile 与管理员 ID。

## 验证

```bash
bun run fmt
bun run docs:generate
bun run check
bun run test
bun run test:workers
bun run build
```

工程约定见 [AGENTS.md](AGENTS.md)，完整说明见 [docs](docs/README.md)，环境资源和上线步骤见 [部署手册](docs/deployment.md)。网站内容在 `content/`，与工程文档分离。

FIA、麻辣烫和本站的项目介绍与文档已使用真实资料；博客仍保留明确标注的示例。安装说明区分已发布 npm 包、框架固定构建与尚未公开的应用安装包。正式部署前仍需核对 D1 ID、域名、GitHub OAuth 和 Turnstile，并完成预发布验收。没有凭据时不会把功能模拟声称为线上验证。

旧 Astro 实现保留在 Git 标签 `archive/astro-before-rebuild`。

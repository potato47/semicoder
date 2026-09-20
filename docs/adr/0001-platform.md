# ADR 0001：Cloudflare 全栈个人门户

状态：接受。日期：2026-09-20。

采用 TanStack Start / React、Bun 工具链、Cloudflare Workers / D1、Drizzle 和 Better Auth。接受 Start RC，依赖以锁文件为准。公开内容预渲染，动态业务使用 server functions。

采用 Oxlint 与 Oxfmt，保留独立 TypeScript strict 检查。首版不引入 Biome、独立 ESLint/Prettier 命令、微服务、R2、文档多版本或通知服务。

内容 Git 驱动，动态数据 D1。Pagefind 负责中文公开搜索。稳定内容 ID 关联评论，避免 URL 调整导致讨论丢失。

依据：Cloudflare 官方 Start/Vite 集成；TanStack Start 官方概览；Oxc 官方 CLI 和格式支持。风险通过锁定依赖、workerd 集成测试和预发布验证管理。

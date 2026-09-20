---
id: blog-edge-runtime
slug: understand-edge-runtime
title: 理解边缘运行时：代码到底在哪里执行？
description: 从浏览器、构建工具到 Cloudflare Workers，理清一段代码的运行边界。
date: 2026-09-18
tags: [Cloudflare, Web 开发]
sample: true
---

同一个 TypeScript 项目里，代码可能运行在完全不同的环境中。理解这个边界，比记住某个框架的 API 更重要。

## 浏览器负责交互

页面点击、表单输入和主题切换都发生在浏览器中。不要将密钥放在客户端环境变量里，也不要只靠隐藏按钮来控制权限。

## 构建工具负责准备内容

Markdown 编译、搜索索引、代码打包在构建阶段完成。这个阶段可以读取仓库文件，但产物必须排除草稿和敏感信息。

## Worker 负责动态请求

用户登录、评论写入和后台审核由 Worker 处理。它通过 binding 访问数据库，每次写入都需要重新检查权限。

```typescript
export async function readCount(db: D1Database) {
  return db.prepare("SELECT COUNT(*) AS count FROM comment").first();
}
```

让每一层只承担明确的职责，项目会更容易测试，也更容易长期维护。

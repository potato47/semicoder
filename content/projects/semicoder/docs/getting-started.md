---
id: docs-semicoder-start
slug: getting-started
title: 快速开始
description: 了解新手程序员门户的内容结构与开发流程。
date: 2026-09-20
updated: 2026-10-04
---

## 准备环境

安装 Bun 1.4.2 和 Node.js 24，克隆仓库后安装锁定的依赖。

```bash
git clone https://github.com/potato47/semicoder.git
cd semicoder
bun install --frozen-lockfile
bun run prepare
bun run db:local
bun run dev
```

默认打开 `http://localhost:3000`。不配置 OAuth 密钥也可以阅读公开内容；真实 GitHub 登录需要按仓库 `.dev.vars.example` 配置本地环境。

## 浏览项目

首页连接博客、项目与文档。公开内容不依赖登录即可浏览。需要参与讨论时，通过 GitHub 登录。

## 下一步

阅读 [内容维护](/semicoder/docs/guides/writing) 了解如何添加文章和项目文档。

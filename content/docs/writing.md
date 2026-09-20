---
id: docs-semicoder-writing
slug: writing
project: semicoder
title: 内容维护
description: 用 Markdown 和 MDX 发布文章，为每一份内容设置稳定身份。
date: 2026-09-20
order: 2
sample: true
---

## 添加内容

博客、项目和文档分别放入 content 下的对应目录。每份内容需要标题、简介、日期、slug 和永久稳定的 ID。

## 草稿与发布

将 draft 设为 true 可以保留未完成的内容。生产构建会排除草稿，包括搜索与订阅资源。

## 验证修改

```bash
bun run content:generate
bun run check
bun run build
```

更改 URL 时添加 aliases 重定向，保留原有 ID，让已有讨论继续关联同一篇内容。

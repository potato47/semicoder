---
id: docs-semicoder-writing
slug: guides/writing
title: 内容维护
description: 用 Markdown 和 MDX 发布文章，为每一份内容设置稳定身份。
date: 2026-09-20
updated: 2026-10-04
---

## 添加内容

博客放在 `content/blog/`。每个项目在 `content/projects/` 下维护自己的目录：`index.mdx` 保存介绍，`docs/` 保存文档，`nav.json` 按文档 ID 配置分组和阅读顺序。每份内容需要标题、简介、日期、slug 和永久稳定的 ID。

文档 slug 可包含多级路径，例如 `guides/writing`。项目关联由所属目录自动注入，不填写 project 或 order。新增项目和文档不需要编写路由。

## 草稿与发布

将 draft 设为 true 可以保留未完成的内容。生产构建会排除草稿，包括搜索与订阅资源。

## 验证修改

```bash
bun run content:generate
bun run check
bun run build
```

修改文件位置或 URL 时保留原有 ID，让已有讨论继续关联同一篇内容。项目改为草稿时，它的全部文档也会从公开构建中移除。

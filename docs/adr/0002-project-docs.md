# ADR 0002：以项目为中心的内容与文档

状态：接受。日期：2026-10-04。

借鉴 TanStack 官网的项目配置、嵌套路由和分组导航，使用 `/<project>`、`/<project>/docs` 和 `/<project>/docs/<多级路径>`。当前只维护一个文档版本，不加入 latest、版本选择或框架维度。保留 `/projects` 和 `/docs` 集合入口。本站继续使用现有视觉系统。

项目在本站仓库的独立内容目录维护介绍、文档和 nav.json；项目介绍的 frontmatter 是项目元信息的唯一来源，导航引用文档稳定 ID。项目与文档通过稳定项目 ID 关联，文件目录和 URL 不承担身份职责。新增项目不需要新增路由或手写另一份注册表。工程文档与网站正文保持分离，不引入远程仓库拉取、内容管理后台或数据库正文。

构建严格验证路径、导航和公开内容边界，统一清单驱动集合页、嵌套路由、搜索、sitemap 与预渲染。项目草稿会隐藏其全部文档。功能路由和静态资源保留顶层命名空间，避免项目 slug 遮蔽站点功能。公开阅读继续由 Cloudflare Assets 提供，服务端权限边界与 D1 schema 不变。

接受一次不兼容的内容目录和 URL 调整：直接迁移现有正文、更新引用、删除旧详情路由，不增加旧版解析或迁移重定向。保持内容 ID，因此评论关联不受影响。用户明确不要求旧版兼容。

参考：[TanStack 项目配置](https://github.com/TanStack/tanstack.com/blob/main/src/libraries/types.ts)、[Router 文档](https://tanstack.com/router/latest/docs/overview)。

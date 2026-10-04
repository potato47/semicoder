# 架构

单仓库、单 TanStack Start 应用、单 Cloudflare Worker。TanStack Router 提供类型化导航，TanStack Query 管理动态状态。CSS Modules 和 CSS 变量提供视觉系统。公开页面预渲染，动态会话和评论在 hydration 后读取。

内容从 `content/` 经构建脚本校验和编译 MDX，生成模块清单、HTML 搜索输入、RSS、sitemap 和重定向清单。生产生成阶段排除草稿；只有显式本地预览才包含草稿。Pagefind 索引由公开内容生成并作为静态资源部署。

客户端通过 Start server functions 调用服务端，`src/server/` 封装会话、D1、审核和防刷。数据库访问不进入客户端包。公共 HTML 无会话信息，动态接口和后台使用 private/no-store。Worker 入口处理 canonical 域名、重定向、安全响应头和健康检查。

内容 ID 为稳定主键，slug 只决定 URL。历史 URL 在 frontmatter aliases 中显式保留。正文不存入 D1。D1 使用 Drizzle schema 与可审计 SQL 迁移。评论和审核写入通过 D1 batch 保持原子性。

本地 Vite Cloudflare 插件在 workerd 中运行后端；Bun 只用于工具链。预发布和生产资源隔离。无密钥时正文仍可阅读，登录和评论显示可理解的配置状态。

免费套餐采用 Assets 优先路由，公开页面和搜索资源不经过 Worker。只有认证、server functions、后台和健康检查优先执行 Worker。静态安全响应头与预发布 noindex 放在 `public/_headers`；历史路径由内容生成 `_redirects`，www 跳转和 HTTPS 由域名规则执行。动态请求额度耗尽不应阻断已发布正文。

后台预渲染不含用户信息的登录界面，入口仍经过 Worker 添加 private/no-store；管理数据仅在客户端会话确认后通过管理员接口加载，避免每次打开后台都执行 React 服务端渲染。

项目采用顶层 `/$project` 嵌套路由，文档布局位于 `/$project/docs`，正文由 `/$project/docs/$` 匹配多级 slug。项目父路由校验并提供项目上下文，文档必须在当前项目内查找；未知项目、缺失文档及无文档项目的文档入口返回 404。全站 `/projects` 和 `/docs` 保留为集合入口，旧详情路由直接删除，不提供迁移跳转。

每个项目的介绍、文档和导航集中在 `content/projects/<目录名>/`。构建以项目稳定 ID 注入文档关系，按导航配置生成分组和顺序，同时输出仅含公开内容的统一清单。页面元信息与 MDX 正文入口分离，集合页无需导入所有正文。清单中的 publicPaths 是预渲染和 sitemap 的共同来源；项目文档首页只为存在公开文档的项目生成。路由结构与配置决策见 [ADR 0002](adr/0002-project-docs.md)。

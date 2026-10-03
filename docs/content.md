# 内容发布

在 `content/blog`、`content/projects`、`content/docs` 创建 Markdown 或 MDX。frontmatter 必填 id、title、description、slug、date；文档另填 project 和 order。id 永久稳定，slug 用小写英文与连字符。项目包含 stack 和 status，可包含 source、demo。所有示例内容注明 sample: true。

`draft: true` 内容不进入生产模块、页面、RSS、sitemap 或搜索。`CONTENT_PREVIEW=true bun run dev` 只用于本地草稿预览，不得用于生产部署。旧 URL 填入 aliases，例如 `/posts/old-slug`。执行 `bun run content:check` 验证引用、链接和 ID。

博客与项目默认 comments: true，文档默认关闭。相对资源使用 public 下的绝对站内路径。MDX 只允许经过仓库审查的代码；访客评论只能使用安全 Markdown，不能执行 MDX 或 HTML。

公开内容有目录、代码高亮和阅读时间；文档按项目及 order 排序。内容修改通过 PR，构建后发布，无网页正文编辑器。

内容校验同时验证生成入口、清单和正文模块，拒绝残留草稿模块。构建产物还需通过 `bun run build:check` 的草稿隔离和实际中文搜索检查。

历史 URL 同时生成 Assets `_redirects`，避免为重定向调用 Worker。搜索优先使用 Pagefind；检测到浏览器缺少中文分词词典时，按需加载仅含公开内容的静态备用索引，提供字面匹配及类型筛选，不增加服务器请求处理。

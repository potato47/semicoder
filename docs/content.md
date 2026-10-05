# 内容发布

## 按项目维护内容

博客放在 `content/blog/`。每个项目使用 `content/projects/<目录名>/index.mdx` 保存项目介绍和元信息；文档放在该项目的 `docs/` 下，支持递归子目录；`nav.json` 保存文档分组与阅读顺序。工程说明只放在仓库根目录的 `docs/`，不参与网站内容发布。

所有正文 frontmatter 必填 `id`、`title`、`description`、`slug`、`date`。ID 永久稳定，文件位置和 URL 可独立调整。博客和项目 slug 使用小写英文、数字与连字符；文档可使用 `guides/writing` 这样的多级 slug。项目可配置 `stack`、`status`、`source`、`demo`；示例内容必须标记 `sample: true`。不再接受文档 frontmatter 中的 `project`、`projectId` 或 `order`，项目关系由所属目录中的项目稳定 ID 注入。

例如，目录 `content/projects/semicoder/` 中的项目 slug 为 `semicoder` 时，项目主页是 `/semicoder`，文档首页是 `/semicoder/docs`，文档 `slug: guides/writing` 的地址是 `/semicoder/docs/guides/writing`。目录名不决定 URL。项目不能使用 `blog`、`docs`、`projects`、`admin`、`api`、`healthz` 等功能路由或静态资源名称。

`nav.json` 示例：

```json
{
  "groups": [
    { "title": "入门", "items": ["docs-semicoder-start"] },
    { "title": "指南", "items": ["docs-semicoder-writing"] }
  ]
}
```

`items` 引用文档稳定 ID，不引用路径。每篇公开文档必须且只能出现一次，不允许跨项目引用。分组及数组顺序决定侧栏、文档首页和上一篇／下一篇顺序。没有文档的项目可省略 `docs/` 与 `nav.json`，不生成文档入口。新增项目和章节不需要编写路由。

## 草稿与构建

`draft: true` 内容不进入生产模块、页面、RSS、sitemap 或搜索。项目为草稿时，其全部文档也被排除；草稿导航项和空分组不出现在公开清单。草稿文档可以暂不加入导航。`CONTENT_PREVIEW=true bun run dev` 只用于本地预览，不得用于生产部署。

构建校验重复 ID、URL、保留路径、导航引用和站内链接。执行 `bun run content:generate` 更新统一项目清单、正文模块、搜索及 sitemap，再执行 `bun run content:check`。清单是 UI、搜索与静态预渲染路径的共同来源，生成文件不可手改。`bun run build:check` 递归检查草稿及草稿项目内容隔离，验证静态 HTML、canonical、目录锚点、sitemap 和真实 Pagefind 项目筛选。

本次直接采用新的项目目录和顶层 URL，不保留旧版内容格式，不为旧 `/projects/<slug>` 和 `/docs/<project>/<slug>` 添加迁移重定向。更新所有站内引用，旧详情 URL 返回 404。通用 `aliases` 功能仍可用于以后明确声明的地址调整，但本次迁移不添加 aliases。

## 阅读、搜索与讨论

博客与项目默认 `comments: true`，文档默认关闭。评论始终关联内容 ID，调整项目 slug 不改变关联。资源使用 `public/` 下的绝对站内路径。MDX 只允许经过仓库审查的代码；访客评论只能使用安全 Markdown，不能执行 MDX 或 HTML。

全站导航与首页不再设置独立文档入口，读者从项目进入文档。文档提供项目选择、分组章节、本页目录和相邻章节。搜索 URL 使用 `q`、`type`、`projectId` 保存状态；`type` 可选 blog、projects、docs，省略表示全部。`projectId` 仅在 docs 类型有效，且必须属于有文档的公开项目。文档内的搜索入口默认当前项目，可以切换全部项目文档或全站。Pagefind 与中文静态备用索引采用相同项目筛选规则，不增加服务端搜索请求。

内容修改通过 PR，构建后发布，无网页正文编辑器。构建不自动拉取或复制外部项目仓库；开发者依据 [来源与同步规范](project-sources.md) 核对上游变化并维护本站内容，网站可独立构建。

## 项目展示与安装入口

项目可填写 `category`（项目类别）、`featured: true`（保留的推荐元数据，当前时间首页不消费）和 `start: { label, doc }`。`doc` 引用本项目的文档稳定 ID，不是 URL；构建要求目标在当前模式可见且已加入导航。项目卡片和主页用它生成安装／开始入口，修改文档 slug 不会使按钮失效。未配置的项目保留通用文档入口，卡片不推断项目开源状态。

当前真实内容包含 FIA、麻辣烫与本站。FIA 和麻辣烫分别在 `content/projects/fia/`、`content/projects/malatang/` 维护，统一从项目集合页进入，时间首页不再展示项目推荐。资料、版本差异和跨项目同步流程见 [内容核对记录](project-sources.md)。两项目内容变更由 `docs/impact.json` 同时关联内容规范和来源记录；单纯文字修正无来源影响时按 PR 规则说明原因。麻辣烫官网固定为 `https://semicoder.dev/malatang`，统一安装入口为 `/malatang/docs/installation`；应用更新文件继续由独立更新源提供。新增正式安装包时先核实 Release、文件、平台与签名状态，再更新麻辣烫安装页；框架 `.tgz` 不能标为应用下载。网站不代理安装包，不在访问时请求 GitHub 或 npm。

麻辣烫安装页默认提供已核验的 0.1.0 正式 DMG，同时保留 v0.1.0 固定提交与对应 FIA 归档的源码构建路线。模型指南统一为 Pi AI 1.0.2，插件指南统一为 `@semicoder/malatang-sdk`，不再保留旧快照的包名替换步骤。SDK 仍通过源码 workspace 使用；npm 发布状态与应用 DMG 状态分别核实，不因应用发行就标记 SDK 已上线。

主操作按钮悬停使用强调背景与深色前景 `--on-accent`，避免浅深色模式下白字与橙色背景对比不足。

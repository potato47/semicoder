# 内容发布

## 按项目维护内容

2026-10-14：fn 更名仅在本地完成，官网源码与内容 ID 同步更新，新名称尚未发布。来源及既有发行历史见 [项目资料](project-sources.md)。

博客放在 `content/blog/`。每个项目使用 `content/projects/<目录名>/index.mdx` 保存项目介绍和元信息；文档放在该项目的 `docs/` 下，支持递归子目录；`nav.json` 保存文档分组与阅读顺序。工程说明只放在仓库根目录的 `docs/`，不参与网站内容发布。

所有正文 frontmatter 必填 `id`、`title`、`description`、`slug`、`date`。ID 默认永久稳定，文件位置和 URL 可独立调整。2026-10-14 用户明确要求 fn 更名时同步项目及文档 ID，作为一次例外改为 project-fn / docs-fn-*；不迁移历史关联数据或添加旧地址 aliases。博客和项目 slug 使用小写英文、数字与连字符；文档可使用 `guides/writing` 这样的多级 slug。项目可配置 `stack`、`status`、`source`、`demo`；示例内容必须标记 `sample: true`。不再接受文档 frontmatter 中的 `project`、`projectId` 或 `order`，项目关系由所属目录中的项目稳定 ID 注入。

例如，目录 `content/projects/semicoder/` 中的项目 slug 为 `semicoder` 时，项目介绍作为文档 Home，地址是 `/semicoder`；文档 `slug: guides/writing` 的地址是 `/semicoder/docs/guides/writing`。目录名不决定 URL。项目不能使用 `blog`、`docs`、`projects`、`admin`、`api`、`healthz` 等功能路由或静态资源名称。

`nav.json` 示例：

```json
{
  "groups": [
    { "title": "入门", "items": ["docs-semicoder-start"] },
    { "title": "指南", "items": ["docs-semicoder-writing"] }
  ]
}
```

`items` 引用文档稳定 ID，不引用路径。每篇公开文档必须且只能出现一次，不允许跨项目引用。分组及数组顺序决定侧栏及章节上一篇／下一篇顺序。没有章节的项目可省略 `docs/` 与 `nav.json`，仍生成 Home。侧栏首项由项目介绍生成并显示项目名称，不加入 nav.json；原 `/<project>/docs` 概览地址返回 404。新增项目和章节不需要编写路由。

## 草稿与构建

`draft: true` 内容不进入生产模块、页面、RSS、sitemap 或搜索。项目为草稿时，其全部文档也被排除；草稿导航项和空分组不出现在公开清单。草稿文档可以暂不加入导航。`CONTENT_PREVIEW=true bun run dev` 只用于本地预览，不得用于生产部署。

构建校验重复 ID、URL、保留路径、导航引用和站内链接。执行 `bun run content:generate` 更新统一项目清单、正文模块、搜索及 sitemap，再执行 `bun run content:check`。清单是 UI、搜索与静态预渲染路径的共同来源，生成文件不可手改。`bun run build:check` 递归检查草稿及草稿项目内容隔离，验证静态 HTML、canonical、目录锚点、sitemap 和真实 Pagefind 项目筛选。

本次直接采用新的项目目录和顶层 URL，不保留旧版内容格式，不为旧 `/projects/<slug>` 和 `/docs/<project>/<slug>` 添加迁移重定向。更新所有站内引用，旧详情 URL 返回 404。通用 `aliases` 功能仍可用于以后明确声明的地址调整，但本次迁移不添加 aliases。

## 阅读、搜索与讨论

博客默认 `comments: true`，文档默认关闭。项目 Home 统一关闭评论，项目 frontmatter 的 comments 不会重新开启；生成清单让页面和服务端评论检查共同生效。历史项目评论保留，无数据库迁移。评论始终关联内容 ID，调整 slug 不改变历史关联。资源使用 `public/` 下的绝对站内路径。MDX 只允许经过仓库审查的代码；访客评论只能使用安全 Markdown，不能执行 MDX 或 HTML。

全站导航与首页不再设置独立文档入口，读者从项目进入文档。项目 Home 与文档共用分组章节、本页目录和相邻章节，不显示项目选择或独立搜索工具栏。搜索 URL 使用 `q`、`type`、`projectId` 保存状态；`type` 可选 blog、projects、docs，省略表示全部。`projectId` 仅在 docs 类型有效，且必须属于有文档的公开项目。搜索从全站顶栏进入；搜索页可以限定项目文档或搜索全站。Home 保持 projects 搜索类型，章节保持 docs 类型。是否有可搜索章节从 navigation 判断，不再生成 docsPath。Pagefind 与中文静态备用索引采用相同项目筛选规则，不增加服务端搜索请求。

内容修改通过 PR，构建后发布，无网页正文编辑器。构建不自动拉取或复制外部项目仓库；开发者依据 [来源与同步规范](project-sources.md) 核对上游变化并维护本站内容，网站可独立构建。

## 项目展示与安装入口

项目可填写 `category`（项目类别）、`featured: true`（保留的推荐元数据，当前时间首页不消费）和 `start: { label, doc }`。`doc` 引用本项目的文档稳定 ID，不是 URL；构建要求目标在当前模式可见且已加入导航。项目 Home 用它生成安装／开始入口，修改文档 slug 不会使按钮失效。项目列表按 category 分组，缺少类别时归入“个人项目”；卡片名称与“文档 →”都链接到 Home，不展示封面、状态、技术栈或底部双入口。卡片不推断项目开源状态。

当前真实内容包含 FIA、fn、agent-webtool 与本站。FIA 和 fn 分别在 `content/projects/fia/`、`content/projects/fn/` 维护，统一从项目集合页进入，时间首页不再展示项目推荐。资料、版本差异和跨项目同步流程见 [内容核对记录](project-sources.md)。各外部项目内容变更由 `docs/impact.json` 同时关联内容规范和来源记录；单纯文字修正无来源影响时按 PR 规则说明原因。fn 官网固定为 `https://semicoder.dev/fn`，统一安装入口为 `/fn/docs/installation`；应用更新文件继续由独立更新源提供。新增正式安装包时先核实 Release、文件、平台与签名状态，再更新 fn 安装页；框架 `.tgz` 不能标为应用下载。网站不代理安装包，不在访问时请求 GitHub 或 npm。

fn 安装页明确标注“本地开发、尚未发布”，提供本地源码构建和 SDK 归档使用步骤，不提供尚不存在的 fn DMG 或 npm 安装入口。应用 0.4.3 / build 7、SDK 0.3.2 / manifest 0.3 是当前源码版本；相同版本号不代表原名产物就是 fn 产物。npm、应用 DMG 与网站部署状态分别核实。

agent-webtool 的介绍和安装/SDK/CLI/MCP 指南在 `content/projects/agent-webtool/`，默认使用已独立验证的公开 npm 0.7.1，包含 `SourceContext` 和 0.6.0 升级说明。项目的 CI 与 OIDC 发布已验收；网站内容和部署继续独立验证，不自动发布 npm 包。

主操作按钮悬停使用强调背景与深色前景 `--on-accent`，避免浅深色模式下白字与橙色背景对比不足。

## fn 插件开发手册

fn 共 14 篇指南，其中 8 篇覆盖插件开发：工程入口、清单、前端 API、后端 API、基础 UI、浮层反馈、样式主题、构建分发。导航按开始使用、使用指南、插件开发、UI 与样式、自动化分组。项目 Home 提供站内直达入口。2026-10-14 按用户确认同步 project-fn / docs-fn-* 及 /fn 路径，不保留旧 ID 或 URL 别名。

代码示例作为静态 Markdown 代码块展示，不在网站执行，不导入 SDK 或相邻工作区；组件与 API 以来源记录中注明的源码或发行归档核对，代码提取到独立临时插件工程验证。更新 SDK 时按公开导出核对全手册，同时维护版本边界、来源记录、站内链接、搜索与构建结果。

## 分发目标与本地状态

fn 目标仓库为 `semicoder-dev/fn` 和 `semicoder-dev/fn-plugins`；Git remote 保持当前真实旧地址。目标更新源为 `https://semicoder-dev.github.io/fn/updates/latest.json`，使用独立 `fn-updates-site` 生成分支；旧更新历史不读取或改写。当前官网只提供本地构建与归档使用步骤，等待 GitHub 更名、SDK 和插件公开验收、应用发行及网站部署后再增加公开入口。

官方插件暂用仓库内 `vendor/fn-sdk.tgz`，记录来源与哈希；新市场索引为空，不将旧归档登记为 fn 已发布插件。新应用身份使用独立数据目录，不提供旧名称、旧插件兼容或迁移。

## 更名前的历史同步记录

以下记录保留当时名称和发行边界，不代表 fn 已发布；当前页面按上方状态维护。

2026-10-09：FIA 0.17.0、麻辣烫 0.3.0 / build 3 与 SDK 0.2.1 的公开产物核验后，默认安装与指南切换到新版本，补充浏览器授权、文件选择、隔离预览、SDK 定位参数和完整 DMG 升级说明。沿用现有路由；来源及各发行渠道证据见 `project-sources.md`。

FIA 0.18 的标题栏置顶说明沿用现有 development 章节和稳定路径；安装入口采用经过公开归档独立验收的 0.18.0，麻辣烫 0.4.0 同步采用该官方固定归档，旧版本快照保留在来源记录中。

2026-10-11：麻辣烫插件相关指南追加“插件市场开发中、未发布”说明；保留公开 0.4.1 的使用步骤，不将未发布索引或候选归档列作默认安装入口。

2026-10-11：应用 0.4.2、SDK 0.3.1 与官方市场公开产物验收后，安装入口及插件/开发/开始使用/CLI/排障指南切换到新版本；旧安装记录不迁移，明确升级前卸载旧手动插件。来源与验证见 project-sources.md。

### 2026-10-11 组织资源与迁移说明

项目源码、发行和问题入口统一使用 `semicoder-dev`；个人介绍与个人账号链接保持原义。更新当前指南和固定版本源码链接时，历史来源记录继续保留当时地址。麻辣烫更新站为 `https://semicoder-dev.github.io/malatang/updates/latest.json`，官网仍只提供安装说明和已核验 Release 链接。0.4.3 的旧用户须完整 DMG 安装，并手动替换已有旧市场源；新数据目录默认使用组织官方索引。官方翻译、随手记 0.1.1 固定 SDK 0.3.2，ID 和数据命名空间不变。

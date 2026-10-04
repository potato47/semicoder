# 项目资料与发布状态

核对日期：2026-10-04。网站内容由本站维护，不在构建时复制外部工作区，也不依赖未公开源码。

## FIA

- 本地源码基线：`8650f80f4a119e9b28059639acdb8dde1422a84a`。参考 `README.md`、`docs/framework/README.md`、`packages/cli/src/template.ts` 与 `packages/cli/README.md`。
- 匿名 npm registry 查询 `@semicoder/fia`，`latest` 为 `0.16.1`。已下载该版本归档核对 README 和框架契约：它的正式 release 仍输出 ZIP，不含后来 DMG、原生外观、OAuth 回调等全部改进。
- GitHub 匿名 API 读取 `potato47/fia` 返回 404，无法证明公开可访问；项目不配置源码按钮，也不要求访客克隆该仓库。
- 文档基础教程面向 npm 0.16.1；固定构建的新增能力单独注明。更新 npm 后必须重新检查差异，不能只比版本字符串。

## 麻辣烫

- 公开源码基线：`300453def9ac082b21922f3216f4f41be25a89ef`。依据 `README.md`、`shared/api.ts`、`packages/sdk/README.md`、`packages/sdk/build.ts`、`frontend/PluginManager.tsx`、`release/runtime-lock.json` 与发布说明。
- 匿名 GitHub Releases 当前只返回两个 `fia-runtime-*` 预发布，没有应用 DMG。未使用会误导读者的 latest 安装包按钮。
- 安装教程固定源码提交和 `fia-runtime-8650f80f4a11` 附件，先 SHA-256 校验再解压到相邻依赖目录；SDK 从源码 workspace 获取，未声称已发布 npm。
- 官方登录与一次真实翻译的历史验证来自项目记录；本站集成不代表新增真实模型、账号或自动更新验收。

## 维护入口

FIA 介绍和 5 篇指南位于 `content/projects/fia/`；麻辣烫介绍和 7 篇指南位于 `content/projects/malatang/`。发布状态首先更新各自安装页，再同步项目介绍与版本说明。发布后的下载链接应使用真实 Release 及其附件，保留平台要求与安装步骤；不要将 CI artifact 或框架包伪装为正式应用。

本站只链接公开源码和包地址，不托管二进制，不发布 FIA 或麻辣烫。网站随主干既有工作流执行质量检查、预发布和生产发布。

## 本次验证

- 网站 `bun run check`、28 项单元测试、11 项 Workers 测试、生产构建与 `build:check` 通过；30 个公开静态页面（另有后台预渲染页），包括全部新文档的 canonical、目录锚点、草稿隔离和真实 Pagefind 项目筛选。
- 在全新临时目录通过匿名公开源码克隆、固定 FIA 下载及 SHA-256 校验，完成麻辣烫 `check` / `build`；没有使用本地私有 FIA 源码补齐依赖。
- 公开 npm FIA 0.16.1 实际创建默认应用并完成 `check` / `build`；文档中的笔记插件代码实际经 SDK 构建与 `bun pm pack`。以上未启动真实模型或访问用户账号。
- 生产预览经 ego-browser 检查首页、项目、文档、安装入口、中文项目搜索、手机章节和项目切换；检查 1440px 桌面与 390px 手机布局、浅深色主题。
- 内容与安装验证未执行手动部署，也未发布应用或 npm 包；网站上线以主干工作流结果为准，正式应用下载和在线更新仍以 Release 的真实状态为准。

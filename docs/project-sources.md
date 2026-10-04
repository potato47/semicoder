# 项目资料与发布状态

核对日期：2026-10-04。网站内容由本站维护，不在构建时复制外部工作区，也不依赖未公开源码。本文分别记录首次正式发行、此前公开来源验收和网站本地验证。当前发行证据来自正式 Release、附件和发布工作流；本次未重新核验 FIA 或 SDK npm registry，网站上线需另核部署结果。

## FIA

- 本地源码基线：`8650f80f4a119e9b28059639acdb8dde1422a84a`。参考 `README.md`、`docs/framework/README.md`、`packages/cli/src/template.ts` 与 `packages/cli/README.md`。
- 匿名 npm registry 查询 `@semicoder/fia`，`latest` 为 `0.16.1`。已下载该版本归档核对 README 和框架契约：它的正式 release 仍输出 ZIP，不含后来 DMG、原生外观、OAuth 回调等全部改进。
- GitHub 匿名 API 读取 `potato47/fia` 返回 404，无法证明公开可访问；项目不配置源码按钮，也不要求访客克隆该仓库。
- 文档基础教程面向 npm 0.16.1；固定构建的新增能力单独注明。更新 npm 后必须重新检查差异，不能只比版本字符串。

## 麻辣烫

- 当前正式版本：`v0.1.0` / Build `1`，公开源码固定提交 `f1b1c7fc60120c9af1c41dd14b1c35b532fc6bc8`。安装页的 DMG、源码步骤、模型和插件开发指南统一对应本次发行。
- 正式发行：[Malatang 0.1.0](https://github.com/potato47/malatang/releases/tag/v0.1.0)。已核实非 draft、非 prerelease；实际 DMG 为 `Malatang-0.1.0-1-mac-arm64.dmg`，SHA-256 为 `89bb30ef97076066f06cd45b61f65e724e9442e96504d4be5dd3e4ededbfb79d`，同页提供校验文件与验证报告。
- 本次发布工作流 [Release Malatang](https://github.com/potato47/malatang/actions/runs/37214205671) 完成固定框架归档恢复、冻结安装、代码检查、测试、签名、公证和产物校验；公开 [DMG 报告](https://github.com/potato47/malatang/releases/download/v0.1.0/Malatang-0.1.0-1-mac-arm64.dmg.report.json) 为 `ok: true`，镜像内应用启动、运行时/后端就绪、普通退出及受管进程清理检查通过；报告未覆盖桌面交互。该流程使用公开固定框架归档构建，不依赖本地 FIA 私有源码。
- 框架仍固定 `fia-runtime-8650f80f4a11` / `semicoder-fia-0.16.1.tgz`，SHA-256 为 `e4206d0a416526e21df6387a64ca847c249fc2b9ede5db6e8c84494274ff9a16`；它是开发依赖，不是应用安装包，未因官网内容更新重打归档。
- 本次源码使用 Pi AI `1.0.2` 与 `@semicoder/malatang-sdk`。模型目录的明确 ID 迁移和不可用提示已纳入指南。SDK 仍由源码 workspace 提供，应用标签不会触发独立 `sdk-v*` npm 发布流程，本次未宣称 SDK 已发布 npm。
- 更新清单 `https://nobug.space/malatang/updates/latest.json` 已匿名核验 HTTP 200，与 Release 更新归档中的签名清单逐字节一致；Ed25519 签名及线上 13 个文件的 size / SHA-256 校验通过。version / build 为 `0.1.0` / `1`，runtimeId 为 `18501858e7bfb52a1e526a553d4e7949532f5d3cee5b030ed7bc03a42b03238d`，完整安装 downloadURL 指向官网安装页。跨版本升级尚未实测，早期验收包改用正式 DMG 安装。
- 已独立通过匿名 curl 下载正式 DMG：SHA-256 与校验文件和 GitHub asset digest 一致，`hdiutil verify` 返回 VALID，`xcrun stapler validate` 成功，`spctl` 接受为 Notarized Developer ID。只读挂载后，应用 `codesign --verify --deep --strict` 与 `spctl -t execute` 通过；`verifyRelease(updates, mountedApp)` 确认安装包 runtime / version / build 和全部代码与签名更新一致，检查后已卸载镜像。
- 真实 ChatGPT 登录与一次订阅翻译来自历史验收记录；本次发行和网站集成不代表所有服务商、模型、真实令牌刷新或撤销均已验证。

## 维护入口

FIA 介绍和 5 篇指南位于 `content/projects/fia/`；麻辣烫介绍和 7 篇指南位于 `content/projects/malatang/`。发布状态首先更新各自安装页，再同步项目介绍与版本说明。发布后的下载链接应使用真实 Release 及其附件，保留平台要求与安装步骤；不要将 CI artifact 或框架包伪装为正式应用。

本站只链接公开源码和包地址，不托管二进制，不发布 FIA 或麻辣烫。网站随主干既有工作流执行质量检查、预发布和生产发布。

## 跨项目更新流程

| 变化来源                                  | 本站核对位置                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| FIA API、原生能力、CLI、构建与平台要求    | FIA 项目介绍、shared-api / development / automation / installation / distribution 指南 |
| 麻辣烫设置、模型/账号、插件安装与生命周期 | 麻辣烫项目介绍、getting-started / models / plugins / troubleshooting / automation 指南 |
| SDK 包名、manifest、构建方式与方法        | plugin-development、项目介绍；与安装指南的源码版本保持一致                             |
| 公开应用、npm SDK、固定 FIA 归档          | installation、plugin-development、本来源记录；核对 tag、文件、平台和 SHA-256           |

1. 确认变更所属项目、源码提交、对应契约及已验证行为；框架或应用缺陷反馈源仓库修正，网站不创造新的 API 约定。
2. 分开核对本地实现、公开可获取产物和网站部署版本；官网无需和源码同时升版，但默认安装路线必须完整可复现。只更新文案时不重打运行时归档。
3. 先改安装页及版本范围，再核对介绍、指南、导航、站内引用；发布状态或来源改变时记录日期、提交、归档/哈希和验证结果。没有变化的检查不制造新发布结论。
4. 依据 `docs/impact.json` 同步工程文档。仅工程 Markdown 修改检查事实、链接、格式与 `docs:check`；公开 `content/` 正文变化须生成内容、执行 `content:check`、生产构建及 `build:check`。命令变化实际验证相应步骤，路由或代码变化依项目规范执行相关完整检查。
5. 交付分别说明源项目、本站及 workspace 知识库的修改与待办。网站 `main` 推送会部署；应用 `v*` 与 SDK `sdk-v*` 发布在麻辣烫仓库，FIA npm `v*` 在 FIA 仓库，均不由本站操作代替。

`docs/impact.json` 只能发现本站仓库内的修改；相邻项目变更仍需在开发任务交付时主动核对。源码仓库不可用时保留已验证快照，记录缺少的来源，不猜测最新行为。麻辣烫更新源由应用的 GitHub Pages 发布流程维护，与本站内容部署独立，不能只因官网整合就改为本站域名。

## 本次正式发行与官网文档同步

2026-10-04，网站在既有本地下载入口修订上接续更新：默认安装路线改为真实 DMG，源码锁定 v0.1.0 提交，模型和 SDK 教程统一到同一公开版本，并更新 FIA 分发页中的应用下载状态。

官网为 `https://semicoder.dev/malatang`，统一安装入口为 `https://semicoder.dev/malatang/docs/installation`；应用更新源仍由麻辣烫发布流程维护。官网本地内容完成不等于线上页面已部署，网站提交、推送和部署状态另行记录。

本次官网文档提交前，本地 `bun run check`、28 项单元测试、11 项 Workers 测试、生产构建与 `build:check` 全部通过。30 个公开静态页面的 canonical、章节锚点、草稿隔离与真实 Pagefind 项目搜索通过；额外核对安装页 HTML 包含真实 Release / DMG / SHA 链接、固定源码提交及升级验证边界。`git diff --check` 通过。线上部署结果由 workspace 知识库的交付记录单独追踪，不从本地检查或 Git 推送推断。

## 正式发布前的下载与官网入口复核（历史）

2026-10-04，本地网站基线 `47b2955caa76`、麻辣烫 `451d16559826`。本次匿名请求与浏览器检查结果：

| 入口                                               | 结果                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| GitHub Releases 列表                               | HTTP 200，仅两个 `fia-runtime-*` 预发布，各含一个框架 `.tgz`；无应用 DMG      |
| GitHub 最新正式 Release API                        | HTTP 404，尚无稳定发行版                                                      |
| `https://nobug.space/malatang/updates/latest.json` | HTTP 404，尚无公开稳定更新清单                                                |
| `https://semicoder.dev/malatang/docs/installation` | 线上页面可读取，仍显示未发布状态，与发行记录一致                              |
| 仓库 About website                                 | 原为空；已在 GitHub 保存为 `https://semicoder.dev/malatang`，可见链接确认成功 |

官网统一为 `https://semicoder.dev/malatang`，安装入口为 `https://semicoder.dev/malatang/docs/installation`。本地应用完整安装跳转、npm homepage、后续 Release 说明及更新站首页已同步上述地址，待对应产物发布后生效；代码更新清单和下载文件继续使用原更新源，不迁移到内容网站。

本次修正安装页、项目介绍和常见问题的状态说明，不创建猜测的 DMG 直链，也不把 Actions 验收产物当作公开下载。当时缺少首次正式发行；本次发行结果见上方记录。网站推送/部署、正式 Release 与 SDK npm 发布各自单独完成；公开源码安装快照保持不变。

## 前次本地同步核对（历史）

2026-10-04 以本地 FIA `8650f80f4a11`、麻辣烫 `f836a06d9326` 和本站改动前 `c5f7878d0d32` 为证据，补充跨项目规范、来源影响映射与模型指南版本范围。固定 FIA 归档和安装快照保持不变；本轮没有新增应用构建、真实账号/模型、npm 发布或网站部署验收。

## 首次官网集成验证（历史）

- 网站 `bun run check`、28 项单元测试、11 项 Workers 测试、生产构建与 `build:check` 通过；30 个公开静态页面（另有后台预渲染页），包括全部新文档的 canonical、目录锚点、草稿隔离和真实 Pagefind 项目筛选。
- 在全新临时目录通过匿名公开源码克隆、固定 FIA 下载及 SHA-256 校验，完成麻辣烫 `check` / `build`；没有使用本地私有 FIA 源码补齐依赖。
- 公开 npm FIA 0.16.1 实际创建默认应用并完成 `check` / `build`；文档中的笔记插件代码实际经 SDK 构建与 `bun pm pack`。以上未启动真实模型或访问用户账号。
- 生产预览经 ego-browser 检查首页、项目、文档、安装入口、中文项目搜索、手机章节和项目切换；检查 1440px 桌面与 390px 手机布局、浅深色主题。
- 内容与安装验证未执行手动部署，也未发布应用或 npm 包；网站上线以主干工作流结果为准，正式应用下载和在线更新仍以 Release 的真实状态为准。

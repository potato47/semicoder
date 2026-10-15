# 项目资料与发布状态

## 2026-10-16 网络工具发行

- agent-webtool `v0.8.1` 固定 `150275a6da3b7eac4777259da8b4a80370f7f749`。三平台 CI 38822757505、候选 38822756040、OIDC 38822896341 成功；公开归档与候选及正式产物一致，SHA-256 `e623cbac66fc9f43c4d6a8e4d80f77b73ee75d07fb7060fda733a15f0705107f`。Node 20/24 新缓存独立 SDK/CLI/MCP 消费及 provenance 通过。
- SDK `sdk-v0.3.5` 固定 `8f38541e6731d847aa806c7ae93ea1985e11678e`，候选 38823701388、OIDC 38824246359 成功；公开归档 SHA-256 `39daa73ac992e9deabce84967c93d7f461eddb2c1e850ade32500c50e23683e6` 与本地/CI 一致，provenance 与新缓存独立插件构建通过。首次正式检查暴露宿主安装终态早于清理完成的竞态，应用修复并增加回归；SDK 内容不变，原标签重跑全部检查后发布。
- fn `v0.4.5` / build 9 固定 `690eb1d0962b07a08e5c271e000037a5d484e6e2`，候选 38824928141、[正式发行 38825817130](https://github.com/semicoder-dev/fn/actions/runs/38825817130) 成功。本地 check、113 测试/1179 断言、build 与 FIA 独立消费通过。公开 DMG 为 36,014,151 字节，SHA-256 `3d2bd971e3d0ac654bf5139d54b97593bf502eaf03b6802ebc443ea69a28421e`；五附件匿名摘要、签名、公证票据、Gatekeeper 通过。

公开应用内嵌 SDK 45 文件与 npm 一致，HTTPS 更新清单签名和全部 30 文件通过；runtimeId `11d652150693100bf055d58a4b72bf6ce360b047317e34ff47611531a31f3872`。全新隔离实例中，公开 SDK 构建的临时插件前后端抓取 200、四引擎真实搜索及前端 AbortError 通过；现有官方插件 0.1.2 均安装激活。前端产物不含服务端 agent-webtool。

fn 新增前后端 web.search/fetch、短期内存任务和取消/重连，精确依赖公开 agent-webtool 0.8.1；不再使用开发归档。manifest 0.3、官方插件 0.1.2 及其精确 SDK 0.3.4 不变，旧插件不强制重建。新接口需要 fn 0.4.5 / SDK 0.3.5；本次运行时标识不同，需要完整 DMG，保留现有 fn 数据。

官网介绍、安装、前后端 API、自动化与上游 SDK 说明按公开产物更新；部署与独立线上验收由 workspace `docs/agent/sessions/2026-10-16-fn-web-release.md` 记录。下面历史发行证据保留。

## 2026-10-15 agent-webtool 0.8.0

`v0.8.0` 固定 `1b13f494008b68d527dbe07e7368201e3757bb67`，MCP 依赖锁定 server/client 2.3.1，使用 `serveStdio` 支持 2026-07-28 与五个旧协议。工具增加 `outputSchema` / `structuredContent`、严格输入校验、取消透传及连接级来源上下文。未知输入字段返回工具校验错误，未知或被筛除的工具返回 -32602；SDK 返回类型、CLI 命令和 Node >=20.18.1 不变。

[三平台 CI 38757514787](https://github.com/semicoder-dev/agent-webtool/actions/runs/38757514787)、[手动归档 38757513695](https://github.com/semicoder-dev/agent-webtool/actions/runs/38757513695) 和 [真实 OIDC 38758509941](https://github.com/semicoder-dev/agent-webtool/actions/runs/38758509941) 成功。公开 tarball 与发布工作流归档逐字节一致，SHA-256 `910cfefc92a2ac8106146afaae49973da4f016622b6997bc493e579a65b020b4`；npm latest 为 0.8.0，provenance 指向该组织仓库、标签与提交。新缓存独立 registry 安装在 Node 20.18.1 / 24 上通过 ESM/CJS、TypeScript、两个 CLI 及六个协议的发现/初始化、schema、筛选、错误和 EOF 验收。源码 103 项离线测试 / 607 断言另覆盖成功结果、自动协商、并发、来源隔离及取消/关闭。

用户追加“发布”授权后完成发行；GitHub npm 环境仅增加精确 v0.8.0 标签许可，未更改其他保护。官网默认入口在公开产物验收后切换至 0.8.0，五篇介绍/指南及兼容说明同步。网站质量、预发布/生产部署和线上验收独立执行，最终结果记录于 workspace 的 `docs/agent/sessions/2026-10-15-agent-webtool-mcp-v2.md`。本轮未验证真实搜索引擎或具体桌面 MCP 客户端；此前同名 0.7.1 开发归档不作为公开版本证据。

## 2026-10-15 fn 首次发行

用户明确授权 GitHub 更名及按 SDK、插件、应用、官网顺序发布。两个仓库原生更名为 `semicoder-dev/fn` / `semicoder-dev/fn-plugins`，仓库 ID、历史标签和 51 个附件的身份/大小/哈希保留。Git remote 与分发地址已同步；GitHub 自身的旧地址跳转不作为应用或官网兼容层。

- SDK 0.3.3 使用完整验收归档完成首次创建；npm 在处理首次发布时自行生成的 `0.0.0-stage` 占位记录不是 SDK，未运行 staged publish。随后为新包配置限定 fn 仓库、`publish-npm.yml` 与 npm 环境的 Trusted Publisher，`sdk-v0.3.4` 固定 `38c93301fccf07bc6e979b062cb8d6c21bc36022`。实际 [OIDC 38689178626](https://github.com/semicoder-dev/fn/actions/runs/38689178626) 成功，latest 为 0.3.4；SHA-256 `255abaa94ef839a57810e7ce9aad87c873cd9578430fd9b427c7994cf901cbf5` 与 CI/本地产物一致，provenance 的仓库、标签、提交及归档摘要通过。新缓存独立安装、notes/model 创建/检查/构建/打包、UI/runtime/backend 与旧清单拒绝通过。
- 官方译文 0.1.2 固定 `e6eebdac3f30ece19bd12ca5f336a91651ddcead`，随手记 0.1.2 固定 `11f6b6814166f8ff147a8145031f8052616122ef`，均精确消费 SDK 0.3.4。归档 SHA-256 分别为 `73dc775fb7e5b5d2125c1d01ed79f9a854bc8c6e54f6695cea421f17921bc938`、`ba05a8bba6c35de9b32a488d55bbdf9e928e5aea5b780fdbdc6964080ffdccff`。公开归档匿名验收后，市场 PR #8/#9 经 CI 合并；公开索引与候选条目逐项一致。旧 vendor 归档只保留历史，不参与当前依赖。
- 应用 `v0.4.4` / build 8 固定 `0ddaeaaff7257085ff5a421b9fbc8b04c48a6440`，[正式流程 38690994572](https://github.com/semicoder-dev/fn/actions/runs/38690994572) 成功。公开 DMG `fn-0.4.4-8-mac-arm64.dmg` 为 35,442,136 字节，SHA-256 `0258a257fec62dd3a4c081572103053a9025a4ffdabb9379f8f0a805c5909994`。镜像、签名、公证票据、Gatekeeper、内嵌 SDK 43 文件与公开 npm 一致性通过。
- 更新源 Ed25519 签名、全部 30 个 HTTPS 文件的大小/哈希及与 app 的逐文件一致性通过；runtimeId `63fc8f3442ec566b4502fa3e008db0a67237043546055380be32c71ff789d5b2`。全新数据目录最初没有模型或插件，从官方市场安装两个 0.1.2 插件并激活，页面、KV 保存/刷新恢复和临时目录安装的 fn CLI 通过。新 fn Dev 中公开译文归档使用用户已授权的 GPT-6-Luna 完成真实调用；未读取或迁移旧应用数据。首次 fn 发行暂无跨版本公开应用升级实测。

官网全部 fn 指南、安装入口、内容 ID、导航和跨项目引用按这些公开产物同步，保持无旧路径重定向。网站质量、两环境部署与线上验收在 main 推送后独立执行，最终证据记录于 workspace 的 `docs/agent/sessions/2026-10-15-fn-release.md`；本节不以项目发布代替网站上线。以下为历史阶段记录。

## 2026-10-15 fn 发布前验收（历史阶段）

来源仍为应用 a304dfa、官方插件 8db83bd。新 fn Dev 由用户完成官方 OAuth，使用账号目录中的 GPT-6-Luna，通过本地官方译文归档完成一次真实调用，后台事件、终态及浏览器结果一致；正常退出重启后账号、模型及结果持久化。未验证令牌刷新/撤销、其他模型或正式签名公证。本次修正模型页残留的 0.4.1 / 已有 DMG 说明，统一为 0.4.3/build 7 本地源码与尚未发布边界；安装方式和契约未变。

远端仅只读核对：新官网 /fn、更新源、市场和 SDK registry 仍返回 404；旧官网仍在线。GitHub / npm 浏览器管理权限可用，CLI 认证 401；旧包 Trusted Publisher 不代表新包已配置。本次没有远端修改、推送、发布或部署，官网仍保留本地构建入口。

## 2026-10-14 fn 更名（本地开发、尚未发布）

来源基线：应用 cc183e1、官方插件 678558f、本站 34765af，均在本地 codex/rename-fn 分支重构。应用目录改为 fn，插件目录改为 fn-plugins；应用标识 com.semicoder.fn，SDK @semicoder/fn-sdk，manifest fn，官网 /fn，内容 ID project-fn / docs-fn-*。用户明确覆盖本次稳定 ID 规则，不保留旧 URL 或迁移关联数据。

用户随后授权提交并合入各仓库本地主干：应用来源固定 `a304dfa`，官方插件来源固定 `8db83bd`，两者均已快进合入本地 main；官网同步随本节所在提交保存。保留 codex/rename-fn 分支，暂不推送、发布或部署。SDK 固定归档与应用提交逐文件核对一致，来源哈希保持不变。

新 SDK 仅通过经过校验的本地归档消费，插件市场索引为空；安装页提供本地源码构建与插件归档步骤。新名称的 GitHub、npm、应用、市场和官网尚未发布，本次未执行任何远端操作。版本号保持原值不能证明公开产物相同。旧名称、标签、URL、哈希与以下历史发行证据保持当时事实。后续需分别验收 GitHub 更名、新 SDK、插件归档及索引、完整 DMG 和网站部署，再提供正式下载入口。

## 更名前的公开状态与布局

以下保留 2026-10-11 的发行事实和当时目录名称；当前本地状态以上方更名记录为准。

公开发行核对：2026-10-11；麻辣烫 0.4.3 / build 7、SDK 0.3.2、agent-webtool 0.7.1 和官方插件 0.1.1 已实际发布并验证，FIA 独立 npm 保持 0.18.0。网站内容由本站维护，不在构建时复制外部工作区。分别记录源码、公开固定归档、npm 和正式应用产物；网站上线以独立部署工作流为准。

Semicoder 是各自有项目统一的官网文档入口。当前工作区已更名为 `semicoder-workspace`，包含 FIA、麻辣烫、malatang-plugins、Semicoder 和 agent-webtool 五个开发项目；FIA 活跃源码已迁入麻辣烫，原独立仓库保留历史；本站为工作区内实体目录。该布局只用于维护协作，不作为本站运行/构建的前提。

## 2026-10-11 组织迁移与首次发行

五个仓库通过原生 Transfer 迁入 `semicoder-dev`，保留仓库 ID、原有标签和 42 个 Release 附件的 ID/size/digest；根知识仓库继续仅本地维护，参考项目未涉及。当前资源链接使用组织地址；下方历史记录保留当时的个人仓库地址。

- 应用 `v0.4.3` / build 7 与 SDK `sdk-v0.3.2` 固定 `34faa9890eed6475516dfa823d664d92181966f5`。应用 [正式工作流 38117729757](https://github.com/semicoder-dev/malatang/actions/runs/38117729757) 成功；DMG SHA-256 `b83c7fb57aee9829d8adc09086821d8e2eb3cb773fffc554f975c117e16b575f`，35437084 字节。签名、公证、Gatekeeper、安装包与更新文件一致性、Bun 1.4.3、隔离启动退出通过。全新数据目录从新默认市场安装两个 0.1.1 插件并激活、KV 读写通过；本轮不重复真实模型调用。
- 新更新站 `https://semicoder-dev.github.io/malatang/updates/latest.json` 使用独立 `updates-site` 分支，从空历史初始化；签名和 30 个在线文件大小/哈希验收通过，更新下载禁止重定向。runtimeId `ee666cda40041089e002b7e202ac69aecc68eca3034208d4346bee27df129a84`。旧 `gh-pages` 和附件原样保留，不重签名，不提供旧地址回退或自动迁移。
- SDK [OIDC 38117101769](https://github.com/semicoder-dev/malatang/actions/runs/38117101769) 成功，公开 npm 0.3.2 SHA-256 `901b4ee1a5b8cbf8607645689129fd72ad05bde4dc3ee7972f3fe2d58f53fd7f` 与 CI 逐字节一致，组织 provenance、新缓存独立消费、notes/model 模板和 runtime/UI/前后端构建通过。manifest 保持 0.3。
- agent-webtool `v0.7.1` 固定 `19455496011284608f7742c45ae7a6361ec3d323`，[OIDC 38116631403](https://github.com/semicoder-dev/agent-webtool/actions/runs/38116631403) 成功，公开归档 SHA-256 `b23caa32610e41ba767740df348c577b88004d1d82413135a51401c9f5f2d8c0` 与 CI 一致。组织 provenance、新缓存 SDK ESM/CJS/TypeScript、CLI 与 MCP 验收通过，API 不变。
- 插件源码 `a6a949134703b6c88d43641261888bd75a1a5d97` 固定 SDK 0.3.2。翻译 0.1.1 SHA-256 `d42181bd290f938170dd7209dd6358f731017c6ac5e05cafaa4262e706a45077`；随手记 0.1.1 `fcfd8422211093d17fa9cdcc7ced2a06785cc93bcea28337ee9c877b41916da6`。公开归档和索引经 PR #5/#6 验证后上架，插件 ID 与数据命名空间不变。
- npm 包名保持不变。两个活跃包的 Trusted Publisher 均已重建并显示 Valid；FIA 旧连接已移除，独立 npm 工作流停用，npm 保持 0.18.0。官网与 Cloudflare Worker/D1/域名不搬迁，个人身份链接保留。预发布 OAuth App 3870528 与生产 3870529 已由组织接收，Client ID、回调地址及应用配置与迁移基线一致；两站真实登录均成功回到 `/admin` 并显示管理员后台。未调整 Cloudflare 运行时密钥或 D1；本次网站部署另按工作流结果验收。

## 2026-10-11 插件开发手册

- 依据应用 v0.4.2 / SDK sdk-v0.3.1 的固定提交 `b107dee8ae5c6237593f84be8904a9916566a9ec`，本地 `975c60b` 的 SDK、shared/api.ts、shared/marketplace.ts 与相关插件/模型/存储实现相对标签无差异。
- 官网 plugin-development 保留入门及原锚点，新增 plugin-manifest、plugin-client-api、plugin-backend-api、plugin-ui、plugin-ui-overlays、plugin-styling、plugin-distribution，覆盖全部公开 SDK 导入入口和 UI 导出；内部辅助函数不视为插件 API。
- 按实现修正原教程中的过时发布叙述，明确 SelectContent/ComboboxContent 不开放浮层定位参数、前后端 KV 返回类型不同、管理 CLI 不属于 createPluginClient。SDK README 的历史标题及“未发布”说明不作为当前版本状态证据。
- 验证使用公开 npm 0.3.1 归档（SHA-256 `a9972f930035fa6d6c2792211f88ad42dda8ef1b7e7ac92ed48dcf4e31f99f5a`）和从官网正文提取的代码。四个独立示例工程的 check/build/pack、完整网站 check、38 静态页面的生产 build/build:check、桌面/手机导航与搜索验收通过；追加发布前 51 项单元测试和 12 项 Workers 测试通过；真实模型调用与应用安装本轮未验证，远端部署以本次提交的 Actions 结果为准。
- 本次只变更官网内容及知识文档，不修改应用、SDK 或 FIA 契约/版本。用户随后明确授权发布上线，沿用 main 推送后的质量、预发布、生产审核和冒烟流程；网站构建仍可脱离 workspace 运行。

## 2026-10-11 应用 0.4.2、SDK 0.3.1 与官方市场

应用和 SDK 标签固定 `b107dee8ae5c6237593f84be8904a9916566a9ec`。[应用 v0.4.2](https://github.com/potato47/malatang/releases/tag/v0.4.2) / build 6 的签名公证、Gatekeeper、隔离启动退出、安装包与更新文件一致性已通过。公开 DMG 为 35436992 字节，SHA-256 `e92d4cdd0ca4865f1592178e732201c00a756d129bf7c11e9a974cd590b223b0`；更新源签名及 30 个文件逐一验收，runtimeId `14d936e9e1127d21408150977e041bc2637c9c45d0b368a3bd3673242bc471ba`。主干 CI 38111323784、签名候选 38111324000 通过，正式发行流程见 GitHub Actions。

SDK [0.3.1](https://www.npmjs.com/package/@semicoder/malatang-sdk/v/0.3.1) 经 OIDC 发布，SHA-256 `a9972f930035fa6d6c2792211f88ad42dda8ef1b7e7ac92ed48dcf4e31f99f5a`，与 Actions 归档逐字节一致；公开 npm 新缓存独立消费与 notes/model 模板检查、构建、打包通过，manifest 保持 0.3。删除 builtin、增加市场来源及任务类型，插件 UI/模型/KV 契约不变。

[官方市场仓库](https://github.com/potato47/malatang-plugins) 已公开。翻译、随手记 0.1.0 分别使用固定公开 SDK 0.3.0 构建；真实归档身份、哈希、Raw 索引与隔离宿主市场安装通过。市场 PR #1/#2 经 CI 后合并；Actions 无 PR 创建权限时维护者补建，保护未放宽。首次公开插件尚无更高版本，更新成功/回滚覆盖采用可控 fixtures，不称为真实官方跨版本升级验收。

宿主不携带插件，首次进入应用中心；主题入口统一到设置。开发阶段不迁移旧安装记录，升级前旧版卸载手动插件，再用完整 DMG 替换。模型、凭证、KV 与历史不主动清除。官网安装及插件使用/开发/自动化/排障指南按公开产物同步；网站部署仍需另行核实工作流，不以应用已发行代替网站上线。下方“本地未发布”保留为实施阶段历史。

## 2026-10-11 主题切换入口统一（本地未发布）

麻辣烫实现提交 `f74b85b`（`codex/settings-theme-only`，基于 `181f5d6`）已按用户追加授权合入本地 main，移除 `frontend/App.tsx` 的侧栏主题按钮、`frontend/ThemeControl.tsx` 及专用样式，保留 `frontend/AppearanceSettings.tsx` 的明暗模式与配色设置。本站第一次使用指南同步唯一入口，并明确公开 0.4.1 仍有快捷按钮；安装、SDK、FIA 契约与版本均无变化。本次未推送、发布或部署。

应用 check、85 项测试、build 与 ego-browser 的三种主题 / 刷新持久化验收通过。本站 content / docs / 变更文件格式检查、生产 build 和 31 个静态页面检查通过；官网说明与本条随 `codex/settings-theme-docs` 一并提交，由用户授权整合到本地 main。

## 2026-10-11 应用 0.4.1 / SDK 0.3.0 发布

应用 [v0.4.1 / build 5](https://github.com/potato47/malatang/releases/tag/v0.4.1) 固定 `4e222972c1de39a4e241cc3c0b8a2ba8af15fce0`。[主干 CI 38069368438](https://github.com/potato47/malatang/actions/runs/38069368438)、[签名手动验收 38069379373](https://github.com/potato47/malatang/actions/runs/38069379373) 和 [正式发布 38070028805](https://github.com/potato47/malatang/actions/runs/38070028805) 均成功，包含同提交 FIA 构建、框架独立消费及安装包启动退出。公开五附件经匿名 digest / 大小校验；DMG 为 35,652,251 字节，SHA-256 `17c486c7dd4b9132eb784847813aa6090047bb440da8be58c8b709684cc0201f`。本机 hdiutil、公证票据、Gatekeeper DMG / app、应用签名及安装包与更新逐文件比对通过；公开正式 app 在临时数据目录启动、ready、退出和进程清理通过，未操作用户账号或模型。

更新源与 Release 清单一致，Ed25519 签名及全部 35 个在线文件大小 / SHA-256 通过；runtimeId `ec123685665929a602e6a12b173814d31699ff1d921332dfd1927a4e7d85fdbf`。共仓框架指纹 `6adf4f197a6dd795933c9b4e06ffc7e4ab9882660c4661aac2c074f461375186`，内置 Bun 实测 `1.4.3+c6da4a4d3`。原生 Host / Bun 变化需完整 DMG；ChatGPT 登录不迁移，重新登录及添加订阅模型，旧插件更新重建。普通密钥、插件记录、KV、外观和历史保留；跨版本代码热更新、真实 OAuth 刷新 / 撤销未在本轮实测。

用户确认一起发布应用 0.4.1 / build 5、SDK 0.3.0 和官网，FIA 独立 npm 继续暂停。SDK `sdk-v0.3.0` 固定 `1a66de5cca8c59267add5dfab9223679ac2eeb00`，[OIDC 发布 38068339338](https://github.com/potato47/malatang/actions/runs/38068339338) 成功。公开 latest 为 0.3.0，tarball 与 Actions 验收归档逐字节一致，SHA-256 `1434489308c6fcd22942a4ff1fd497edf413d87a1e86881773361b642a4b3375`；[npm provenance](https://registry.npmjs.org/-/npm/v1/attestations/@semicoder%2fmalatang-sdk@0.3.0) 已生成。新缓存独立目录从 registry 安装、两种插件 create / check / build / pack、runtime / UI 及独立插件构建通过，未使用本机 publish 或长期 token。

本次 SDK 为 manifest 0.3 / Base UI / Tailwind CSS 4 的破坏性 UI 更新，要求应用 0.4.1；旧插件须更新重建，ID / KV / 历史保留。内嵌 Bun 快照与 npm 包归档格式不同，但展开的 43 个文件逐字节一致。应用初次正式流程在测试阶段失败且无公开产物；用户明确允许修复后更新未发布应用标签，重新验收通过，SDK 标签保持不动。新版安装入口、模型 / 排障、主题及插件指南现按公开产物同步，网站部署单独验收。下方 10-10 的「未发布」为初次实施阶段历史，不代表当前发行状态。

## 2026-10-10 本地凭证文件存储（实施阶段历史）

麻辣烫 `codex/file-credentials` 工作树以 `758e5ed` 为基线，将 `backend/index.ts` 的 ChatGPT Keychain 接入替换为 `backend/chatgpt-storage.ts`；凭证文件为 `app.dataDirectory/chatgpt-auth.json`，沿用账号与 token 的 version 1 结构。数据目录 0700、文件 0600，独占临时文件写入及同步后原子替换；普通模型 API Key 和设置仍由 `platform.json` 保存。应用不读取、迁移、删除或回退到旧钥匙串，需重新登录并重新添加订阅模型；原有模型和历史保留。

模型与排障指南增加未发布版本说明。公开 v0.4.0 仍使用 Keychain，公开下载入口、FIA/SDK 契约、版本与 build 均不变。本次不推送、发布或部署；最终验证记录见 workspace `docs/agent/sessions/2026-10-10-file-credentials.md`。

用户追加要求升级 Bun 1.4.3：FIA `packages/cli/src/metadata.ts::BUNDLED_BUN_VERSION`、共仓与框架工作流及开发说明同步，内置 Bun 从构建进程复制并重新生成 runtime manifest。官网仅更新未发布共仓开发段落；已发布 FIA 0.18.0、麻辣烫 0.4.0 的 Bun 1.4.2 快照继续保留，普通插件开发的最低 Bun 要求不变。未来发行需完整安装包，实际产物与独立消费验证由同一会话记录归档。

## 2026-10-10 本地 UI / SDK 重构（实施阶段历史）

麻辣烫实现提交 `ad9a587`，基线 `5bf293f`，本次源码采用 @base-ui/react 1.9.0、Tailwind CSS 4.3.3 和 SDK manifest 0.3。来源包括 packages/sdk/src/ui、theme.css、styles.ts、build.ts、frontend 和内置插件；包版本与应用 build 未调整。SDK 归档独立消费已本地验证，完整 UI 验收由 workspace 会话记录归档。

用户随后要求收尾并合入本地主干：麻辣烫 `main` 已快进至 `7290479`（实现 `ad9a587`，后续只补待发布来源），保留 `codex/base-ui-refresh`。本站本轮说明随 `codex/base-ui-docs` 一并合入本地 `main`，特性分支保留；合并不代表公开发行或网站部署。

本站插件开发、开始使用、模型和插件管理指南增加明确未发布说明，保留公开应用 0.4.0 / SDK 0.2.1 的默认安装和代码示例；未推送或部署。无 FIA 契约、网站运行时或安装入口变动。

## 2026-10-10 本地共仓重构（实施阶段历史）

用户确认麻辣烫是 FIA 第一个正式项目，先在应用仓库共同开发，稳定后拆出框架。麻辣烫 `codex/fia-integration` 以不压缩 subtree 导入 FIA `0a319af8619578f3a3c99a34d389886499166d9d`，来源应用基线 `c766a05db213f673a2e74bb7373aeee8fb3ffde9`；活跃框架路径为 `framework/fia/`，顶层原 FIA 仓库保留历史。

本次改为 workspace 依赖与根锁文件，开发命令自动构建/监督框架，CI 从同一提交构建原生运行时；源码开发增加 Swift 工具链要求。版本号仍为 FIA 0.18.0 / 应用 0.4.0，不代表与公开产物相同。FIA npm 共仓发布禁用，现有 npm、DMG、更新源与正式源码快照不变。

本地网站仅补充明确的未发布说明；原正式下载及 v0.4.0 固定源码教程继续保留。代码、官网文档均未推送或部署；真实 GitHub runner / 签名公证 / 公开发行未在本轮验证。源码实现验收基线为麻辣烫 `80f38d9`，最终本地验收由 workspace 会话记录归档。本站文档与内容检查、生产构建及 31 个静态页面检查通过；没有网站运行时或构建依赖本机 workspace。

## FIA

### 当前发行：0.18.0（2026-10-09）

- [公开源码与 v0.18.0](https://github.com/potato47/fia/tree/v0.18.0) 固定 `85206f6f532242fb2dfcfdf2a4b608f131726bf5`，新建公开仓库已匿名核实。新增每个原生网页窗口的置顶图标，默认模板自动包含；点击切换普通/浮动层级，隐藏/后端重连保留，窗口销毁/退出后重置。已有应用需完整重建分发。
- [手动验收 37887494256](https://github.com/potato47/fia/actions/runs/37887494256) 与 [正式标签 OIDC 发布 37887890823](https://github.com/potato47/fia/actions/runs/37887890823) 成功，覆盖版本校验、macos-26 arm64 运行时、73 CLI / 48 Swift 测试、归档校验及 artifact 传递。npm Environment 仅允许精确 v0.18.0；Trusted Publisher 限定仓库/工作流/环境，未使用长期 npm token。
- registry latest 为 0.18.0，公开 tarball 与正式 Actions artifact 逐字节一致，SHA-256 `faf196b9408cc2fa4b9edfb0145c592a9a87b6fbc0b0245ad6b89c6c0e7ff4e2`。在 workspace 外通过公开 npm 创建默认应用，检查、构建、启动验收通过；置顶/取消置顶的原生交互已验证。
- 麻辣烫 0.4.0 已切换同一官方固定 FIA 0.18.0 归档并接入置顶，SDK 仍为 0.2.1。本站安装入口、介绍、开发指南和分发说明同步；网站部署证据另行记录。

### 0.17.0 发行（2026-10-09，历史）

- 公开 npm `@semicoder/fia@0.17.0`，registry latest 已核实为 0.17.0；源码 / 本地 v0.17.0 标签为 `4689c707913ca31f93b03cfe4deb61466c9e69f2`。默认浏览器标题栏入口、短期会话、Native 白名单、文件选择连接修复、隔离 Dev / Preview 均已发布，也包括此前固定归档的外观、OAuth、代理、DMG 和应用子命令能力。
- [固定 FIA 归档](https://github.com/potato47/malatang/releases/tag/fia-runtime-4689c707913c) 与公开 npm tarball、唯一验收包逐字节一致，SHA-256 `521a07c387efa5b2c7ddbb76807b5c613b5b26cdf6e9c84fb965d27a5dd536b6`。本次固定归档为 prerelease / 非 latest，不是应用安装包。
- runtime 构建、完整 check（73 CLI / 47 Swift）与 smoke 通过；从公开 npm 在 workspace 外执行 `bunx @semicoder/fia@0.17.0 create`，默认模板 check / 生产 build 通过。先前本地 Chromium / Safari 覆盖授权、刷新、Worker 恢复、撤销、资源、Native 文件选择和计数器共享；真实发布应用检查单独见下方。
- 本次经维护者本机 npm 认证发布；FIA 目标源码仓库仍返回 404，本地未配置 remote，未新建仓库、未验证 GitHub OIDC。源码入口仍不对读者提供。旧应用升级 Host 须完整安装包。

### 历史核对（下列未发布边界已由 0.17.0 替代）

- 2026-10-09 本地未发布浏览器能力：`codex/browser-access` 基于 FIA `410638d`；源文件 `browser-sessions.ts` / `browser-assets.ts` / `gateway.ts`、Native `Runtime.swift` / `Windows.swift` / `FIAApplication.swift` 和模板新增默认入口、独立标签页会话、Service Worker 与 WS 握手票据、撤销及权限白名单。官网 development 新增明确未发布段落，旧 npm 与固定归档安装路线保持不变。此次 Host 变更需未来完整应用安装包。

- 2026-10-08 本地未发布：FIA `410638dc950ffce18f412b90b4912f60ac3b3c7e` 已从 `codex/local-app-identity` 快进合入本地 `main`，新增 Dev / Preview 名称、独立 macOS Bundle ID、DEV/PREV Dock 与菜单栏标记、隔离 `fia run` 和 `fia agent --preview`。新 Host / CLI 已重建并在麻辣烫复制依赖中验证；逻辑 identifier、旧开发数据路径与 Keychain service 保持兼容，应用仍负责按数据路径区分凭据 key。公开 npm 与下方固定归档尚不含这些能力；FIA development 页面已标明版本边界，未替换默认安装路线。

- 2026-10-05 已公开固定归档的源码为 `dd430c851192b2e32116d50973e452a6ff2f1b72`；新增 `agent.commands` 与原生交互等待修复。公开基础教程仍面向 npm `0.16.1`，本次没有发布 FIA npm。
- [固定运行时 dd430c851192](https://github.com/potato47/malatang/releases/tag/fia-runtime-dd430c851192) 已公开，附件 `semicoder-fia-0.16.1.tgz` 的 SHA-256 为 `368e6ac1316bb130360817943788129bf544adc3f163aa614ac1a8d043e2184a`。独立下载与本地验证归档一致，麻辣烫 CI 已实际消费该锁定归档。
- 该运行时作为构建依赖标记 prerelease，不是应用安装包；版本字符串与旧 npm 相同，内容不同。旧 `fia-runtime-8650f80f4a11` 不包含新命令，不改写旧归档或其能力记录。
- FIA 源码仓库此前匿名访问返回 404，本站不要求克隆私有源码，不增加未经验证的源码按钮。

## 麻辣烫

### 0.4.0 发行（2026-10-09，历史）

- 正式 [v0.4.0 / Build 4](https://github.com/potato47/malatang/releases/tag/v0.4.0)，源码 `620d19a450578ca98c58c3ae1b7e13b524e57368`。[主干 CI 37888908778](https://github.com/potato47/malatang/actions/runs/37888908778) 与 [正式发布 37888912203](https://github.com/potato47/malatang/actions/runs/37888912203) 成功；实际消费 FIA 官方 v0.18.0 同一 npm artifact，冻结安装、69 测试、签名、公证、镜像运行与 Pages 部署通过。
- 五项公开附件匿名下载并核对 digest。`Malatang-0.4.0-4-mac-arm64.dmg` 为 30,513,939 字节，SHA-256 `8aca60752d1e25a28e50dbd122b03b505ed40088408d73bab0ab7077617ffef7`。独立 hdiutil / stapler / Gatekeeper DMG 与 app / codesign、安装包与签名更新逐文件比对通过。
- 公网 latest.json 与 Release 一致，Ed25519 签名及 33 个在线文件大小 / SHA-256 通过。runtimeId `9cd13e79576bff74bb3ca30f659e0cd1e40a9d407b3b0102dd9f2895ee63dbf4`。从 0.3.0 或更早版本升级须完整 DMG，账号、模型、KV 和历史保留；跨版本代码热更新未实测。
- 原生 Dev / Preview 和公开正式 DMG 均实际点击置顶 / 取消置顶并验证反馈。正式包在临时独立数据目录运行，未操作用户正式数据或调用真实模型。置顶归 FIA 管理，麻辣烫没有重复实现；SDK 仍为 0.2.1，manifest 兼容版本仍为 0.2，插件开发契约未改变。
- github-pages 仅新增精确 v0.4.0 tag 规则，其他保护保留。官网安装、介绍、首次使用与常见问题按公开产物同步；网站部署单独验收。

### 0.3.0 发行（2026-10-09，历史）

- 正式 [v0.3.0 / Build 3](https://github.com/potato47/malatang/releases/tag/v0.3.0)，非 draft / prerelease，源码 `7c0f237986728d13063fd25e38e0a826738af213`。[主干 CI 37868718881](https://github.com/potato47/malatang/actions/runs/37868718881) 与 [正式发布 37868966391](https://github.com/potato47/malatang/actions/runs/37868966391) 成功；固定 FIA 下载、冻结安装、检查 / 69 测试、SDK 归档消费、签名 / 公证 / 镜像启动、更新校验与 Pages 部署通过。
- 已匿名下载五项正式附件并核对 GitHub digest。`Malatang-0.3.0-3-mac-arm64.dmg` 为 30,516,155 字节，SHA-256 `8784f623d3a97fbf2f7acc7f2e00fa098154f939209aca5503b33d35fc589145`；hdiutil、stapler、Gatekeeper DMG / app、codesign 均通过，只读挂载内应用与签名更新逐文件一致。
- 公网 latest.json 与 Release 字节一致，Ed25519 签名与全部 33 个在线文件大小 / SHA-256 通过。runtimeId `2f469910b09105865dc6df75930f16b39c8fa707ebddc31ef8a35844a259f22d`，与 0.2.0 不同，须完整 DMG 升级；账号、模型、KV 和历史保留。跨版本代码热更新不据此视为实测。
- SDK npm `@semicoder/malatang-sdk@0.2.1` 已独立发布，latest 为 0.2.1，SHA-256 `711f7f2d39cfd3b51ed937b45cf44b136f2708b54c10de6c8490630edc5ae93f`（公开 tarball 与验收包一致）。从 registry 在 workspace 外安装，create 回执 0.2.1、notes check / build / pack 通过。本次本机 npm 认证，未执行 SDK OIDC，不推送重复版本的 sdk 标签。
- manifest 兼容版本保持 0.2；Popover 新定位参数需要宿主 0.3.0 和 SDK 0.2.1。SDK 0.1 插件仍须迁移重建。Pi AI 保持 1.0.2，不代表全部真实模型或登录刷新均已验收。
- `github-pages` 仅增加精确 `v0.3.0` tag 规则，其余保护保留。官网安装、指南与版本证据按这些公开产物同步；网站部署按本次 main 工作流单独验收。

### 历史核对（下列本地未发布边界已由 0.3.0 替代）

- 2026-10-09 麻辣烫 `codex/browser-access` 基于 `31d0561` 接入本地重建 FIA，沿用空应用标题栏，由框架提供入口；同步 getting-started / installation / troubleshooting。公开 0.2.0、SDK npm 和 `release/runtime-lock.json` 的 dd430c851192 不变。下次发行须公开、验收新 FIA 固定归档后切换 lock，再同步安装入口。本任务未推送、发布或部署。
- 同日文件选择问题修复：FIA `vite.ts` 按实际 SDK 文件内容使同版本 `file:` 更新的 Vite 缓存失效；麻辣烫 troubleshooting 记录开发重启与旧缓存排查。仅修复已有文件对话框能力的连接，不扩大浏览器 Native 权限，仍未发布。

- 2026-10-08 本地未发布身份区分：麻辣烫 `31d05614dcc00bb799c61ed3a01addaff29aa84a` 已从 `codex/local-app-identity` 快进合入本地 `main`，接入新 FIA `app.mode`，窗口显示「麻辣烫 · 开发版 / 预览版」；`dev` 保留原开发数据，新的 `run` 使用 `.fia/preview/data`，停用正式更新源。三种实际应用同时运行，预览 KV 与开发/正式版隔离，正式数据文件哈希未变；未进行真实模型调用或重新登录。installation / troubleshooting 已补充旧归档与新预览的边界，当前下载保持 0.2.0；`release/runtime-lock.json` 仍指向旧公开归档，后续发行必须公开并验收新 runtime 后切换。网站文档由 `codex/local-app-identity-docs` 整合到本地主干，保留特性分支；按用户要求不推送或部署。

- 2026-10-08 本地未发布样式修复：麻辣烫 `c678460` 已按用户授权从 `codex/theme-popover-style` 快进合入本地 `main`，调整 `frontend/ThemeControl.tsx` 与 SDK `src/ui.tsx` / `src/ui.css`，主题浮层改在侧栏右侧展开并留出约 8px 间距，选择框焦点提示改为贴合边框的 1px 细线。SDK Popover 新增定位参数，尚未进入公开应用或 npm 0.2.0。已核对 getting-started、plugin-development、installation 与 troubleshooting：现有公开指南不承诺浮层位置或这些新参数，安装入口保持已发布 0.2.0；后续发行时更新来源和受影响指南。用户明确要求暂不推送或部署，本次只提交本地来源记录。
- 正式版本 [v0.2.0 / Build 2](https://github.com/potato47/malatang/releases/tag/v0.2.0)，非 draft、非 prerelease；源码提交 `c82d6adebf0f1dfe81ded21ce15ef4b7c15040be`。统一 UI、SDK 0.2 / manifest 0.2、CSS Modules 与 notes/model 开发 CLI 已在这一发行中可用。
- [Release Malatang 37289643139](https://github.com/potato47/malatang/actions/runs/37289643139) 成功，涵盖固定运行时、检查/测试、SDK 独立消费、签名、公证、镜像启动与退出、更新签名和 Pages 部署。SDK、应用 Release 和官网各自发布，不能互相代替验收。
- 五项附件已匿名下载并与 GitHub digest 校验：DMG、SHA-256、DMG report、updates.tar.gz、latest.json。DMG 为 `Malatang-0.2.0-2-mac-arm64.dmg`，30,448,594 字节，SHA-256 `5d8171ab67748b5203f1abf8a3af9938edf474acf12e4441a3370899d34c03b5`。
- 独立通过 `hdiutil verify`、`stapler validate`、Gatekeeper DMG / app 检查及 `codesign --verify --deep --strict`；公开报告 `ok: true`。`verifyRelease` 对比只读挂载应用与签名更新的全部代码、runtime、version/build，均一致；报告的桌面交互明确为未测试，真实 WKWebView UI 验收来自本地实现阶段。
- 公网更新清单 `https://nobug.space/malatang/updates/latest.json` 与 Release 逐字节一致，Ed25519 签名及线上 33 个文件 size / SHA-256 全部通过。runtimeId 为 `ef60bd6049cc567c62980dd10fb2659e82802f2f455e393789f481cc1e8b4df4`，与 0.1.0 不同，因此升级需完整 DMG；跨版本代码更新仍未实测。
- [@semicoder/malatang-sdk 0.2.0](https://www.npmjs.com/package/@semicoder/malatang-sdk) 已通过用户 npm 登录首次正式发布；registry latest 为 0.2.0。公开归档与验收归档逐字节一致，SHA-1 `32d14881d97c71ffcef14cd3358305d6b7209bb5`；在 workspace 外直接安装 npm 版本后，模板 check/build/pack 全部通过。此次不是 OIDC 发布，后续 Trusted Publisher 及远端 OIDC 仍待单独验收，不推送重复版本的 SDK 发布标签。
- CLI 创建项目继续内带 SDK 快照；SDK 0.1 插件需迁移并重建，模型配置、账号、同 ID 的 KV 与历史保留。Pi AI 仍为 1.0.2；本次不代表所有模型、真实令牌刷新或撤销均已验证。

## agent-webtool

- 2026-10-06 正式发布 [0.7.0](https://github.com/potato47/agent-webtool/releases/tag/v0.7.0)，tag 源码 `ec6a2afcea8a651d58ea9a4cec513a12089a27b3`。新增 `SourceContext` / `createSourceContext`、快照恢复、缓存命中登记与标题容量修复；现有调用兼容，未接入麻辣烫。
- [三平台 CI 37424449550](https://github.com/potato47/agent-webtool/actions/runs/37424449550)、手动归档验收 37424738211 和 [正式 OIDC 发布 37424883345](https://github.com/potato47/agent-webtool/actions/runs/37424883345) 成功。Linux Node 20.18.1 / 24、macOS Node 24 均通过独立消费；Trusted Publisher 限定仓库、工作流与 `npm` 环境，本次环境只允许精确 `v0.7.0` 标签。
- 公开归档 `https://registry.npmjs.org/agent-webtool/-/agent-webtool-0.7.0.tgz` 与正式 GitHub artifact 逐字节一致。SHA-256 `5d51d108d64121172f213e83821eea7daa06cff7c0a2994303165bc354d46d52`，SHA-1 `a411bcd8a50e252af53175dc30316c4230bb58ac`；registry 已附 SLSA provenance，发布日志透明索引 3103730359。
- 使用全新临时目录及 npm 缓存按版本安装，Node ESM/CJS、TypeScript、两个 CLI、MCP 初始化/工具列表/筛选/非法 URL 错误返回通过；实际公开 SDK 的来源隔离、缓存登记、快照恢复和取消也通过。真实搜索引擎可用性未重新验收。
- 本站新增 `content/projects/agent-webtool/`：介绍、安装、SDK、CLI、MCP，共 4 篇指南；默认固定已验证的 0.7.0，SDK 保留 0.6.0 迁移边界。内容随本站主干工作流部署，实际部署结果单独验收，不以本地内容代替上线证据。
- 旧公开 npm 0.6.0 的 SHA-1 为 `4a9b5332511ffaa62cf1e59808616189fb5cb3c5`，不含 SourceContext；此前源码预览现由正式 0.7.0 指南替代。包名仍为 `agent-webtool`，0.7.0 package homepage 保留 GitHub README。

## 维护入口

FIA 介绍和 5 篇指南位于 `content/projects/fia/`；麻辣烫介绍和 14 篇指南位于 `content/projects/fn/`；本站介绍和 2 篇指南位于 `content/projects/semicoder/`。agent-webtool 介绍及 4 篇指南位于 `content/projects/agent-webtool/`。发布状态首先更新各自安装页，再同步项目介绍与版本说明。发布后的下载链接应使用真实 Release 及其附件，保留平台要求与安装步骤；不要将 CI artifact 或框架包伪装为正式应用。

本站只链接公开源码和包地址，不托管二进制，不代替源项目发布框架、应用或 npm 包。网站随主干既有工作流执行质量检查、预发布和生产发布。

## 跨项目更新流程

| 变化来源                                                      | 本站核对位置                                                                           |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FIA API、原生能力、CLI、构建与平台要求                        | FIA 项目介绍、shared-api / development / automation / installation / distribution 指南 |
| 麻辣烫设置、模型/账号、插件安装与生命周期                     | 麻辣烫项目介绍、getting-started / models / plugins / troubleshooting / automation 指南 |
| SDK 包名、manifest、构建方式与方法                            | plugin-development 及 plugin-* 开发手册、项目介绍；与安装指南的源码版本保持一致        |
| agent-webtool 抓取/搜索、SDK/CLI/MCP、来源生命周期或 npm 发布 | agent-webtool 项目介绍、安装与使用指南、本来源记录；核对公开导出与本地未发布改动       |
| Semicoder 自身使用与内容写作流程                              | `content/projects/semicoder/` 和相关工程文档；无用户文档影响时说明依据                 |
| 公开应用、npm SDK、固定 FIA 归档                              | installation、plugin-development、本来源记录；核对 tag、文件、平台和 SHA-256           |

1. 确认变更所属项目、源码提交、对应契约及已验证行为；框架或应用缺陷反馈源仓库修正，网站不创造新的 API 约定。
2. 每次项目版本发布必须同步本站对应文档、安装入口、迁移说明及版本证据。分开核对本地实现、公开可获取产物和网站部署版本；各项目无需同时升版，但默认安装路线必须完整可复现。先准备文档，公开产物验证后再切换默认路径；只更新文案时不重打运行时归档。
3. 先改安装页及版本范围，再核对介绍、指南、导航、站内引用；发布状态或来源改变时记录日期、提交、归档/哈希和验证结果。没有变化的检查不制造新发布结论。
4. 依据 `docs/impact.json` 同步工程文档。仅工程 Markdown 修改检查事实、链接、格式与 `docs:check`；公开 `content/` 正文变化须生成内容、执行 `content:check`、生产构建及 `build:check`。命令变化实际验证相应步骤，路由或代码变化依项目规范执行相关完整检查。
5. 交付分别说明源项目、本站及 workspace 知识库的修改与待办。页面缺失、公开产物未验或部署未获授权时，明确记录未完成项和完成条件。网站 `main` 推送会部署；麻辣烫应用 `v*`、SDK `sdk-v*`、FIA npm `v*` 及 agent-webtool npm 各自管理，均不由本站操作代替。agent-webtool 的 CI 与 0.7.0 OIDC 发布已验收；未来版本须核对环境标签规则并单独授权。

`docs/impact.json` 只能发现本站仓库内的修改；相邻项目变更仍需在开发任务交付时主动核对。源码仓库不可用时保留已验证快照，记录缺少的来源，不猜测最新行为。麻辣烫更新源由应用的 GitHub Pages 发布流程维护，与本站内容部署独立，不能只因官网整合就改为本站域名。

## 首次正式发行与官网文档同步（历史）

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

## 2026-10-05 发布前 UI / CLI 预览（历史，已由页首发行记录替代）

- 本地特性分支：FIA codex/app-cli-commands（基于 ff9aa2c），麻辣烫 codex/plugin-ui-cli（基于 d9b128c）；网站 codex/plugin-ui-cli-docs。来源为 FIA config.ts / agent-artifacts.ts / agent-cli.ts / agent-server.ts 与麻辣烫 packages/sdk、commands/plugin.ts、scripts/sdk-snapshot.ts。
- 新增 SDK 0.2.0 / manifest 0.2、宿主共享 UI 与 CSS Modules、notes/model 模板和 plugin create/check/build/pack。官网只追加明确标注的预览段落；SDK 0.1 的正式教程与已核实 v0.1.0 安装入口保留。
- 新 FIA CLI / 原生启动等待修复需要新的 runtimeId 和固定归档；旧公开归档不支持新命令。未推送、发布 npm/Release、切换 CI 远端下载锁或部署。最终本地验证和归档哈希由工作区交付记录维护，不能把本地构建状态当作线上状态。

## 2026-10-10 自定义配色补充（实施阶段历史）

麻辣烫 `ad9a587` 新增 `shared/theme.ts`、`backend/appearance.ts`、`frontend/AppearanceSettings.tsx` 与主题 Provider：明暗模式控制原生标题栏，默认 / GitHub / 自定义配色只作用于内容区，SDK token 和 Portal 继承。第一次使用指南追加预览、保存、取消、恢复与版本边界。未修改公开安装入口，无 FIA 框架变更，无版本调整或部署。

## 2026-10-10 标题栏样式核对（实施阶段历史）

本地麻辣烫 `ad9a587` 中的 FIA `Sources/FIA/Windows.swift` 将框架置顶与浏览器按钮改为无边框、中性图标色，保留实心置顶、悬停反馈、明暗模式与可访问名称。已核对 FIA 安装/窗口指南及麻辣烫第一次使用/常见问题：现有正文按位置、图标与行为描述，无边框或蓝色依赖，无需修改公开操作教程。API、安装入口及公开发行事实保持不变；原生 Host 已改变，未来发行须完整安装包。本轮不发布、不部署。

## 2026-10-11 插件市场本地开发

- 来源：麻辣烫 `codex/plugin-marketplace`（基线 `380ee16`）及新增独立 `malatang-plugins` 仓库；契约为 `shared/marketplace.ts`、`shared/api.ts` 与 `docs/plugin-marketplace.md`。
- 新行为：取消内置插件、多源静态市场、来源绑定、手动更新与失败恢复；翻译和随手记迁出宿主。官网插件、开发、首次使用及自动化页追加未发布边界。
- 应用仍为公开 0.4.1 / build 5，SDK 公开 0.3.0；本地开发未升版。官方市场仓库与归档尚未公开，安装页保留已有可验证 DMG，不改变读者默认安装路径。未推送或部署。

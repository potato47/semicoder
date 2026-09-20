# 部署与恢复

## 环境

本地使用 Wrangler 本地 D1。预发布和生产分别创建 D1，填入 `wrangler.jsonc` 相应环境的 database_id。占位 ID 不可直接部署。预发布使用 `staging.semicoder.dev`，生产使用 `semicoder.dev` 和 `www.semicoder.dev`。Cloudflare 域名规则将 www 308 跳转至根域名并保留路径和查询参数，SSL/TLS 开启 Always Use HTTPS。Worker 仅为动态路径提供同样的重定向兜底。

每个环境分别创建 GitHub OAuth App，callback 为 `https://域名/api/auth/callback/github`。配置 Turnstile 域名列表。通过 Wrangler secret put 设置 BETTER_AUTH_SECRET、GITHUB_CLIENT_ID、GITHUB_CLIENT_SECRET、TURNSTILE_SECRET_KEY、ADMIN_GITHUB_IDS；SITE_URL 和 TURNSTILE_SITE_KEY 为公开配置。管理员 ID 必须为 GitHub provider 数字 ID。密钥不得提交。

## 发布

GitHub Actions 使用 staging / production environments，分别设置 CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID 和所需 Worker secrets。Token 按 Worker/D1 最小权限配置。production environment 应设审核保护。外部 PR 不运行带密钥部署。

PR 执行安装、生成、只读检查、测试和构建。主分支顺序执行预发布迁移、构建、部署、冒烟；通过后执行生产迁移、构建、部署、冒烟。登录密钥通过 Cloudflare 预先配置，不传入构建。上线前用真实 GitHub 账号验证登录、评论、审批、封禁与注销。

## 观察与费用

当前使用 Workers / D1 / Turnstile 免费套餐，不自动升级。Worker 不设置自定义 `cpu_ms`，遵循免费版每请求 10ms CPU、账户共享每天 10 万次动态请求限制。静态页面与资源走 Assets；`run_worker_first` 仅列出动态路径，避免静态访问消耗额度。D1 账户共享每日 500 万行读取、10 万行写入，单库 500MB，总计 5GB；Time Travel 免费恢复窗口为 7 天。额度按账户共享，预发布与生产并非各一份。

开启 Workers observability，关注错误率、CPU、D1 读写、请求量和 429；日志禁止写入密钥、会话、评论正文。免费额度耗尽会导致动态请求失败，不自动产生超额账单；正文和浏览器搜索应继续可用。上线需实测 OAuth 回调、会话、评论和审核，不能用本地测试推断 CPU 额度合格。需要付费扩容时另行确认。

预发布和生产冒烟会验证页面品牌、安全响应头、健康检查、认证与后台 no-store；生产另验证 HTTP → HTTPS、www 308 保留路径和查询参数，避免旧站返回 200 被误判为发布成功。

原计划的可配置用量阈值邮件告警未作为免费方案的已交付能力：[官方通知清单](https://developers.cloudflare.com/notifications/notification-available/#billing) 将 Usage Based Billing 列为 Professional 或以上。当前使用控制台指标与 Workers 日志排查，不为告警升级套餐；也未设置定期巡检任务。

## 回滚与恢复

迁移前记录 D1 Time Travel bookmark，并导出 SQL 到私有安全存储。采用向后兼容的增量迁移，旧 Worker 可继续读取新 schema。代码回滚使用 Wrangler deployments list 与 rollback 指定前一个版本；不会回滚 D1。

数据恢复必须先暂停写入，确认受影响时间范围，再将备份恢复到独立数据库核对计数和抽样数据，最后切换 binding；不能为回滚代码直接抹除评论数据。发布记录写清 commit、Worker version、迁移和恢复点。正式上线前在预发布执行一次恢复演练并记录结果。

D1 导出可能先写入子表，再创建被引用的父表，直接导入空库会报 `no such table: main.user`。恢复时使用仅依赖 Python 3 标准库的辅助脚本先排列建表语句，保留原 SQL 数据；只导入全新隔离数据库，不能导入仍在提供服务的数据库：

```sh
umask 077
bunx wrangler d1 export DB --env staging --remote --output /private/tmp/staging-backup.sql > /private/tmp/staging-export.log
python3 scripts/prepare-restore.py /private/tmp/staging-backup.sql /private/tmp/staging-restore.sql
bunx wrangler d1 execute DB --env staging --local --persist-to /private/tmp/semicoder-restore-drill --file /private/tmp/staging-restore.sql
bunx wrangler d1 execute DB --env staging --local --persist-to /private/tmp/semicoder-restore-drill --command 'SELECT COUNT(*) AS users FROM user; SELECT COUNT(*) AS comments FROM comment; SELECT COUNT(*) AS audits FROM audit; PRAGMA foreign_key_check;'
```

路径必须选用新的私有目录；SQL、导出日志、数据库文件包含认证数据，禁止提交仓库，演练结束后安全清理。真实恢复还需逐表核对、抽样与登录验证，再切换绑定。[首发验收记录](releases/2026-09-20.md) 包含本次演练范围。

从旧 Pages 迁移时既要移除根域名 CNAME，也要解除旧 Pages 项目的自定义域，否则请求可能仍落到旧应用。原记录为 proxied CNAME `semicoder.dev → semicoder.pages.dev`；旧 Pages 项目和 Git 标签 `archive/astro-before-rebuild` 保留。需要回退旧站时先解除新 Worker 根域名绑定，再恢复 Pages 自定义域和对应 CNAME；邮件 MX/TXT 不变。

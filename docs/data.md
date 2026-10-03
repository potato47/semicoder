# 认证与数据

Better Auth 使用 GitHub OAuth，认证入口 `/api/auth/*`。会话保存在 D1，管理员由 `ADMIN_GITHUB_IDS` 中的 GitHub 数字账号 ID 决定，不根据用户名、邮箱或客户端标记提权。每次写入重新检查会话与封禁状态。

认证配置实例按 Workers 环境复用，减少重复初始化 CPU；会话与权限仍逐请求检查，不在内存缓存授权结果。认证限流仅信任 Cloudflare 注入的 `CF-Connecting-IP`，避免所有访客落入共享限流桶。

认证表由 Better Auth 配置匹配的 Drizzle schema 定义。业务表保存用户审核状态、评论、审核记录、限流桶。公开评论仅返回 approved 和 deleted 占位；hidden/pending 永不进入公共响应。用户可在个人待审区查看自己的 pending 评论。

首次被批准前的新评论均 pending；首次批准原子设置 trusted 状态。后续新增直接 approved，编辑一律重新 pending。回复只能挂在同一内容的根评论下；删除清空正文但保留结构。审核带版本检查，防止审核过程中正文变化。封禁阻止写入并隐藏该用户既有评论；解除封禁不自动恢复旧评论。

所有写入进行 Origin 校验、Zod 校验、权限校验、D1 持久限流。创建和编辑还需 Turnstile Siteverify 校验 action/hostname，token 过期或重用不能通过。requestId 提供提交幂等性。审计不记录 OAuth token 或原始 IP。

SQL 迁移提交 Git，使用 Wrangler 在指定环境执行。禁止生产 schema push。数据库默认使用主库一致读，不开启异地只读副本。评论批处理使用 D1 batch 原子执行。

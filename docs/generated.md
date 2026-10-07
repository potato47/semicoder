# 生成的技术清单

由 `bun run docs:generate` 生成。不要手工编辑，不包含配置值或密钥。

## 命令

| 命令 | 实际执行 |
| --- | --- |
| `bun run dev` | `bun run content:generate && vite --host 127.0.0.1` |
| `bun run prepare` | `bun run content:generate && wrangler types` |
| `bun run build` | `bun run content:generate --production && vite build` |
| `bun run build:check` | `node scripts/build-check.ts` |
| `bun run preview` | `vite preview --host 127.0.0.1` |
| `bun run lint` | `oxlint --max-warnings=0` |
| `bun run lint:fix` | `oxlint --fix` |
| `bun run fmt` | `oxfmt` |
| `bun run fmt:check` | `oxfmt --check` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run content:generate` | `bun scripts/content.ts` |
| `bun run content:check` | `bun scripts/content.ts --check` |
| `bun run docs:generate` | `bun scripts/docs.ts` |
| `bun run docs:check` | `bun scripts/docs.ts --check` |
| `bun run docs:impact` | `bun scripts/docs-impact.ts` |
| `bun run check` | `bun run lint && bun run fmt:check && bun run typecheck && bun run content:check && bun run docs:check` |
| `bun run test` | `bun test tests/unit` |
| `bun run test:workers` | `vitest run` |
| `bun run db:local` | `wrangler d1 migrations apply DB --local` |
| `bun run db:generate` | `drizzle-kit generate` |
| `bun run deploy:staging` | `bun scripts/deploy.ts staging` |
| `bun run deploy:production` | `bun scripts/deploy.ts production` |
| `bun run smoke` | `bun scripts/smoke.ts` |

## 路由

- `/`
- `/$project`
- `/$project/`
- `/$project/docs/$`
- `/admin`
- `/api/auth/$`
- `/blog/`
- `/blog/$slug`
- `/privacy`
- `/projects/`
- `/rules`
- `/search`
- `/healthz`（Worker）
- `/rss.xml`、`/sitemap.xml`、`/robots.txt`（构建产物）

## 环境变量名称

- `ADMIN_GITHUB_IDS`
- `APP_ENV`
- `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SITE_URL`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`

## 数据表

| 表 | 列 |
| --- | --- |
| account | id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at |
| audit | id, actor_id, action, target_id, created_at |
| auth_rate_limit | id, key, count, last_request |
| comment | id, content_id, user_id, parent_id, body, status, version, request_id, created_at, updated_at |
| profile | user_id, trusted, banned |
| rate_limit | key, count, expires_at |
| session | id, token, expires_at, created_at, updated_at, ip_address, user_agent, user_id |
| user | id, name, email, email_verified, image, created_at, updated_at |
| verification | id, identifier, value, expires_at, created_at, updated_at |

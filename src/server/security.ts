import type { AppEnv } from "./env";
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function assertOrigin(headers: Headers, siteUrl: string) {
  const origin = headers.get("origin");
  if (origin !== new URL(siteUrl).origin)
    throw new AppError("FORBIDDEN", "请求来源无效，请刷新页面后重试");
}
export async function rateLimit(
  db: D1Database,
  key: string,
  limit = 10,
  seconds = 60,
  now = Date.now(),
) {
  const bucket = Math.floor(now / (seconds * 1000));
  const row = await db
    .prepare(
      "INSERT INTO rate_limit (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(`${key}:${bucket}`, (bucket + 1) * seconds * 1000)
    .first<{ count: number }>();
  if (!row || row.count > limit) throw new AppError("RATE_LIMIT", "操作太频繁，请稍后再试");
}
export async function verifyTurnstile(
  e: AppEnv,
  token: string,
  fetcher: (input: string, init?: RequestInit) => Promise<Response> = fetch,
) {
  if (!e.TURNSTILE_SECRET_KEY) throw new AppError("UNAVAILABLE", "评论验证尚未配置");
  let result: { success: boolean; hostname?: string; action?: string };
  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: e.TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Verification unavailable");
    result = await response.json();
  } catch {
    throw new AppError("UNAVAILABLE", "验证服务暂时不可用，请稍后重试");
  }
  if (
    !result.success ||
    result.hostname !== new URL(e.SITE_URL).hostname ||
    result.action !== "comment"
  )
    throw new AppError("VALIDATION", "验证已过期或无效，请重新验证");
}

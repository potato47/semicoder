import handler from "@tanstack/react-start/server-entry";
import type { AppEnv } from "./server/env";
import { authReady } from "./server/env";
import manifest from "./generated/manifest.json";
const redirects = new Map<string, string>(
  manifest.flatMap((x) => x.aliases.map((alias) => [alias, x.path] as const)),
);
function secure(response: Response, privateResponse: boolean) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (privateResponse) headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
export default {
  async fetch(request: Request, e: AppEnv) {
    const url = new URL(request.url),
      privateResponse =
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/_serverFn/") ||
        url.pathname.startsWith("/admin");
    if (url.hostname === "www.semicoder.dev") {
      url.hostname = "semicoder.dev";
      url.protocol = "https:";
      return Response.redirect(url.toString(), 308);
    }
    if (
      e.APP_ENV !== "development" &&
      url.hostname === new URL(e.SITE_URL).hostname &&
      url.protocol === "http:"
    ) {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 308);
    }
    const to = redirects.get(url.pathname);
    if (to) return Response.redirect(new URL(to + url.search, request.url), 308);
    if (url.pathname === "/healthz") {
      try {
        await e.DB.prepare("SELECT id FROM user LIMIT 1").first();
        const configured =
          authReady(e) &&
          !!e.TURNSTILE_SECRET_KEY &&
          !!e.TURNSTILE_SITE_KEY &&
          !!e.ADMIN_GITHUB_IDS;
        return Response.json(
          { status: configured ? "ready" : "configuration-required", database: true },
          {
            status: e.APP_ENV !== "development" && !configured ? 503 : 200,
            headers: { "Cache-Control": "no-store" },
          },
        );
      } catch {
        return Response.json({ status: "unavailable" }, { status: 503 });
      }
    }
    if (
      (!privateResponse || url.pathname === "/admin") &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      const asset = await e.ASSETS.fetch(request);
      if (asset.status !== 404) {
        const secured = secure(asset, privateResponse);
        if (e.APP_ENV !== "production") secured.headers.set("X-Robots-Tag", "noindex, nofollow");
        return secured;
      }
    }
    const response = await handler.fetch(request);
    const secured = secure(response, privateResponse);
    if (e.APP_ENV !== "production") secured.headers.set("X-Robots-Tag", "noindex, nofollow");
    return secured;
  },
  async scheduled(_event: ScheduledController, e: AppEnv) {
    await e.DB.batch([
      e.DB.prepare("DELETE FROM rate_limit WHERE expires_at<?").bind(Date.now()),
      e.DB.prepare("DELETE FROM session WHERE expires_at<?").bind(Date.now()),
      e.DB.prepare("DELETE FROM verification WHERE expires_at<?").bind(Date.now()),
      e.DB.prepare("DELETE FROM auth_rate_limit WHERE last_request<?").bind(Date.now() - 86400000),
    ]);
  },
};

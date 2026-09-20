import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "../server/auth";
import { authReady, getEnv } from "../server/env";
async function handle({ request }: { request: Request }) {
  const e = getEnv();
  if (!authReady(e))
    return Response.json(
      { message: "GitHub 登录尚未配置" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  return getAuth(e).handler(request);
}
export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handle, POST: handle } },
});

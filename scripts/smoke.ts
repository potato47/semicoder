import catalog from "../src/generated/catalog.json";
const base = process.argv[2] ?? "http://localhost:3000";
for (const path of [...catalog.publicPaths, "/rss.xml", "/sitemap.xml", "/healthz"]) {
  const response = await fetch(new URL(path, base));
  if (!response.ok) throw new Error(`${path} 返回 ${response.status}`);
  if (!path.includes(".") && path !== "/healthz") {
    if (!(await response.text()).includes("新手程序员"))
      throw new Error(`${path} 未返回新门户页面，请检查旧站绑定和缓存`);
    if (response.headers.get("x-content-type-options") !== "nosniff")
      throw new Error(`${path} 缺少静态安全响应头`);
  }
  if (
    path === "/healthz" &&
    base.startsWith("https:") &&
    ((await response.json()) as { status: string }).status !== "ready"
  )
    throw new Error("线上动态服务尚未就绪");
  console.log(`✓ ${path} ${response.status}`);
}
for (const path of [
  "/this-page-does-not-exist",
  "/about",
  "/projects/semicoder",
  "/docs/semicoder/getting-started",
  ...catalog.projects.map((project) => `${project.path}/docs`),
  ...catalog.projects.map((project) => `${project.path}/docs/this-page-does-not-exist`),
]) {
  const missing = await fetch(new URL(path, base), { redirect: "manual" });
  if (missing.status !== 404) throw new Error(`${path} 应返回 404，实际 ${missing.status}`);
}
const session = await fetch(new URL("/api/auth/get-session", base));
if (!session.ok || !session.headers.get("content-type")?.includes("application/json"))
  throw new Error("认证接口未返回有效 JSON 响应");
if (!session.headers.get("cache-control")?.includes("no-store"))
  throw new Error("认证接口缺少 no-store");
const admin = await fetch(new URL("/admin", base));
if (!admin.ok || !admin.headers.get("cache-control")?.includes("no-store"))
  throw new Error("后台页面不可用或缺少 no-store");
if (new URL(base).hostname === "semicoder.dev") {
  const redirect = await fetch("https://www.semicoder.dev/blog?source=smoke", {
    redirect: "manual",
  });
  if (
    redirect.status !== 308 ||
    redirect.headers.get("location") !== "https://semicoder.dev/blog?source=smoke"
  )
    throw new Error("www 重定向未保留路径和查询参数");
  const https = await fetch("http://semicoder.dev/", { redirect: "manual" });
  if (![301, 308].includes(https.status) || https.headers.get("location") !== base + "/")
    throw new Error("HTTP 未跳转至 HTTPS");
  console.log("✓ HTTPS 与 www 规范域名跳转");
}
console.log("✓ 404、安全响应头与认证/后台缓存隔离");

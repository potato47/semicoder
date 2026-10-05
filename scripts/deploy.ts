import { readFile } from "node:fs/promises";
import { parse } from "jsonc-parser";
import { verifyDeployment } from "./deployment-check";
const target = process.argv[2];
if (target !== "staging" && target !== "production")
  throw new Error("必须指定 staging 或 production");
if (process.env.CONTENT_PREVIEW) throw new Error("部署不可启用草稿预览");
const config = parse(await readFile("wrangler.jsonc", "utf8")).env[target];
if (
  !config.d1_databases[0].database_id ||
  config.d1_databases[0].database_id.startsWith("00000000")
)
  throw new Error("请先配置目标环境的真实 D1 database_id，见 docs/deployment.md");
if (!config.vars.TURNSTILE_SITE_KEY) throw new Error("请先配置 Turnstile site key");
async function run(cmd: string[], env: Record<string, string | undefined> = {}) {
  const p = Bun.spawn(cmd, {
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env, ...env },
  });
  if ((await p.exited) !== 0) throw new Error(`失败：${cmd.join(" ")}`);
}
await run(["bun", "run", "check"]);
await run(["bun", "run", "build"], { CLOUDFLARE_ENV: target });
await run(["bun", "run", "build:check"]);
await run(["bunx", "wrangler", "d1", "migrations", "apply", "DB", "--remote", "--env", target]);
await run(["bunx", "wrangler", "deploy", "--env", target]);
await verifyDeployment(() => run(["bun", "scripts/smoke.ts", config.vars.SITE_URL]));

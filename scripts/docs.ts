import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parse } from "jsonc-parser";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import * as tables from "../src/server/db/schema";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const config = parse(await readFile("wrangler.jsonc", "utf8"));
const routes: string[] = [];
for (const file of (await readdir("src/routes")).sort()) {
  const text = await readFile(`src/routes/${file}`, "utf8");
  for (const m of text.matchAll(/createFileRoute\(["']([^"']+)["']\)/g)) routes.push(m[1]);
}
const secretNames = (await readFile(".dev.vars.example", "utf8"))
  .split("\n")
  .filter((x) => x.includes("="))
  .map((x) => x.split("=")[0]);
const tableRows = Object.values(tables)
  .map((t) => getTableConfig(t))
  .sort((a, b) => a.name.localeCompare(b.name));
const expected = `# 生成的技术清单\n\n由 \`bun run docs:generate\` 生成。不要手工编辑，不包含配置值或密钥。\n\n## 命令\n\n| 命令 | 实际执行 |\n| --- | --- |\n${Object.entries(
  pkg.scripts,
)
  .map(([k, v]) => `| \`bun run ${k}\` | \`${v}\` |`)
  .join("\n")}\n\n## 路由\n\n${routes
  .sort()
  .map((r) => `- \`${r}\``)
  .join(
    "\n",
  )}\n- \`/healthz\`（Worker）\n- \`/rss.xml\`、\`/sitemap.xml\`、\`/robots.txt\`（构建产物）\n\n## 环境变量名称\n\n${[
  ...Object.keys(config.vars),
  ...secretNames,
]
  .sort()
  .map((k) => `- \`${k}\``)
  .join(
    "\n",
  )}\n\n## 数据表\n\n| 表 | 列 |\n| --- | --- |\n${tableRows.map((t) => `| ${t.name} | ${t.columns.map((c) => c.name).join(", ")} |`).join("\n")}\n`;
if (process.argv.includes("--check")) {
  if (
    !existsSync("docs/generated.md") ||
    (await readFile("docs/generated.md", "utf8")) !== expected
  )
    throw new Error("技术清单已过期，运行 bun run docs:generate");
  for (const filename of [
    "AGENTS.md",
    "README.md",
    ...(await Array.fromAsync(new Bun.Glob("docs/**/*.md").scan("."))),
  ]) {
    const text = await readFile(filename, "utf8");
    for (const m of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      if (/^(https?:|mailto:|#|\/)/.test(m[1])) continue;
      const target = resolve(dirname(filename), m[1].split("#")[0]);
      if (!existsSync(target)) throw new Error(`${filename}: 链接不存在 ${m[1]}`);
    }
  }
  console.log("✓ 文档链接和生成内容一致");
} else {
  await writeFile("docs/generated.md", expected);
  console.log("✓ 已生成技术清单");
}

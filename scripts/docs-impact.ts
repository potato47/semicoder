import { readFile } from "node:fs/promises";
const base = process.env.DOCS_BASE_SHA;
if (!base) {
  console.log("未指定比较基线，文档影响检查仅在 PR 中运行");
  process.exit(0);
}
if (!/^[a-f0-9]{40}$/.test(base)) throw new Error("无效比较基线");
const proc = Bun.spawn(["git", "diff", "--name-only", `${base}...HEAD`], {
  stdout: "pipe",
  stderr: "inherit",
});
const files = (await new Response(proc.stdout).text()).trim().split("\n");
if ((await proc.exited) !== 0) throw new Error("无法读取 PR 差异");
const mapping: Record<string, string[]> = JSON.parse(await readFile("docs/impact.json", "utf8"));
const required = new Set(
  Object.entries(mapping)
    .filter(([prefix]) => files.some((f) => f.startsWith(prefix)))
    .flatMap(([, docs]) => docs),
);
const missing = [...required].filter((doc) => !files.includes(doc));
const reason = (process.env.PR_BODY ?? "").match(/docs-impact:\s*none\s*[—–-]\s*(\S[^\n]{9,})/i);
if (missing.length && !reason)
  throw new Error(
    `请同步更新文档：${missing.join(", ")}；无文档影响时在 PR 中提供 docs-impact: none — 至少十个字符的具体原因`,
  );
console.log(missing.length ? "文档影响已声明，等待人工审查理由" : "✓ 文档影响检查通过");

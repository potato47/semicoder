import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export async function markdownFiles(directory: string): Promise<string[]> {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const item of (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = join(directory, item.name);
    if (item.isSymbolicLink()) throw new Error(`内容不能使用符号链接：${path}`);
    if (item.isDirectory()) files.push(...(await markdownFiles(path)));
    else if (/\.mdx?$/.test(item.name)) files.push(path);
  }
  return files;
}

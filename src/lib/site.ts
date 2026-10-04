export const site = {
  name: "新手程序员",
  domain: "semicoder.dev",
  url: "https://semicoder.dev",
  description: "保持好奇，认真构建。记录编程路上的思考、实践与作品。",
  repository: "https://github.com/potato47/semicoder",
};
export type ContentKind = "blog" | "projects" | "docs";
interface ContentBase {
  id: string;
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  tags: string[];
  path: string;
  file: string;
  comments: boolean;
  sample: boolean;
  draft: boolean;
  readingTime: number;
  toc: { id: string; text: string; depth: number }[];
  aliases: string[];
}
export interface BlogEntry extends ContentBase {
  kind: "blog";
}
export interface ProjectEntry extends ContentBase {
  kind: "projects";
  stack: string[];
  status?: string;
  source?: string;
  demo?: string;
  docsPath?: string;
}
export interface DocEntry extends ContentBase {
  kind: "docs";
  projectId: string;
  projectSlug: string;
}
export type ContentEntry = BlogEntry | ProjectEntry | DocEntry;
export interface DocNavGroup {
  title: string;
  items: DocEntry[];
}
export interface ContentCatalog {
  entries: ContentEntry[];
  projects: ProjectEntry[];
  navigation: Record<string, DocNavGroup[]>;
  publicPaths: string[];
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

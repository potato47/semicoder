import type { ComponentProps } from "react";
import { components } from "../generated/content";
import { entries } from "../generated/catalog";
import type { ContentEntry } from "../lib/site";
import { site } from "../lib/site";
import { Comments } from "../features/Comments";
import { ContentLink } from "./ContentLink";
import styles from "./ContentPage.module.css";

function ContentAnchor({ href, children, ...props }: ComponentProps<"a">) {
  const [path, hash] = (href ?? "").split("#");
  const entry = entries.find((item) => item.path === path);
  if (entry)
    return (
      <ContentLink entry={entry} hash={hash}>
        {children}
      </ContentLink>
    );
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
export function ContentBody({ entry }: { entry: ContentEntry }) {
  const Component = components[entry.id as keyof typeof components];
  return (
    <>
      <article className="prose" data-pagefind-body>
        <Component components={{ a: ContentAnchor }} />
      </article>
      <div className={styles.articleFooter}>
        <span>保持好奇，持续构建。</span>
        <a href={`${site.repository}/edit/main/${entry.file}`}>在 GitHub 编辑 ↗</a>
      </div>
      {entry.comments && <Comments contentId={entry.id} />}
    </>
  );
}
export function ContentLabels({ entry }: { entry: ContentEntry }) {
  return (
    <div className="row">
      {entry.tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ))}
      {entry.sample && <span className="sample">示例内容 · 展示与开发用途</span>}
      {entry.draft && <span className="tag">草稿预览</span>}
    </div>
  );
}

import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Clock, GitFork } from "lucide-react";
import { entries, components } from "../generated/content";
import type { ContentEntry } from "../lib/site";
import { formatDate, site } from "../lib/site";
import { Comments } from "../features/Comments";
import styles from "./ContentPage.module.css";
export function ContentPage({ entry }: { entry: ContentEntry }) {
  const Component = components[entry.id as keyof typeof components];
  const documents = entries
    .filter((x) => x.kind === "docs" && x.project === (entry.project ?? entry.slug))
    .sort((a, b) => a.order - b.order);
  const index = documents.findIndex((x) => x.id === entry.id);
  const kindName = { blog: "博客", projects: "项目", docs: "文档" }[entry.kind];
  return (
    <>
      <header className={styles.heading}>
        <a href={`/${entry.kind}`} className={styles.back}>
          <ArrowLeft size={14} />
          {kindName}
        </a>
        <div className="row">
          {entry.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
          {entry.sample && <span className="sample">示例内容 · 展示与开发用途</span>}
          {entry.draft && <span className="tag">草稿预览</span>}
        </div>
        <h1>{entry.title}</h1>
        <p>{entry.description}</p>
        <div className={styles.meta}>
          <span>新手程序员</span>
          <span>·</span>
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          <span>·</span>
          <span>
            <Clock size={12} />
            {entry.readingTime} 分钟阅读
          </span>
        </div>
        {entry.kind === "projects" && (
          <div className="row" style={{ marginTop: 24 }}>
            {entry.source && (
              <a href={entry.source} className="button">
                <GitFork size={16} />
                查看源码
                <ArrowUpRight size={14} />
              </a>
            )}
            {entry.demo && (
              <a className="button" href={entry.demo}>
                在线演示 ↗
              </a>
            )}
            {documents[0] && (
              <a className="button" href={documents[0].path}>
                <BookOpen size={16} />
                阅读文档
              </a>
            )}
          </div>
        )}
      </header>
      <div className={styles.layout}>
        <div>
          <article className="prose" data-pagefind-body>
            <Component />
          </article>
          <div className={styles.articleFooter}>
            <span>保持好奇，持续构建。</span>
            <a href={`${site.repository}/edit/main/${entry.file}`}>
              在 GitHub 编辑 <ArrowUpRight size={12} />
            </a>
          </div>
          {entry.kind === "docs" && (
            <div className={styles.pagination}>
              {documents[index - 1] ? (
                <a className="button" href={documents[index - 1].path}>
                  <ArrowLeft size={14} />
                  {documents[index - 1].title}
                </a>
              ) : (
                <span />
              )}
              {documents[index + 1] && (
                <a className="button" href={documents[index + 1].path}>
                  {documents[index + 1].title}
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          )}
          {entry.comments && <Comments contentId={entry.id} />}
        </div>
        <aside className={styles.sidebar}>
          {entry.kind === "docs" && (
            <>
              <span className="eyebrow">项目章节</span>
              <nav aria-label="文档章节">
                {documents.map((d) => (
                  <a key={d.id} href={d.path} aria-current={d.id === entry.id ? "page" : undefined}>
                    {d.title}
                  </a>
                ))}
              </nav>
            </>
          )}
          <span className="eyebrow">ON THIS PAGE / 目录</span>
          <nav aria-label="本页目录">
            {entry.toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} style={{ paddingLeft: t.depth === 3 ? 16 : 0 }}>
                {t.text}
              </a>
            ))}
          </nav>
          <div className={styles.sidebarNote}>
            慢慢来，
            <br />
            每一步都算数。<span>↗</span>
          </div>
        </aside>
      </div>
    </>
  );
}

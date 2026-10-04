import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { catalog, navigation } from "../generated/catalog";
import { projectDocuments } from "../lib/content";
import type { DocEntry, ProjectEntry } from "../lib/site";
import { formatDate } from "../lib/site";
import { ContentBody, ContentLabels } from "./ContentBody";
import { ContentLink } from "./ContentLink";
import styles from "./ProjectDocs.module.css";
export function DocsBreadcrumbs({ project, title }: { project: ProjectEntry; title: string }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="面包屑">
      <Link to="/docs">文档</Link>
      <span>/</span>
      <Link to="/$project/docs" params={{ project: project.slug }}>
        {project.title}
      </Link>
      <span>/</span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}
export function DocPage({ project, entry }: { project: ProjectEntry; entry: DocEntry }) {
  const documents = projectDocuments(catalog, project.id);
  const index = documents.findIndex((doc) => doc.id === entry.id);
  const previous = index >= 0 ? documents[index - 1] : undefined,
    next = index >= 0 ? documents[index + 1] : undefined;
  const group = (navigation[project.id] ?? []).find((item) =>
    item.items.some((doc) => doc.id === entry.id),
  );
  return (
    <div className={styles.documentLayout}>
      <div className={styles.document}>
        <DocsBreadcrumbs project={project} title={entry.title} />
        <header className={styles.docHeading}>
          <span className="eyebrow">{group?.title}</span>
          <h1>{entry.title}</h1>
          <p>{entry.description}</p>
          <ContentLabels entry={entry} />
          <small className="muted">
            更新于{" "}
            <time dateTime={entry.updated ?? entry.date}>
              {formatDate(entry.updated ?? entry.date)}
            </time>{" "}
            · {entry.readingTime} 分钟阅读
          </small>
        </header>
        <ContentBody entry={entry} />
        <nav className={styles.pagination} aria-label="相邻章节">
          {previous ? (
            <ContentLink entry={previous}>
              <small>
                <ArrowLeft size={13} />
                上一篇
              </small>
              {previous.title}
            </ContentLink>
          ) : (
            <span />
          )}
          {next && (
            <ContentLink entry={next}>
              <small>
                下一篇
                <ArrowRight size={13} />
              </small>
              {next.title}
            </ContentLink>
          )}
        </nav>
      </div>
      {entry.toc.length > 0 && (
        <aside className={styles.toc}>
          <div className={styles.desktopToc}>
            <span>本页目录</span>
            <nav aria-label="本页目录">
              {entry.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  style={{ paddingLeft: item.depth === 3 ? 12 : 0 }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
          <details className={styles.mobileToc} key={entry.id}>
            <summary>本页目录</summary>
            <nav aria-label="本页目录">
              {entry.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  style={{ paddingLeft: item.depth === 3 ? 12 : 0 }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </details>
        </aside>
      )}
    </div>
  );
}
export function DocsOverview({ project }: { project: ProjectEntry }) {
  const groups = navigation[project.id] ?? [];
  const first = groups[0]?.items[0];
  return (
    <div className={styles.overview}>
      <DocsBreadcrumbs project={project} title="概览" />
      <header className={styles.docHeading}>
        <span className="eyebrow">DOCUMENTATION</span>
        <h1>{project.title} 文档</h1>
        <p>{project.description}</p>
        {first && (
          <ContentLink className="button primary" entry={first}>
            开始阅读
            <ArrowRight size={16} />
          </ContentLink>
        )}
      </header>
      <div className={styles.groups}>
        {groups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            {group.items.map((doc) => (
              <ContentLink entry={doc} key={doc.id} className={styles.docCard}>
                <h3>
                  {doc.title}
                  <ArrowRight size={16} />
                </h3>
                <p>{doc.description}</p>
              </ContentLink>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

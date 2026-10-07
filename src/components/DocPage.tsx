import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
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
      <Link to="/projects">项目</Link>
      <span>/</span>
      <Link to="/$project" params={{ project: project.slug }}>
        {project.title}
      </Link>
      <span>/</span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}
export function DocPage({
  project,
  entry,
  actions,
}: {
  project: ProjectEntry;
  entry: DocEntry | ProjectEntry;
  actions?: ReactNode;
}) {
  const documents = projectDocuments(catalog, project.id);
  const isHome = entry.kind === "projects";
  const index = documents.findIndex((doc) => doc.id === entry.id);
  const previous = index === 0 ? project : index > 0 ? documents[index - 1] : undefined,
    next = isHome ? documents[0] : index >= 0 ? documents[index + 1] : undefined;
  const group = (navigation[project.id] ?? []).find((item) =>
    item.items.some((doc) => doc.id === entry.id),
  );
  return (
    <div className={`${styles.documentLayout} ${entry.toc.length ? "" : styles.withoutToc}`}>
      <div className={styles.document}>
        <DocsBreadcrumbs project={project} title={isHome ? "Home" : entry.title} />
        <header className={styles.docHeading}>
          <span className="eyebrow">{isHome ? "Home" : group?.title}</span>
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
          {actions && <div className={`row ${styles.docActions}`}>{actions}</div>}
        </header>
        <ContentBody entry={entry} />
        {(previous || next) && (
          <nav className={styles.pagination} aria-label="相邻章节">
            {previous ? (
              <ContentLink entry={previous}>
                <small>
                  <ArrowLeft size={13} />
                  上一篇
                </small>
                {previous.kind === "projects" ? "Home" : previous.title}
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
        )}
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

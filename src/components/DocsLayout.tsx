import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { navigation } from "../generated/catalog";
import type { ProjectEntry } from "../lib/site";
import { ContentLink } from "./ContentLink";
import styles from "./ProjectDocs.module.css";
export function DocsLayout({ project }: { project: ProjectEntry }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const groups = navigation[project.id] ?? [];
  const chapterLinks = (
    <>
      <Link
        to="/$project"
        params={{ project: project.slug }}
        activeOptions={{ exact: true }}
        activeProps={{ "aria-current": "page" }}
      >
        Home
      </Link>
      {groups.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          {group.items.map((doc) => (
            <ContentLink
              entry={doc}
              key={doc.id}
              aria-current={pathname === doc.path ? "page" : undefined}
            >
              {doc.title}
            </ContentLink>
          ))}
        </section>
      ))}
    </>
  );
  return (
    <div className={styles.docsLayout}>
      <aside className={styles.chapters}>
        <nav className={styles.desktopNav} aria-label="文档章节">
          {chapterLinks}
        </nav>
        <details className={styles.mobileNav} key={pathname}>
          <summary>浏览章节</summary>
          <nav aria-label="移动端文档章节">{chapterLinks}</nav>
        </details>
      </aside>
      <Outlet />
    </div>
  );
}

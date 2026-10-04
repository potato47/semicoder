import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import { projects, navigation } from "../generated/catalog";
import type { ProjectEntry } from "../lib/site";
import { ContentLink } from "./ContentLink";
import styles from "./ProjectDocs.module.css";
export function DocsLayout({ project }: { project: ProjectEntry }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const groups = navigation[project.id] ?? [];
  const chapterLinks = (
    <>
      <Link
        to="/$project/docs"
        params={{ project: project.slug }}
        activeOptions={{ exact: true }}
        activeProps={{ "aria-current": "page" }}
      >
        文档概览
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
    <>
      <div className={styles.docsToolbar}>
        <div className="row">
          <BookOpen size={18} />
          <label htmlFor="docs-project">项目文档</label>
          <select
            id="docs-project"
            value={project.slug}
            onChange={(event) =>
              void navigate({ to: "/$project/docs", params: { project: event.target.value } })
            }
          >
            {projects
              .filter((item) => item.docsPath)
              .map((item) => (
                <option value={item.slug} key={item.id}>
                  {item.title}
                </option>
              ))}
          </select>
        </div>
        <div className="row">
          <Link to="/$project" params={{ project: project.slug }}>
            项目主页 ↗
          </Link>
          <Link
            className="button small"
            to="/search"
            search={{ type: "docs", projectId: project.id }}
          >
            <Search size={15} />
            搜索此项目
          </Link>
        </div>
      </div>
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
    </>
  );
}

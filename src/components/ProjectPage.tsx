import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, GitFork, ArrowUpRight } from "lucide-react";
import type { ProjectEntry } from "../lib/site";
import { catalog, navigation } from "../generated/catalog";
import { projectDocuments } from "../lib/content";
import { ContentBody, ContentLabels } from "./ContentBody";
import { ContentLink } from "./ContentLink";
import styles from "./ProjectDocs.module.css";
export function ProjectPage({ project }: { project: ProjectEntry }) {
  const start = projectDocuments(catalog, project.id).find((doc) => doc.id === project.start?.doc);
  return (
    <>
      <header className={styles.projectHero}>
        <Link to="/projects" className={styles.back}>
          <ArrowLeft size={14} />
          全部项目
        </Link>
        <div className="row">
          <span className="eyebrow">PROJECT / {project.category ?? "持续构建"}</span>
          {project.status && <span className="tag">{project.status}</span>}
        </div>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <ContentLabels entry={project} />
        <div className={styles.stack}>
          {project.stack.map((name) => (
            <span className="tag" key={name}>
              {name}
            </span>
          ))}
        </div>
        <div className="row">
          {start && (
            <ContentLink className="button primary" entry={start}>
              {project.start?.label}
              <ArrowUpRight size={16} />
            </ContentLink>
          )}
          {project.docsPath && (
            <Link
              className={start ? "button" : "button primary"}
              to="/$project/docs"
              params={{ project: project.slug }}
            >
              <BookOpen size={16} />
              阅读文档
            </Link>
          )}
          {project.source && (
            <a className="button" href={project.source}>
              <GitFork size={16} />
              查看源码
              <ArrowUpRight size={14} />
            </a>
          )}
          {project.demo && (
            <a className="button" href={project.demo}>
              在线演示 ↗
            </a>
          )}
        </div>
      </header>
      <div className={styles.projectContent}>
        <div>
          <ContentBody entry={project} />
        </div>
        {project.docsPath && (
          <aside className={styles.projectGuide}>
            <span className="eyebrow">开始探索</span>
            <h2>从这里上手</h2>
            {(navigation[project.id] ?? []).map((group) => (
              <section key={group.title}>
                <h3>{group.title}</h3>
                {group.items.map((doc) => (
                  <ContentLink key={doc.id} entry={doc}>
                    {doc.title}
                    <ArrowUpRight size={14} />
                  </ContentLink>
                ))}
              </section>
            ))}
          </aside>
        )}
      </div>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight } from "lucide-react";
import { projects, navigation } from "../generated/catalog";
import { seo } from "../lib/seo";
import styles from "../components/ProjectDocs.module.css";
export const Route = createFileRoute("/docs/")({
  head: () => seo("项目文档", "从快速开始到实现细节，理解每一个项目。", "/docs"),
  component: Docs,
});
function Docs() {
  const documented = projects.filter((project) => project.docsPath);
  return (
    <>
      <div className="pageIntro">
        <span className="eyebrow">
          <b>03 /</b> DOCUMENTATION
        </span>
        <h1>少一点摸索，多一点理解。</h1>
        <p>选择一个项目，从入门指南开始，一步步了解它的使用与实现。</p>
      </div>
      <div className={styles.docsIndex}>
        {documented.map((project) => (
          <section key={project.id} className={styles.projectCard}>
            <div className="row">
              <BookOpen size={22} />
              <span className="tag">
                {navigation[project.id].flatMap((group) => group.items).length} 篇文档
              </span>
            </div>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <div className="row">
              <Link
                to="/$project/docs"
                params={{ project: project.slug }}
                className="button primary"
              >
                阅读文档
                <ArrowRight size={15} />
              </Link>
              <Link to="/$project" params={{ project: project.slug }} className="button">
                项目主页
              </Link>
            </div>
          </section>
        ))}
      </div>
      {!documented.length && <p className="muted">项目文档正在准备中。</p>}
    </>
  );
}

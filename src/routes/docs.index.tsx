import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ArrowRight } from "lucide-react";
import { entries } from "../generated/content";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/docs/")({
  head: () => seo("项目文档", "从快速开始到实现细节，理解每一个项目。", "/docs"),
  component: Docs,
});
function Docs() {
  return (
    <>
      <div className="pageIntro">
        <span className="eyebrow">
          <b>03 /</b> DOCUMENTATION
        </span>
        <h1>少一点摸索，多一点理解。</h1>
        <p>项目的使用指南与开发手记。每份文档，都是一个清晰的开始。</p>
      </div>
      {entries
        .filter((x) => x.kind === "projects")
        .map((project) => (
          <section
            key={project.id}
            style={{
              padding: 30,
              border: "1px solid var(--line)",
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <div className="row">
              <BookOpen size={22} />
              <h2 style={{ margin: 0 }}>{project.title}</h2>
              <span className="tag">最新文档</span>
            </div>
            <p className="muted" style={{ fontSize: 14, marginTop: 15 }}>
              {project.description}
            </p>
            <div className="row">
              {entries
                .filter((x) => x.kind === "docs" && x.project === project.slug)
                .sort((a, b) => a.order - b.order)
                .map((doc) => (
                  <a href={doc.path} className="button" key={doc.id}>
                    {doc.title}
                    <ArrowRight size={15} />
                  </a>
                ))}
            </div>
          </section>
        ))}
    </>
  );
}

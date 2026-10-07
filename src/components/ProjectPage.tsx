import { GitFork, ArrowUpRight } from "lucide-react";
import type { ProjectEntry } from "../lib/site";
import { catalog } from "../generated/catalog";
import { projectDocuments } from "../lib/content";
import { DocPage } from "./DocPage";
import { ContentLink } from "./ContentLink";

export function ProjectPage({ project }: { project: ProjectEntry }) {
  const start = projectDocuments(catalog, project.id).find((doc) => doc.id === project.start?.doc);
  const actions =
    start || project.source || project.demo ? (
      <>
        {start && (
          <ContentLink className="button primary" entry={start}>
            {project.start?.label}
            <ArrowUpRight size={16} />
          </ContentLink>
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
      </>
    ) : undefined;
  return <DocPage project={project} entry={project} actions={actions} />;
}

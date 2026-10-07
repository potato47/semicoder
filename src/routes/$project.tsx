import { createFileRoute, notFound } from "@tanstack/react-router";
import { catalog } from "../generated/catalog";
import { findProject } from "../lib/content";
import { DocsLayout } from "../components/DocsLayout";
export const Route = createFileRoute("/$project")({
  beforeLoad: ({ params }) => {
    const project = findProject(catalog, params.project);
    if (!project) throw notFound();
    return { project };
  },
  component: function Page() {
    return <DocsLayout project={Route.useRouteContext().project} />;
  },
});

import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { catalog } from "../generated/catalog";
import { findProject } from "../lib/content";
export const Route = createFileRoute("/$project")({
  beforeLoad: ({ params }) => {
    const project = findProject(catalog, params.project);
    if (!project) throw notFound();
    return { project };
  },
  component: Outlet,
});

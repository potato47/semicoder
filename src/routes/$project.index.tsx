import { createFileRoute } from "@tanstack/react-router";
import { ProjectPage } from "../components/ProjectPage";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/$project/")({
  loader: ({ context }) => context.project,
  head: ({ loaderData }) =>
    loaderData ? seo(loaderData.title, loaderData.description, loaderData.path) : {},
  component: function Page() {
    return <ProjectPage project={Route.useLoaderData()} />;
  },
});

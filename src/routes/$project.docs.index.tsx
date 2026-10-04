import { createFileRoute } from "@tanstack/react-router";
import { DocsOverview } from "../components/DocPage";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/$project/docs/")({
  loader: ({ context }) => context.project,
  head: ({ loaderData }) =>
    loaderData ? seo(`${loaderData.title} 文档`, loaderData.description, loaderData.docsPath!) : {},
  component: function Page() {
    return <DocsOverview project={Route.useLoaderData()} />;
  },
});

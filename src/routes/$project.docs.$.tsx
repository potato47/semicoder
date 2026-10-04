import { createFileRoute, notFound } from "@tanstack/react-router";
import { catalog } from "../generated/catalog";
import { findDoc } from "../lib/content";
import { DocPage } from "../components/DocPage";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/$project/docs/$")({
  loader: ({ context, params }) => {
    const entry = findDoc(catalog, context.project.id, params._splat ?? "");
    if (!entry) throw notFound();
    return { project: context.project, entry };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(
          `${loaderData.entry.title} · ${loaderData.project.title} 文档`,
          loaderData.entry.description,
          loaderData.entry.path,
        )
      : {},
  component: function Page() {
    return <DocPage {...Route.useLoaderData()} />;
  },
});

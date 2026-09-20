import { createFileRoute, notFound } from "@tanstack/react-router";
import { entries } from "../generated/content";
import { ContentPage } from "../components/ContentPage";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/docs/$project/$slug")({
  loader: ({ params }) => {
    const entry = entries.find(
      (x) => x.kind === "docs" && x.project === params.project && x.slug === params.slug,
    );
    if (!entry) throw notFound();
    return entry;
  },
  head: ({ loaderData }) =>
    loaderData ? seo(loaderData.title, loaderData.description, loaderData.path) : {},
  component: function Page() {
    return <ContentPage entry={Route.useLoaderData()} />;
  },
});

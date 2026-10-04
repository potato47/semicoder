import { createFileRoute, notFound } from "@tanstack/react-router";
import type { BlogEntry } from "../lib/site";
import { entries } from "../generated/catalog";
import { ContentPage } from "../components/ContentPage";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const entry = entries.find((x): x is BlogEntry => x.kind === "blog" && x.slug === params.slug);
    if (!entry) throw notFound();
    return entry;
  },
  head: ({ loaderData }) =>
    loaderData ? seo(loaderData.title, loaderData.description, loaderData.path) : {},
  component: function Page() {
    return <ContentPage entry={Route.useLoaderData()} />;
  },
});

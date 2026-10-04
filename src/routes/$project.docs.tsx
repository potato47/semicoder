import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "../components/DocsLayout";
export const Route = createFileRoute("/$project/docs")({
  beforeLoad: ({ context }) => {
    if (!context.project.docsPath) throw notFound();
  },
  component: function Page() {
    return <DocsLayout project={Route.useRouteContext().project} />;
  },
});

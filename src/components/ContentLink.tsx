import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { ContentEntry } from "../lib/site";

type Props = {
  entry: ContentEntry;
  children: ReactNode;
  className?: string;
  hash?: string;
  "aria-label"?: string;
  "aria-current"?: "page";
};
export function ContentLink({ entry, ...props }: Props) {
  if (entry.kind === "docs")
    return (
      <Link
        to="/$project/docs/$"
        params={{ project: entry.projectSlug, _splat: entry.slug }}
        {...props}
      />
    );
  if (entry.kind === "projects")
    return <Link to="/$project" params={{ project: entry.slug }} {...props} />;
  return <Link to="/blog/$slug" params={{ slug: entry.slug }} {...props} />;
}

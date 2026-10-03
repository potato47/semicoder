import { site } from "./site";
export function seo(title: string, description: string, path: string) {
  return {
    meta: [
      { title: `${title} · ${site.name}` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: site.url + path },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: site.url + path }],
  };
}

import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import catalog from "./src/generated/catalog.json" with { type: "json" };

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, { theme: "github-dark", keepBackground: false }],
      ],
    }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: false,
        autoStaticPathsDiscovery: false,
        failOnError: true,
      },
      pages: [...catalog.publicPaths, "/admin"].map((path) => ({ path })),
    }),
    react(),
  ],
});

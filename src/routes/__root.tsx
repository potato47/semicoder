import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Shell } from "../components/Shell";
import { site } from "../lib/site";
import stylesheet from "../styles/global.css?url";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} · ${site.domain}` },
      { name: "description", content: site.description },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate", type: "application/rss+xml", title: site.name, href: "/rss.xml" },
    ],
  }),
  component: Root,
  shellComponent: Document,
  notFoundComponent: () => (
    <div className="empty">
      <span className="eyebrow">404 / LOST IN THE CODE</span>
      <h1>这个页面还没有被写出来。</h1>
      <p>可能链接已经改变，回到首页继续探索吧。</p>
      <a className="button primary" href="/">
        返回首页 ↗
      </a>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="empty">
      <h1>页面暂时无法加载</h1>
      <p>请重试，或返回首页继续阅读。</p>
      <button className="button" onClick={reset}>
        重试
      </button>
    </div>
  ),
});
function Root() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Shell>
        <Outlet />
      </Shell>
    </QueryClientProvider>
  );
}
function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch{}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

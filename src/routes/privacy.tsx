import { createFileRoute } from "@tanstack/react-router";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/privacy")({
  head: () => seo("隐私说明", "了解账号、评论与会话数据的使用方式。", "/privacy"),
  component: () => (
    <>
      <div className="pageIntro">
        <span className="eyebrow">PRIVACY</span>
        <h1>隐私说明</h1>
        <p>更新时间：2026 年 9 月 20 日</p>
      </div>
      <article className="prose" style={{ maxWidth: 740 }}>
        <h2>浏览与登录</h2>
        <p>
          无需登录即可阅读公开内容。GitHub
          登录用于识别评论作者；认证服务保存必要的账号标识、名称、邮箱、头像信息、OAuth
          凭据和会话。公开页面不会展示邮箱或凭据。
        </p>
        <h2>评论与安全</h2>
        <p>
          评论公开后会展示名称、正文和时间。待审核评论仅本人和管理员可见。删除评论会清空正文并保留回复结构。安全处理可能使用会话信息、请求来源、限流记录与
          Cloudflare Turnstile 验证。
        </p>
        <h2>本地存储与服务</h2>
        <p>
          必要 Cookie 用于会话；本地存储保存主题偏好。站点由 Cloudflare
          提供托管、数据库与安全服务，GitHub 提供登录。各服务也有自己的数据处理政策。
        </p>
        <h2>数据请求</h2>
        <p>
          你可删除自己的评论或退出登录。如需处理账号数据，请通过{" "}
          <a href="https://github.com/potato47/semicoder/issues">项目问题反馈</a>{" "}
          发起不含个人敏感信息的联系请求，再通过合适的私密渠道核实身份。
        </p>
      </article>
    </>
  ),
});

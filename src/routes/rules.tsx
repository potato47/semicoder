import { createFileRoute } from "@tanstack/react-router";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/rules")({
  head: () => seo("评论规则", "友善交流，分享有用的经验。", "/rules"),
  component: () => (
    <>
      <div className="pageIntro">
        <span className="eyebrow">COMMUNITY NOTES</span>
        <h1>友善交流，一起成长。</h1>
        <p>这里欢迎问题、不同观点和真实的实践经验。</p>
      </div>
      <article className="prose" style={{ maxWidth: 740 }}>
        <h2>参与讨论</h2>
        <p>
          使用 GitHub
          登录后发表评论。保持与文章相关，尊重他人，不发布广告、攻击性内容、秘密或个人敏感信息。每条评论最多
          3000 字，支持基础 Markdown，不支持 HTML。
        </p>
        <h2>审核与编辑</h2>
        <p>
          首次评论需要审核；通过后，新评论直接公开。编辑评论会重新进入审核。管理员可隐藏评论或限制账号。回复仅支持一层，以保持讨论清晰。
        </p>
        <h2>删除与反馈</h2>
        <p>
          你可以删除自己的评论，正文将被清空，已有回复保留结构。若发现不合适的内容，请通过项目反馈渠道联系维护者。
        </p>
      </article>
    </>
  ),
});

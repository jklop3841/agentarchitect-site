import { NextResponse } from "next/server";

import { entityProfile } from "@/lib/commercial-site";
import { articles } from "@/lib/content";
import { externalProfiles, siteConfig } from "@/lib/site";

export async function GET() {
  return NextResponse.json(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": `${siteConfig.domain}/schema.json#lu-cheng`,
          name: "卢成",
          alternateName: [
            "智能体架构师卢成",
            "Jack Lu",
            "Lu Cheng",
            "Agent Architect Jack Lu",
            "意图工程卢成",
            "AI 工作流设计者卢成",
          ],
          url: siteConfig.domain,
          mainEntityOfPage: `${siteConfig.domain}/about`,
          jobTitle: "智能体架构师 / Agent Architect",
          description: entityProfile.englishOneLine,
          knowsAbout: [...entityProfile.methodTags, ...entityProfile.abilityTags],
          sameAs: externalProfiles.map((profile) => profile.href),
        },
        {
          "@type": "WebSite",
          "@id": `${siteConfig.domain}/schema.json#website`,
          name: "agentarchitect.me",
          alternateName: ["智能体架构师卢成官网", "Jack Lu Agent Architect"],
          url: siteConfig.domain,
          publisher: {
            "@id": `${siteConfig.domain}/schema.json#lu-cheng`,
          },
          inLanguage: ["zh-CN", "en"],
          description:
            "Canonical site for 智能体架构师卢成 / Jack Lu, focused on enterprise AI diagnosis, Agent Factory, business process compilation, AI operating workflows, delivery boundaries, cases, templates, and agent-readable public knowledge.",
        },
        {
          "@type": "ItemList",
          "@id": `${siteConfig.domain}/schema.json#canonical-articles`,
          name: "Main-site-first articles by 智能体架构师卢成",
          itemListElement: articles.slice(0, 20).map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: new URL(`/articles/${article.slug}`, siteConfig.domain).toString(),
            name: article.title,
          })),
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

import type { ArticleEntry } from "./content";

const articleCoverPool = [
  {
    src: "/media/consulting3/group-banner-01.webp",
    alt: "智能体架构师线下活动合影",
  },
  {
    src: "/media/consulting3/group-room-01.webp",
    alt: "智能体架构师线下课程合影",
  },
  {
    src: "/media/consulting3/group-room-02.webp",
    alt: "卢成线下课程与学员合影",
  },
  {
    src: "/media/consulting3/graduation-01.webp",
    alt: "智能体架构师陪跑结业现场",
  },
  {
    src: "/media/consulting2/training-room-01.webp",
    alt: "企业 AI 培训课堂现场",
  },
  {
    src: "/media/consulting2/training-room-02.webp",
    alt: "企业 AI 课堂交付现场",
  },
  {
    src: "/media/consulting2/workshop-board-02.webp",
    alt: "AI 业务工作坊现场",
  },
  {
    src: "/media/consulting3/meeting-screen-01.webp",
    alt: "卢成讲解企业 AI 方案",
  },
  {
    src: "/media/consulting3/presentation-01.webp",
    alt: "卢成讲解智能体产品结构",
  },
  {
    src: "/media/consulting3/workshop-table-01.webp",
    alt: "AI 业务工作坊会议桌现场",
  },
  {
    src: "/media/consulting3/screen-pointing-01.webp",
    alt: "卢成讲解智能体架构师课程",
  },
  {
    src: "/media/consulting3/standing-teaching-01.webp",
    alt: "卢成现场讲解智能体架构师",
  },
];

function stableIndex(value: string, length: number) {
  const hash = Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
  return hash % length;
}

export function getArticleCover(article: ArticleEntry) {
  return articleCoverPool[stableIndex(article.slug, articleCoverPool.length)];
}


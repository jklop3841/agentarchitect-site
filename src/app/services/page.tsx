import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ConsultationTrigger } from "@/components/consultation-modal";
import { ImageStrip } from "@/components/image-strip";
import { SiteHeader } from "@/components/site-header";
import { serviceBoundaries } from "@/lib/site-architecture";

export const metadata: Metadata = {
  title: "产品与服务",
  description:
    "智能体架构师卢成的产品与服务：企业AI化改革、智能体架构师陪跑、AI服务商合作。",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "产品与服务 | 智能体架构师卢成",
    description: "不卖万能 AI 梦，先帮你把问题、边界、交付结果说清楚。",
    url: "/services",
  },
};

const services = [
  {
    title: "企业AI化改革",
    audience: "想用 AI 提效，但不想乱花钱试错的老板。",
    pain: "工具很多，项目很多，但业务流程、员工执行和结果验收没打通。",
    method: "先看业务、流程、团队和数据，再从一个小环节开始试点。",
    delivery: "AI 改革路线、试点方案、流程优化建议、验收口径。",
    image: "/media/consulting3/screen-teaching-01.webp",
  },
  {
    title: "智能体架构师陪跑",
    audience: "想进入智能体架构师行业、做出案例和产品的人。",
    pain: "懂一点 AI，但不会定位、不会报价、不会做交付闭环。",
    method: "陪你拆能力、拆产品、拆案例、拆交付，把方向做实。",
    delivery: "定位建议、产品设计、案例打磨、交付边界和成长路线。",
    image: "/media/consulting3/whiteboard-01.webp",
  },
  {
    title: "AI服务商合作",
    audience: "做 AI 交付、代运营、智能体定制的一人企业或小团队。",
    pain: "客户需求乱、交付边界乱、售后重，项目容易被拖死。",
    method: "一起梳理报价、合同边界、交付流程、验收标准和客户沟通。",
    delivery: "合作方案、交付模板、边界清单、项目复盘和联合案例。",
    image: "/media/consulting3/group-banner-01.webp",
  },
];

const serviceSteps = ["说清问题", "判断能不能做", "拆交付边界", "设计试点", "交付复盘", "沉淀模板"];

const deliveryGallery = [
  { src: "/media/consulting3/group-room-01.webp", alt: "企业AI化改革合影", title: "企业AI化改革", caption: "从老板问题开始。" },
  { src: "/media/consulting3/presentation-01.webp", alt: "企业AI方案讲解", title: "方案讲解", caption: "把流程讲清楚。" },
  { src: "/media/consulting3/workshop-table-01.webp", alt: "AI 工作坊会议桌", title: "工作坊", caption: "一起拆业务动作。" },
  { src: "/media/consulting3/graduation-01.webp", alt: "智能体架构师结业合影", title: "陪跑结业", caption: "把成长做成结果。" },
  { src: "/media/consulting3/screen-pointing-01.webp", alt: "智能体架构师课程讲解", title: "课程讲解", caption: "标准、产品、交付。" },
  { src: "/media/consulting2/training-room-02.webp", alt: "企业 AI 课堂现场", title: "课堂交付", caption: "让团队能接住。" },
  { src: "/media/consulting2/workshop-board-02.webp", alt: "AI 服务商工作坊", title: "服务商合作", caption: "报价和边界一起看。" },
  { src: "/media/consulting3/group-banner-01.webp", alt: "智能体架构师线下合影", title: "线下活动", caption: "行业共识持续沉淀。" },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader locale="zh" />
      <main className="subpage consulting-page">
        <section className="subpage__hero subpage__hero--centered">
          <p className="eyebrow">商业交付版</p>
          <h1>产品与服务</h1>
          <p className="subpage__lead">不卖万能 AI 梦。先把问题、边界、交付结果说清楚。</p>
          <div className="hero__actions">
            <ConsultationTrigger label="立即咨询" className="button button--gold" />
            <Link href="/standard" className="button button--ghost">
              先看标准
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="service-board">
            {services.map((service, index) => (
              <article key={service.title} className="service-sheet">
                <div className="service-sheet__header">
                  <figure className="site-photo site-photo--service-icon">
                    <Image
                      src={service.image}
                      alt={`${service.title}服务场景`}
                      fill
                      sizes="72px"
                    />
                  </figure>
                  <h2>
                    {index + 1}. {service.title}
                  </h2>
                </div>
                <dl>
                  <div>
                    <dt>适合谁</dt>
                    <dd>{service.audience}</dd>
                  </div>
                  <div>
                    <dt>核心痛点</dt>
                    <dd>{service.pain}</dd>
                  </div>
                  <div>
                    <dt>方法</dt>
                    <dd>{service.method}</dd>
                  </div>
                  <div>
                    <dt>交付结果</dt>
                    <dd>{service.delivery}</dd>
                  </div>
                </dl>
                <ConsultationTrigger label="立即咨询" className="button button--primary service-sheet__cta" />
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="consulting-split">
            <div>
              <p className="eyebrow">服务流程</p>
              <h2>不是上来就开发，先把事情做小、做清楚。</h2>
              <div className="process-strip">
                {serviceSteps.map((step, index) => (
                  <div key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
            <ImageStrip images={deliveryGallery} variant="compact" />
          </div>
        </section>

        <section className="section">
          <div className="consulting-split consulting-split--reverse">
            <ImageStrip images={deliveryGallery} variant="compact" />
            <div>
              <p className="eyebrow">不承诺什么</p>
              <h2>我能做什么会说清楚，不能做什么也会提前说。</h2>
              <ul className="principle-list">
                {serviceBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="consulting-contact">
            <div>
              <p className="eyebrow">联系方式</p>
              <h2>想咨询，先把你的项目问题发来。</h2>
              <p>
                写清楚你做什么行业、哪里卡住、想让 AI 解决什么。
              </p>
              <div className="hero__actions">
                <ConsultationTrigger label="添加助理咨询" className="button button--gold" />
                <Link href="/standard" className="button button--outline-light">
                  先看标准
                </Link>
              </div>
            </div>
            <figure className="site-photo site-photo--contact">
              <Image
                src="/media/contact/wecom-assistant.png"
                alt="卢成助理企业微信二维码"
                fill
                sizes="(max-width: 980px) 100vw, 340px"
              />
            </figure>
          </div>
        </section>
      </main>
    </>
  );
}

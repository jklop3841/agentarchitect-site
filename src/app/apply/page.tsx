import type { Metadata } from "next";

import { ApplyForm } from "@/components/apply-form";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Apply for Access",
  description: "Apply for a private access key to call the workflow runtime.",
};

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="subpage">
        <section className="subpage__hero">
          <p className="eyebrow">Apply</p>
          <h1>申请访问 Key</h1>
          <p className="subpage__lead">
            当前为种子用户阶段。我们先优先支持真实 Agent 场景、自动化开发者和需要稳定受控输出的小团队。
          </p>
        </section>

        <section className="section">
          <div className="detail-grid">
            <div>
              <h3>What to expect</h3>
              <ul>
                <li>人工审核你的场景与预估调用量</li>
                <li>通过后发放访问 Key</li>
                <li>根据使用情况继续调整能力与配额</li>
              </ul>
            </div>
            <div>
              <h3>What helps approval</h3>
              <ul>
                <li>明确的 Agent 或自动化调用场景</li>
                <li>具体的输入输出预期</li>
                <li>合理的调用频率和验证方式</li>
              </ul>
            </div>
            <div>
              <h3>Direct contact</h3>
              <ul>
                <li>智能体架构师卢成：{siteConfig.phone}</li>
                <li>如果你已经有明确场景，也可以先电话沟通再申请</li>
                <li>站点默认仍以 `/apply` 作为正式承接入口</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <ApplyForm />
        </section>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";

import { ApplyForm } from "@/components/apply-form";
import { SiteHeader } from "@/components/site-header";

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
          <p className="eyebrow">合作申请</p>
          <h1>申请访问 Key</h1>
          <p className="subpage__lead">
            当前为种子用户阶段。我们先优先支持真实 Agent 场景、自动化开发者和需要稳定受控输出的小团队。
          </p>
        </section>

        <section className="section">
          <div className="detail-grid">
            <div>
              <h3>申请流程</h3>
              <ul>
                <li>人工审核你的场景与预估调用量</li>
                <li>通过后发放访问 Key</li>
                <li>根据使用情况继续调整能力与配额</li>
              </ul>
            </div>
            <div>
              <h3>更容易通过的情况</h3>
              <ul>
                <li>明确的 Agent 或自动化调用场景</li>
                <li>具体的输入输出预期</li>
                <li>合理的调用频率和验证方式</li>
              </ul>
            </div>
            <div>
              <h3>联系偏好</h3>
              <p className="doc-body">本站不公开电话号码，统一以微信二维码和正式表单作为沟通入口，后续也可以按场景扩展更多联系二维码。</p>
              <div className="apply-contact-qr">
                <Image
                  src="/media/contact/wechat-qr.png"
                  alt="微信二维码"
                  width={560}
                  height={790}
                  className="apply-contact-qr__image"
                />
              </div>
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

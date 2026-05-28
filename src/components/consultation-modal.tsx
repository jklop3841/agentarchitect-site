"use client";

import Image from "next/image";
import { useState } from "react";

type ConsultationTriggerProps = {
  label?: string;
  description?: string;
  className?: string;
};

export function ConsultationTrigger({
  label = "添加助理咨询",
  description,
  className = "button button--gold",
}: ConsultationTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setIsOpen(true)}>
        <span>{label}</span>
        {description && <small>{description}</small>}
      </button>
      {isOpen && (
        <div className="consultation-modal" role="dialog" aria-modal="true" aria-labelledby="consultation-title">
          <button className="consultation-modal__backdrop" type="button" aria-label="关闭咨询二维码" onClick={() => setIsOpen(false)} />
          <div className="consultation-modal__panel">
            <button className="consultation-modal__close" type="button" aria-label="关闭" onClick={() => setIsOpen(false)}>
              ×
            </button>
            <p className="eyebrow">微信 / 咨询</p>
            <h2 id="consultation-title">添加卢成助理企业微信</h2>
            <p>商务咨询、合作对接、预约沟通，请先添加助理并备注你的行业和问题。</p>
            <div className="consultation-modal__grid">
              <figure className="consultation-card consultation-card--primary">
                <Image
                  src="/media/contact/wecom-assistant.png"
                  alt="卢成助理企业微信二维码"
                  width={960}
                  height={2048}
                  priority
                />
                <figcaption>
                  <strong>卢成助理企业微信</strong>
                  <span>商务咨询 / 合作对接 / 预约沟通</span>
                </figcaption>
              </figure>
              <figure className="consultation-card">
                <Image src="/media/contact/wechat-qr.png" alt="卢成本人微信二维码" width={1112} height={1518} />
                <figcaption>
                  <strong>卢成本人微信</strong>
                  <span>明确合作意向 / 老客户 / 重要事项</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


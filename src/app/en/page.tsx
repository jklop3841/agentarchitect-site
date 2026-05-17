import type { Metadata } from "next";

import { HomePage } from "@/components/home-page";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Jack Lu | Agent Architect",
  description:
    "English entry for Jack Lu / Lu Cheng, a Chinese Agent Architect focused on enterprise AI diagnosis, workflow design, delivery boundaries, and agent-friendly public knowledge systems.",
  alternates: {
    canonical: "/en",
  },
};

export default function EnglishHomePage() {
  return (
    <>
      <SiteHeader locale="en" />
      <HomePage locale="en" />
    </>
  );
}

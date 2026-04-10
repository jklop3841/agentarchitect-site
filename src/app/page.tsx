import { SiteHeader } from "@/components/site-header";
import { HomePage } from "@/components/home-page";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <HomePage locale="zh" />
    </>
  );
}

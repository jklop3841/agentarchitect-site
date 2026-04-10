import { HomePage } from "@/components/home-page";
import { SiteHeader } from "@/components/site-header";

export default function EnglishHomePage() {
  return (
    <>
      <SiteHeader locale="en" />
      <HomePage locale="en" />
    </>
  );
}

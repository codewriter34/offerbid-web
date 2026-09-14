import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { LandingClient } from "@/app/LandingClient";

export default function LandingPage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      <LandingClient />
    </>
  );
}

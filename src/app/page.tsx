import { LandingClient } from "@/app/LandingClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
} from "@/lib/seo";

export default function LandingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: absoluteUrl(),
          description: SITE_DESCRIPTION,
          inLanguage: "en",
          potentialAction: {
            "@type": "SearchAction",
            target: `${absoluteUrl("/explore")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: absoluteUrl(),
          logo: absoluteUrl("/logo-mark.png"),
          slogan: SITE_TAGLINE,
          areaServed: "CM",
          description: SITE_DESCRIPTION,
        }}
      />
      <LandingClient />
    </>
  );
}

import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "OfferBid MVP terms of use for the campus marketplace.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        OfferBid is an MVP marketplace for campus second-hand deals. By using
        the web or mobile app you agree to list honestly, bid in good faith,
        and complete handovers in person.
      </p>
      <p>
        We do not take possession of items, hold money, or guarantee that a
        buyer or seller will show up. Structured bids expire after 24 hours.
        WhatsApp is used only after an offer is accepted or a contact request
        is granted.
      </p>
      <p>
        Unverified accounts may keep a small number of active listings.
        Identity verification can raise that cap. We may close listings or
        suspend accounts that look like spam, fraud, or prohibited goods.
      </p>
      <p>
        These terms are a short MVP notice, not a substitute for full legal
        counsel. They will be expanded before a wider public launch.
      </p>
    </LegalPage>
  );
}

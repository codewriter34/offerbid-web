import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "Meet in public, inspect before paying, and close on WhatsApp. OfferBid safety rules for campus deals.",
};

export default function SafetyPage() {
  return (
    <LegalPage title="Stay safe on campus deals">
      <p>
        OfferBid is a structured marketplace, not an escrow service. You meet
        in person, inspect the item, then pay cash or MoMo. There is no in-app
        chat and no in-app payment.
      </p>
      <h2 className="font-display text-xl font-bold text-ink">Meetup rules</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Meet in a busy public spot — UB Gate, campus gates, markets.</li>
        <li>Bring a friend when you can. Tell someone where you are going.</li>
        <li>Inspect the item before you pay. Power it on. Check serials.</li>
        <li>Never send a deposit to “hold” an item you have not seen.</li>
        <li>Use the in-app Accept/Reject/Counter loop. Ignore off-platform pressure.</li>
      </ul>
      <h2 className="font-display text-xl font-bold text-ink">WhatsApp close</h2>
      <p>
        After an offer is accepted, OfferBid unlocks a pre-filled WhatsApp
        chat. Use it to confirm time and place only. Keep money talk until you
        are together.
      </p>
      <h2 className="font-display text-xl font-bold text-ink">Report</h2>
      <p>
        Use Report listing on any detail page if something looks like a scam,
        stolen goods, or harassment. We review reports and can close listings.
      </p>
    </LegalPage>
  );
}

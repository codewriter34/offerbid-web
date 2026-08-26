import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description:
    "OfferBid terms for buying and selling pre-owned items in Cameroon — liability, meetups, payments, and user rules.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p className="text-ink-muted">
        Last updated: 26 August 2026 · Applies to OfferBid web and mobile in
        Cameroon (and any other hubs we open later).
      </p>

      <h2 className="font-display text-xl font-bold text-ink">1. What OfferBid is</h2>
      <p>
        OfferBid is a peer-to-peer marketplace that helps people list, discover,
        and negotiate pre-owned goods. We provide listing tools, structured
        offers (accept / reject / counter), and a WhatsApp handoff after a deal
        sticks. We are <strong>not</strong> a shop, courier, escrow, bank, or
        Mobile Money operator. We never take possession of your item and we
        never hold your cash or MoMo for a trade.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        2. Who these terms cover
      </h2>
      <p>
        These terms bind anyone who creates an account, browses listings, places
        bids, sells, verifies identity, or otherwise uses OfferBid in Cameroon.
        If you use the service for a business, you confirm you are allowed to
        bind that business. You must be old enough under Cameroonian law to form
        a binding agreement and to trade the goods you list.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        3. No liability for scams, loss, or damage
      </h2>
      <p>
        <strong>
          OfferBid is not responsible for scams, fraud, stolen goods, defective
          items, personal injury, property damage, or failed meetups.
        </strong>{" "}
        You trade at your own risk with other users. We do not guarantee that a
        buyer or seller is who they claim to be, that an item matches its
        photos, that a party will show up, or that payment will be completed.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          We are not liable for money lost to deposits, “reservation fees,” or
          off-platform transfers before you have inspected the item in person.
        </li>
        <li>
          We are not liable for damage to phones, vehicles, homes, or other
          property arising from a meetup or handover.
        </li>
        <li>
          We are not liable for disputes between buyers and sellers after
          WhatsApp contact is opened.
        </li>
      </ul>
      <p>
        To the maximum extent allowed by applicable Cameroonian law, OfferBid,
        its operators, and partners exclude liability for indirect, incidental,
        or consequential loss connected to your use of the service.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        4. Always meet face to face before paying
      </h2>
      <p>
        <strong>
          You must meet in person, in a safe public place, and fully inspect the
          item before you pay.
        </strong>{" "}
        Cash and Mobile Money (MoMo) happen between you and the other party —
        not inside OfferBid. Never send full payment, deposits, or “delivery
        fees” to someone you have not met and whose item you have not checked.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Prefer busy daylight spots (markets, main roads, petrol stations).</li>
        <li>Bring a friend when you can; tell someone where you are going.</li>
        <li>Power on electronics, test functions, and check serials before paying.</li>
        <li>Walk away if anything feels rushed, secretive, or off.</li>
      </ul>
      <p>
        More practical tips live on our{" "}
        <Link href="/safety" className="font-semibold text-primary hover:underline">
          Safety
        </Link>{" "}
        page. Safety guidance does not create a duty of care beyond what the law
        already requires.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        5. Accounts, honesty, and prohibited goods
      </h2>
      <p>
        Provide accurate name, WhatsApp, hub, and listing details. Do not list
        stolen, counterfeit, illegal, or restricted goods under Cameroonian law
        (including weapons, drugs, and other prohibited categories). Do not
        harass other users or game the bidding system. We may limit active
        listings for unverified accounts, raise caps after identity review, and
        suspend or close accounts that look like spam, fraud, or abuse.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        6. Offers, expiry, and WhatsApp
      </h2>
      <p>
        Structured bids typically expire after 24 hours. Accepting an offer may
        unlock a pre-filled WhatsApp chat so you can confirm time and place.
        WhatsApp is a third-party service with its own terms; OfferBid does not
        control WhatsApp chats after handoff.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        7. Privacy and encrypted connections
      </h2>
      <p>
        How we handle personal data is described in our{" "}
        <Link href="/privacy" className="font-semibold text-primary hover:underline">
          Privacy Policy
        </Link>
        . In short: traffic between your device and OfferBid runs over encrypted
        HTTPS/TLS connections. We do not process card payments in-app because
        money changes hands in person via cash or MoMo.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        8. Cameroon focus and governing law
      </h2>
      <p>
        OfferBid is built for local, in-person pre-owned trade in Cameroon
        (Douala, Yaoundé, Buea, Limbe, and other hubs we support). These terms
        are governed by the laws of the Republic of Cameroon. Courts or
        competent authorities in Cameroon have jurisdiction over disputes that
        cannot be resolved amicably, without limiting any mandatory consumer
        protections that apply to you.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">9. Changes</h2>
      <p>
        We may update these terms as the product grows. Continued use after an
        update means you accept the revised terms. Material changes will be
        reflected by updating the date above and, where practical, notifying
        active users.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">10. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a
          className="font-semibold text-primary"
          href="mailto:forwamba.achingale@ubuea.cm"
        >
          forwamba.achingale@ubuea.cm
        </a>
        .
      </p>
    </LegalPage>
  );
}

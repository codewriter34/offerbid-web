import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How OfferBid collects, protects, and uses account, listing, and identity data for the Cameroon marketplace.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-ink-muted">
        Last updated: 26 August 2026 · Written for users in Cameroon.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">1. Who we are</h2>
      <p>
        OfferBid (“we”, “us”) operates a pre-owned marketplace for local deals.
        This policy explains what we collect, why, how it is protected, and your
        choices. It sits alongside our{" "}
        <Link href="/terms" className="font-semibold text-primary hover:underline">
          Terms of use
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        2. What we collect
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Account:</strong> name, email, WhatsApp number, country, and
          whether you mainly buy or sell.
        </li>
        <li>
          <strong>Hub:</strong> city, neighborhood, and meetup hint so nearby
          buyers can find realistic pickup spots.
        </li>
        <li>
          <strong>Marketplace activity:</strong> listings, photos, prices, bids,
          responses, reports, and related timestamps.
        </li>
        <li>
          <strong>Optional identity:</strong> ID images and selfie if you request
          verification to raise listing limits.
        </li>
        <li>
          <strong>Technical:</strong> device/browser basics, IP-related signals,
          and auth session data needed to keep you signed in securely.
        </li>
      </ul>

      <h2 className="font-display text-xl font-bold text-ink">
        3. Encrypted connections &amp; security
      </h2>
      <p>
        <strong>
          Your information travels between your device and OfferBid over
          encrypted connections (HTTPS / TLS).
        </strong>{" "}
        Passwords are handled through our authentication API and are not shown
        to other users. Session tokens for the web app are stored in your
        browser so the site can talk to the same API as the mobile app.
      </p>
      <p>
        We do not ask for bank cards inside OfferBid. Payments are cash or MoMo
        between users after an in-person inspection — so we do not store card
        PAN data for trades. No security measure is perfect; you still choose
        strong passwords and protect your phone and email.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        4. How we use data
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Create and secure your account, and send verification or reset codes.</li>
        <li>Show listings and hubs relevant to Cameroon cities we support.</li>
        <li>Run the bid / accept / reject / counter flow and WhatsApp handoff.</li>
        <li>Review identity documents only for verification decisions.</li>
        <li>Fight spam, fraud, and abuse; respond to lawful requests.</li>
        <li>Improve reliability and safety of the marketplace.</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2 className="font-display text-xl font-bold text-ink">
        5. Photos &amp; identity uploads
      </h2>
      <p>
        Listing photos and KYC images are uploaded through our API’s secure
        storage flow (for example S3-compatible object storage). Identity
        documents are used for verification review, not for public display on
        listings.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        6. Sharing &amp; third parties
      </h2>
      <p>
        We share data only as needed to run the product: hosting and storage
        providers, email/OTP delivery, analytics or error tooling we may use,
        and Google Sign-In / Firebase when you choose that login path (we do not
        receive your Google password). After a deal is accepted, contact may
        move to WhatsApp, which is governed by Meta’s own policies.
      </p>
      <p>
        We may disclose information if required by Cameroonian law, court order,
        or to protect users from serious harm or fraud.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">
        7. Your choices (Cameroon users)
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Update profile, hub, and avatar from your account screens.</li>
        <li>Close or report listings that look unsafe or fraudulent.</li>
        <li>
          Email us to ask what we hold about you, or to request correction or
          deletion where we can do so without breaking legal or safety duties.
        </li>
      </ul>

      <h2 className="font-display text-xl font-bold text-ink">8. Retention</h2>
      <p>
        We keep account and transaction records as long as needed to operate the
        service, resolve disputes, and meet legal obligations. You may request
        deletion of optional KYC materials after a review decision, subject to
        fraud-prevention needs.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">9. Children</h2>
      <p>
        OfferBid is not directed at children who cannot lawfully contract under
        Cameroonian law. If you believe a minor’s data was submitted, contact us
        so we can take appropriate steps.
      </p>

      <h2 className="font-display text-xl font-bold text-ink">10. Contact</h2>
      <p>
        Privacy questions:{" "}
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
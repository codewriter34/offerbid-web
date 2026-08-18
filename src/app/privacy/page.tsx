import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How OfferBid handles account, listing, and identity data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        We collect the account details you provide: name, email, WhatsApp
        number, hub (city, neighborhood, meetup hint), listings, bids, and
        optional identity documents for verification.
      </p>
      <p>
        Auth tokens live in this browser’s local storage so the web app can
        talk to the same Nest API as the mobile app. Google Sign-In sends an
        ID token to our API; we do not see your Google password.
      </p>
      <p>
        Listing photos and identity images are stored via the API’s S3
        presign flow. Identity documents are used only for verification
        review. We do not sell personal data.
      </p>
      <p>
        For account or data questions, email{" "}
        <a className="font-semibold text-primary" href="mailto:forwamba.achingale@ubuea.cm">
          forwamba.achingale@ubuea.cm
        </a>
        .
      </p>
    </LegalPage>
  );
}

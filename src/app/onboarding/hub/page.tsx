"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/Shells";
import { HubFields } from "@/components/hub/HubFields";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { completeProfile } from "@/features/auth/authService";
import { useAuthStore } from "@/stores/authStore";
import { useHubStore } from "@/stores/hubStore";
import { getErrorMessage } from "@/lib/formatters";
import { popConfetti } from "@/lib/confetti";
import { assertRealPlace, type HubDraft } from "@/lib/hubs";
import { setLocalWhatsAppPhone } from "@/lib/whatsappPhone";
import { COUNTRY_OPTIONS } from "@/lib/env";
import { isValidLocalPhone, phoneTypingHint } from "@/lib/validators";
import type { Country } from "@/types";

export default function HubOnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const countries = useHubStore((s) => s.countries);
  const otherLabel = useHubStore((s) => s.otherLabel);
  const setSelection = useHubStore((s) => s.setSelection);

  const [hub, setHub] = useState<HubDraft>({
    country: user?.country ?? countries[0]?.country ?? "CAMEROON",
    city: user?.city ?? "",
    customCity: "",
    location: user?.location ?? "",
    customLocation: "",
  });
  const [address, setAddress] = useState(user?.address ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.phone?.replace(/\D/g, "") ?? "");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth?next=/onboarding/hub");
  }, [isLoading, user, router]);

  async function save() {
    const city = hub.city === otherLabel ? hub.customCity : hub.city;
    const location =
      hub.location === otherLabel ? hub.customLocation : hub.location;
    setNotice(null);
    const placeErr = assertRealPlace(city, location, otherLabel);
    if (placeErr) {
      setNotice(placeErr);
      return;
    }
    if (address.trim().length < 2) {
      setNotice("Add a meetup address or landmark");
      return;
    }
    const phoneDigits = whatsapp.replace(/\D/g, "");
    if (phoneDigits) {
      const country = (hub.country === "NIGERIA" ? "NIGERIA" : "CAMEROON") as Country;
      if (!isValidLocalPhone(whatsapp, country)) {
        setNotice(
          phoneTypingHint(whatsapp, country) ?? "Enter a valid WhatsApp number, or leave it blank",
        );
        return;
      }
    }
    setSaving(true);
    try {
      const countryCode =
        COUNTRY_OPTIONS.find((c) => c.country === hub.country)?.countryCode ??
        "+237";
      const updated = await completeProfile({
        city,
        location,
        address: address.trim(),
        ...(phoneDigits
          ? {
              phone: phoneDigits,
              countryCode,
            }
          : {}),
      });
      setUser(updated);
      setSelection(city, location);
      if (phoneDigits) {
        setLocalWhatsAppPhone(`${countryCode}${phoneDigits}`);
      }
      popConfetti();
      if (updated.primaryIntent === "SELL") {
        router.replace("/sell");
      } else {
        router.replace("/explore");
      }
    } catch (e) {
      setNotice(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <PageHeader
          title="Choose your hub"
          description="Your hub is where you sell from and meet buyers. Pick the city you live in so listings show in the right place."
        />

        <div className="space-y-4 rounded-lg border border-border bg-surface p-4 shadow-rest">
          <ActionNotice message={notice} tone="error" />
          <HubFields draft={hub} onChange={setHub} showCountry numbered />
          <Input
            label="Meetup hint / address area"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Near main road or landmark"
            required
          />
          <Input
            label="WhatsApp number (optional)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder={hub.country === "NIGERIA" ? "8012345678" : "6XXXXXXXX"}
            helper="Add now or later in Profile. Needed only when you want WhatsApp handoff after a deal."
          />
          <Button loading={saving} onClick={save} className="w-full" size="lg">
            Continue to Explore
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

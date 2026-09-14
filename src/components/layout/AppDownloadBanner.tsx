"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ANDROID_APP_URL, IOS_APP_URL } from "@/lib/env";
import { detectAppStoreTarget, isStandaloneDisplay } from "@/lib/device";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "offerbid_hide_app_banner";

type Target = "ios" | "android";

export function AppDownloadBanner() {
  const [target, setTarget] = useState<Target | null>(null);
  const [iosSoonOpen, setIosSoonOpen] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // private mode
    }
    setTarget(detectAppStoreTarget() ?? "android");
  }, []);

  if (!target) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setTarget(null);
  }

  function install() {
    if (target === "ios") {
      if (IOS_APP_URL) {
        window.open(IOS_APP_URL, "_blank", "noopener,noreferrer");
        return;
      }
      setIosSoonOpen(true);
      return;
    }
    window.open(ANDROID_APP_URL, "_blank", "noopener,noreferrer");
  }

  const platformLabel = target === "ios" ? "iOS" : "Android";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-black/10 bg-white px-3 py-2.5">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[#8e8e93]"
          aria-label="Dismiss app download banner"
        >
          <X className="h-5 w-5" strokeWidth={2.25} />
        </button>

        <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-primary ring-1 ring-black/5">
          <img
            src="/logo-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </span>

        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-ink">
          OfferBid for {platformLabel}
        </p>

        <button
          type="button"
          onClick={install}
          className="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full bg-primary px-4 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-primary-hover"
        >
          Install
        </button>
      </div>

      <Dialog
        open={iosSoonOpen}
        onClose={() => setIosSoonOpen(false)}
        title="Coming soon"
      >
        <p className="text-sm leading-relaxed text-ink-secondary">
          The OfferBid iOS app is not yet available on the App Store. You can
          keep using the website for now — we’ll add the download as soon as it
          ships.
        </p>
        <Button className="mt-5 w-full" onClick={() => setIosSoonOpen(false)}>
          Not yet available
        </Button>
      </Dialog>
    </>
  );
}

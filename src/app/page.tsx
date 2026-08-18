import Image from "next/image";
import Link from "next/link";
import { Camera, Gavel, MapPin, MessageCircle } from "lucide-react";
import { MarketingShell } from "@/components/layout/Shells";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FeaturedDeals } from "@/components/marketing/FeaturedDeals";

export default function LandingPage() {
  return (
    <MarketingShell>
      <section className="relative isolate flex min-h-[calc(100dvh-4.5rem)] items-end overflow-hidden bg-ink ob-grain pb-16 pt-10 md:items-center md:pb-24">
        <Image
          src="/hero-bg.jpg"
          alt="Open-air clothing market in West Africa"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink/85 via-ink/35 to-black/25 md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[min(40rem,62%)] bg-gradient-to-r from-ink/85 via-ink/50 to-transparent md:block" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 lg:px-6">
          <p className="animate-fade-rise mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/90">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              Live in Buea · Molyko · UB Gate · Sandpit · Mile 17
            </span>
          </p>
          <h1 className="animate-fade-rise max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Unused gear nearby. Make a fair offer.
          </h1>
          <p className="animate-fade-rise-delay mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Phones, laptops, and hostel stuff around campus. Meet in public,
            pay cash or MoMo, close on WhatsApp.
          </p>
          <div className="animate-fade-rise-delay-2 relative z-20 mt-8 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex h-12 cursor-pointer items-center rounded-md bg-white px-6 text-sm font-bold text-ink transition hover:bg-white/90"
            >
              Browse Buea deals
            </Link>
            <Link
              href="/auth?next=/sell"
              className="inline-flex h-12 cursor-pointer items-center rounded-md border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Start selling
            </Link>
          </div>
        </div>
        <a
          href="https://unsplash.com/photos/TaETOg3N7Ys"
          className="absolute bottom-3 right-4 z-10 text-[10px] text-white/45 hover:text-white/80"
        >
          Photo: Unsplash
        </a>
      </section>

      <section id="how" className="relative z-10 scroll-mt-20 bg-canvas px-4 py-20 text-ink lg:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            How OfferBid works
          </h2>
          <p className="mt-3 max-w-2xl text-ink-secondary">
            Unused gear nearby, a fair offer, then meet in person — no endless
            chat until a deal sticks.
          </p>
          <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "01",
                icon: Camera,
                title: "List or browse nearby",
                body: "Photos, a price, and a pickup spot. Buyers only see deals they can actually collect.",
              },
              {
                step: "02",
                icon: Gavel,
                title: "Make a fair offer",
                body: "Accept, reject, or counter. 24 hours on the clock — not endless status updates.",
              },
              {
                step: "03",
                icon: MessageCircle,
                title: "Close on WhatsApp",
                body: "When it sticks, we open a pre-filled chat. Meet in public. Pay cash or MoMo.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-md border border-border bg-surface p-6 shadow-rest"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-primary">
                    {item.step}
                  </p>
                  <item.icon
                    className="h-5 w-5 text-primary"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-ink-secondary">
              Meet in public · Cash or MoMo · 24-hour offers
            </p>
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
            >
              Browse Buea deals →
            </Link>
          </div>
        </div>
      </section>

      <section id="feed" className="relative z-10 scroll-mt-20 border-y border-border bg-canvas px-4 py-20 text-ink lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Live on the feed
              </h2>
              <p className="mt-2 text-ink-secondary">
                Live Buea deals — phones, laptops, hostel gear.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
            >
              See all Buea deals →
            </Link>
          </div>
          <FeaturedDeals />
        </div>
      </section>

      <SiteFooter light />
    </MarketingShell>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Camera, Gavel, MapPin, MessageCircle } from "lucide-react";
import { AppShell, MarketingShell } from "@/components/layout/Shells";
import { FeaturedDeals } from "@/components/marketing/FeaturedDeals";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuthStore } from "@/stores/authStore";

const ORBIT_PRODUCTS = [
  {
    label: "Armchair",
    meta: "Limbe · 35k",
    src: "/orbit/chair.jpg",
  },
  {
    label: "Leather boots",
    meta: "Yaoundé · 18k",
    src: "/orbit/boots.jpg",
  },
  {
    label: "Thrift rack",
    meta: "Buea · from 3k",
    src: "/orbit/clothes.jpg",
  },
  {
    label: "Velvet sofa",
    meta: "Douala · 85k",
    src: "/orbit/sofa.jpg",
  },
  {
    label: "Vintage TV",
    meta: "Douala · 22k",
    src: "/orbit/tv.jpg",
  },
  {
    label: "Flannels",
    meta: "Yaoundé · from 2k",
    src: "/orbit/hangers.jpg",
  },
] as const;

function HeroProductOrbit() {
  const count = ORBIT_PRODUCTS.length;

  return (
    <div className="hero-orbit" aria-hidden>
      <div className="hero-orbit-glow" />
      <div className="hero-orbit-path" />
      <div className="hero-orbit-ring">
        {ORBIT_PRODUCTS.map((product, index) => (
          <div
            key={product.label}
            className="hero-orbit-slot"
            style={
              {
                "--orbit-index": index,
                "--orbit-count": count,
              } as CSSProperties
            }
          >
            <div className="hero-orbit-spin">
              <div className="hero-orbit-card">
                <div className="relative h-[4.75rem] w-[4.75rem] overflow-hidden rounded-xl sm:h-20 sm:w-20">
                  <Image
                    src={product.src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="mt-1.5 max-w-[4.75rem] text-center">
                  <p className="truncate text-[10px] font-bold leading-tight text-white">
                    {product.label}
                  </p>
                  <p className="truncate text-[9px] text-white/65">{product.meta}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-orbit-core">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
          Pre-owned
        </p>
        <p className="mt-0.5 font-display text-sm font-bold text-white">
          Live deals
        </p>
      </div>
    </div>
  );
}

function HowSection() {
  return (
    <section
      id="how"
      className="relative z-10 scroll-mt-20 bg-canvas px-4 py-20 text-ink lg:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          How OfferBid works
        </h2>
        <p className="mt-3 max-w-2xl text-ink-secondary">
          Browse pre-owned listings, make a fair offer, then meet in person —
          no endless chat until a deal sticks.
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
                <item.icon className="h-5 w-5 text-primary" aria-hidden />
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
            Browse deals →
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeedSection({ compact }: { compact?: boolean }) {
  return (
    <section
      id="feed"
      className={
        compact
          ? "relative z-10"
          : "relative z-10 scroll-mt-20 border-b border-border bg-canvas px-4 py-20 text-ink lg:px-6"
      }
    >
      <div className={compact ? undefined : "mx-auto max-w-7xl"}>
        {compact ? (
          <PageHeader
            title="Live on the feed"
            description="Pre-owned listings across Cameroon."
            action={
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
              >
                See all deals →
              </Link>
            }
          />
        ) : (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Live on the feed
              </h2>
              <p className="mt-2 text-ink-secondary">
                Live pre-owned listings across Cameroon.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
            >
              See all deals →
            </Link>
          </div>
        )}
        <FeaturedDeals />
      </div>
    </section>
  );
}

export function LandingClient() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return (
      <AppShell>
        <FeedSection compact />
      </AppShell>
    );
  }

  return (
    <MarketingShell>
      <section className="ob-hero-surface relative isolate flex min-h-[calc(100dvh-4.5rem)] items-end overflow-hidden pb-16 pt-10 md:items-center md:pb-24">
        <div className="pointer-events-none absolute inset-0 z-[1] ob-grain" aria-hidden />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6 lg:px-6">
          <div className="relative z-20 max-w-2xl">
            <p className="hero-eyebrow animate-fade-rise mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                Live in Cameroon · Douala · Yaoundé · Buea · Limbe
              </span>
            </p>
            <h1 className="hero-title-3d animate-hero-in max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Buy &amp; sell pre-owned
            </h1>
            <p className="hero-subtitle-3d animate-hero-in-delay mt-5 max-w-xl text-base text-white/90 sm:text-lg">
              Find great second-hand products or give your unused items a new
              home. Meet in public, pay cash or MoMo, close on WhatsApp.
            </p>
            <div className="animate-fade-rise-delay-2 relative z-20 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/explore"
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-md bg-white px-6 text-sm font-bold text-ink transition hover:bg-white/90 sm:w-auto"
              >
                Browse deals
              </Link>
              <Link
                href="/auth?next=/sell"
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-md border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20 sm:w-auto"
              >
                Start selling
              </Link>
            </div>
          </div>

          <div className="pointer-events-none relative z-10 mx-auto flex h-[22rem] w-full max-w-md items-center justify-center sm:h-[26rem] lg:h-[30rem] lg:max-w-none">
            <HeroProductOrbit />
          </div>
        </div>
      </section>

      <FeedSection />
      <HowSection />
    </MarketingShell>
  );
}

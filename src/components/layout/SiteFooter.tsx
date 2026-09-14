"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/Brand";
import { useAuthStore } from "@/stores/authStore";

const product = [
  { href: "/explore", label: "Explore" },
  { href: "/second-hand", label: "Second-hand Cameroon" },
  { href: "/sell", label: "Start selling" },
  { href: "/#how", label: "How it works" },
];

const cities = [
  { href: "/second-hand/buea", label: "Buea" },
  { href: "/second-hand/douala", label: "Douala" },
  { href: "/second-hand/yaounde", label: "Yaoundé" },
  { href: "/second-hand/limbe", label: "Limbe" },
];

const trust = [
  { href: "/safety", label: "Safety" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

function FooterLinks({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-white/70">
        {title}
      </p>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-white/90 hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const user = useAuthStore((s) => s.user);
  const account = user
    ? [
        { href: "/profile", label: "Profile" },
        { href: "mailto:forwamba.achingale@ubuea.cm", label: "Contact" },
      ]
    : [
        { href: "/auth", label: "Log in" },
        { href: "mailto:forwamba.achingale@ubuea.cm", label: "Contact" },
      ];

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] lg:px-6">
        <div>
          <Wordmark href="/" light className="mb-3" />
          <p className="max-w-sm text-sm font-semibold leading-relaxed text-white">
            Cameroon’s second-hand marketplace.
          </p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-white/85">
            Buy and sell unused items in Buea, Douala, Yaoundé and Limbe. Make
            an offer, meet in public, pay cash or MoMo.
          </p>
          <p className="mt-3 text-xs font-semibold text-white/70">
            Cameroon first · Nigeria next
          </p>
        </div>
        <FooterLinks title="Product" items={product} />
        <FooterLinks title="Cities" items={cities} />
        <FooterLinks title="Trust" items={trust} />
        <FooterLinks title="Account" items={account} />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-8 text-xs text-white/70 lg:px-6">
        © {new Date().getFullYear()} OfferBid
      </div>
    </footer>
  );
}

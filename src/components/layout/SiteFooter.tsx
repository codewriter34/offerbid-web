import Link from "next/link";
import { Wordmark } from "@/components/brand/Brand";

const product = [
  { href: "/explore", label: "Explore" },
  { href: "/sell", label: "Start selling" },
  { href: "/#how", label: "How it works" },
  { href: "/#feed", label: "Live deals" },
];

const trust = [
  { href: "/safety", label: "Safety" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const account = [
  { href: "/auth", label: "Log in" },
  { href: "mailto:forwamba.achingale@ubuea.cm", label: "Contact" },
];

function FooterLinks({
  title,
  items,
  linkClass,
  headingClass,
}: {
  title: string;
  items: { href: string; label: string }[];
  linkClass: string;
  headingClass: string;
}) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wide ${headingClass}`}>
        {title}
      </p>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`inline-flex min-h-11 items-center text-sm font-semibold ${linkClass}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ light = false }: { light?: boolean }) {
  const headingClass = light ? "text-white/50" : "text-ink-muted";
  const linkClass = light
    ? "text-white/70 hover:text-white"
    : "text-ink-secondary hover:text-primary";

  return (
    <footer
      className={
        light
          ? "border-t border-white/10 bg-ink text-white/70"
          : "mt-16 border-t border-border bg-surface text-ink-muted"
      }
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] lg:px-6">
        <div>
          <Wordmark href="/" light={light} className="mb-3" />
          <p className="max-w-sm text-sm leading-relaxed">
            Unused gear nearby. Make a fair offer. Close on WhatsApp.
          </p>
          <p className={`mt-3 text-xs font-semibold ${headingClass}`}>
            Live in Buea · Lagos next
          </p>
        </div>
        <FooterLinks
          title="Product"
          items={product}
          linkClass={linkClass}
          headingClass={headingClass}
        />
        <FooterLinks
          title="Trust"
          items={trust}
          linkClass={linkClass}
          headingClass={headingClass}
        />
        <FooterLinks
          title="Account"
          items={account}
          linkClass={linkClass}
          headingClass={headingClass}
        />
      </div>
      <div
        className={`mx-auto max-w-7xl px-4 pb-8 text-xs lg:px-6 ${
          light ? "text-white/40" : "text-ink-muted"
        }`}
      >
        © {new Date().getFullYear()} OfferBid
      </div>
    </footer>
  );
}

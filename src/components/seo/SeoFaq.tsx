import { SITE_FAQS } from "@/lib/seo";

export function SeoFaq({
  title = "Second-hand shopping in Cameroon",
}: {
  title?: string;
}) {
  return (
    <section className="relative z-10 border-t border-border bg-surface px-4 py-16 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-ink-secondary">
          OfferBid is built so people searching for used items in Cameroon —
          laptops, phones, furniture, fashion — can find a real local listing
          and meet the seller in person.
        </p>
        <dl className="mt-10 grid gap-6 md:grid-cols-2">
          {SITE_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-md border border-border bg-canvas p-5"
            >
              <dt className="font-display text-lg font-bold text-ink">
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

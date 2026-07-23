export type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  items: readonly FaqItem[];
};

export function FaqSection({
  id,
  eyebrow = "Quick answers",
  title,
  intro,
  items,
}: FaqSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-6xl px-6 pb-24">
      <div className="lab-card p-6 sm:p-9">
        <p className="lab-label">{eyebrow}</p>
        <h2
          id={headingId}
          className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl"
        >
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {intro}
          </p>
        ) : null}

        <dl className="mt-7 grid gap-x-8 gap-y-0 md:grid-cols-2">
          {items.map((item) => (
            <div
              className="border-t border-[var(--border)] py-6"
              key={item.question}
            >
              <dt className="text-xl font-black tracking-[-0.025em]">
                {item.question}
              </dt>
              <dd className="mt-3 leading-7 text-[var(--muted)]">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

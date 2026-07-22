export const metadata = {
  title: "Terms",
  description:
    "Terms for using Nice Little Click Lab and its small web tools and products.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="lab-label">A very small rulebook</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em]">Terms</h1>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        Last updated July 22, 2026
      </p>

      <div className="mt-8 space-y-8 text-lg leading-8 text-[var(--muted)]">
        <div className="space-y-4">
          <p>
            These Terms govern your use of Nice Little Click Lab, a website and
            digital-product studio operated by Moore Family Print Shop LLC.
          </p>
          <p>
            By using the site or purchasing a product, you agree to these Terms.
            Please do not misuse the site, interfere with its operation, or try
            to access systems or information that are not intended for you.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Digital products</h2>
          <p className="mt-3">
            Paid Clicks are digital products delivered through the website. The
            Instant Custom Crossword Gift includes a personalized printable PDF
            and answer key generated from the words, clues, title, and other
            details you provide.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Your content</h2>
          <p className="mt-3">
            You are responsible for the content you enter. Please only submit
            material you have the right to use, and do not submit unlawful,
            harmful, or infringing content. You keep ownership of your original
            content and give us permission to process it only as needed to create
            and deliver your product.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Payments and delivery</h2>
          <p className="mt-3">
            Payments are processed securely by Stripe. Prices are shown before
            checkout. After a successful payment, your completed digital product
            is made available for download. You are responsible for saving your
            downloaded file.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Refunds</h2>
          <p className="mt-3">
            Because personalized digital products are generated and delivered
            immediately, purchases are generally final once the download is
            available. If a technical problem prevents you from receiving the
            product you purchased, contact us so we can make it right.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Personal use</h2>
          <p className="mt-3">
            Unless a product page says otherwise, purchased downloads are for
            personal, non-commercial use. You may print and share the finished
            gift with its intended recipient, but you may not resell, redistribute,
            or offer the files as your own product.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Availability</h2>
          <p className="mt-3">
            We aim to keep every Click working, but we cannot promise that the
            site will always be uninterrupted or error-free. Features, prices,
            and products may change as the Lab improves them.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Contact</h2>
          <p className="mt-3">
            Questions about a purchase or these Terms can be sent through the
            contact information provided on the site or on your Stripe receipt.
          </p>
        </div>
      </div>
    </section>
  );
}

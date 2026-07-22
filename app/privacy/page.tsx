export const metadata = {
  title: "Privacy",
  description:
    "How Nice Little Click Lab handles privacy, payments, hosting logs, and user information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="lab-label">The tiny-print version</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em]">Privacy</h1>
      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        Last updated July 22, 2026
      </p>

      <div className="mt-8 space-y-8 text-lg leading-8 text-[var(--muted)]">
        <div className="space-y-4">
          <p>
            Nice Little Click Lab is operated by Moore Family Print Shop LLC.
            This Privacy Policy explains what information is handled when you use
            the site or purchase a digital product.
          </p>
          <p>
            The Lab does not offer user accounts and is designed to collect as
            little personal information as possible.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Information you enter</h2>
          <p className="mt-3">
            Some Clicks ask you to enter information to create a result. For the
            Instant Custom Crossword Gift, that can include a puzzle title,
            answers, clues, and optional gift details. This information is sent
            to the site only when needed to begin checkout, verify the purchase,
            and generate the PDF. It is not used to create a public profile.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Payments</h2>
          <p className="mt-3">
            Payments are processed by Stripe. Stripe receives the payment and
            contact information needed to complete the transaction, prevent
            fraud, issue receipts, and support refunds. Nice Little Click Lab
            does not receive or store your full card number.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Hosting and technical data</h2>
          <p className="mt-3">
            The site is hosted by Netlify, which may process basic technical
            information such as IP addresses, browser details, device information,
            and request logs to deliver, secure, and maintain the site.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">How information is used</h2>
          <p className="mt-3">
            Information is used to operate the site, generate the product you
            requested, verify payment, prevent abuse, troubleshoot problems, and
            respond to customer support requests. We do not sell personal
            information.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Retention</h2>
          <p className="mt-3">
            The site does not intentionally maintain user profiles or a library
            of saved crossword content. Stripe retains transaction records under
            its own policies. Hosting and security logs may also be retained by
            service providers for limited operational purposes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Your choices</h2>
          <p className="mt-3">
            Avoid entering sensitive personal information into a Click. Questions
            about your information or a purchase can be sent through the contact
            information provided on the site or on your Stripe receipt.
          </p>
        </div>
      </div>
    </section>
  );
}

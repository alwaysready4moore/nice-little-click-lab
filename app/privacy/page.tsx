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
        Last updated August 1, 2026
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
          <h2 className="text-2xl font-bold text-[var(--ink)]">AI use</h2>
          <p className="mt-3">
            AI tools may be used to help design, write, or develop the Nice Little
            Click Lab website. The Clicks themselves do not send the information
            you enter to an AI model or AI service. For example, the Instant
            Custom Crossword Gift and Custom Word Search Gift use programmed
            puzzle-generation logic rather than generative AI. Should This Have
            Been an Email? calculates its verdict locally from the answers you
            select.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Information you enter</h2>
          <p className="mt-3">
            Some Clicks ask you to enter information to create a result. The
            personalized puzzle builders may use a title, answers, clues, word
            lists, difficulty choices, and optional gift details. A paid-puzzle
            draft is stored temporarily in your browser using session storage so
            it can survive the trip to Stripe Checkout and return for download.
            The information is also processed by the site only when needed to
            begin checkout, verify the purchase, and generate the PDF. Free Click
            answers, including the meeting-test selections, stay in the current
            browser session. None of this information is used to create a public
            profile or sent to an AI service.
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
            The site does not intentionally maintain user profiles or a
            retrievable library of saved personalized puzzle content. Browser session data
            can disappear when the session ends, storage is cleared, or another
            device or browser is used. Stripe retains transaction records under
            its own policies. Hosting and security logs may also be retained by
            service providers for limited operational purposes.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Saving purchased files</h2>
          <p className="mt-3">
            Downloaded products are not stored in a customer account or purchase
            library. Please save purchased files somewhere you control and back
            them up. We may be able to verify a Stripe payment, but we generally
            cannot recover or recreate the exact personalized product after the
            browser-held details are gone.
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

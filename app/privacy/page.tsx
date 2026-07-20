export const metadata = {
  title: "Privacy",
  description:
    "How Nice Little Click Lab handles privacy, hosting logs, and user information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="lab-label">The tiny-print version</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em]">Privacy</h1>
      <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--muted)]">
        <p>Nice Little Click Lab does not currently offer accounts, forms, payments, or saved user profiles.</p>
        <p>The site is hosted by Netlify, which may process basic technical information such as IP addresses, browser details, and request logs to deliver and protect the site.</p>
        <p>Future Clicks will be designed to collect as little information as possible. This page will be updated before any feature begins collecting personal information or accepting payment.</p>
      </div>
    </section>
  );
}

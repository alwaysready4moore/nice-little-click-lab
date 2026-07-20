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
      <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--muted)]">
        <p>Nice Little Click Lab is currently a preview of tools and products still in development.</p>
        <p>Content is provided for general information and enjoyment. Please do not misuse the site, interfere with its operation, or attempt to access systems or information that are not intended for you.</p>
        <p>Product-specific purchase, download, refund, and usage terms will be added before paid Clicks become available.</p>
      </div>
    </section>
  );
}

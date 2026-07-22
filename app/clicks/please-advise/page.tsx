import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Please Advise — Coming Soon | Nice Little Click Lab",
  description:
    "Please Advise is still being polished in the Nice Little Click Lab.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PleaseAdvisePage() {
  return (
    <section className="mx-auto flex min-h-[68vh] max-w-4xl items-center px-6 py-20">
      <article className="paper-grid lab-card relative w-full overflow-hidden p-8 text-center sm:p-12">
        <p className="lab-label">CLICK NO. 003 · STILL IN THE LAB</p>

        <h1 className="lab-heading mt-5 text-6xl sm:text-7xl">Please Advise</h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
          The inbox is full. The consequences are fictional. The game is still
          getting one last polish before anyone is allowed near Reply All.
        </p>

        <p className="font-handwritten mt-7 text-2xl text-[var(--accent-strong)]">
          Coming soon. Please continue pretending you never saw the email.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/clicks" className="lab-button lab-button-primary">
            See the available Clicks
          </Link>
          <Link href="/" className="lab-button lab-button-secondary">
            Back to the Lab
          </Link>
        </div>
      </article>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact the Lab",
  description:
    "Questions, ideas, and tiny emergencies for Nice Little Click Lab.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="lab-label">The lab hatch</p>
      <h1 className="lab-heading mt-4 text-[clamp(3.8rem,9vw,7rem)]">
        Questions, ideas, or tiny emergencies?
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Click is usually busy testing something, reorganizing the workbench, or
        sleeping directly beside the most important piece of equipment.
      </p>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Nice Little Click Lab is proudly operated by Moore Family Print Shop
        LLC. Questions, feedback, bug reports, or a simple hello are all welcome.
      </p>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        For now, the best way to explore the Lab is to try a Click and see what
        is currently on the workbench.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="lab-button lab-button-primary"
          href="/clicks/custom-crossword"
        >
          Make a custom crossword
        </Link>
        <Link className="lab-button lab-button-secondary" href="/clicks">
          See all Clicks
        </Link>
      </div>
    </section>
  );
}

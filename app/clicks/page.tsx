import Image from "next/image";
import Link from "next/link";
import { ClickCard } from "@/components/clicks/ClickCard";
import { clicks } from "@/data/clicks";

export const metadata = {
  title: "Clicks",
};

export default function ClicksPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <section>
        <p className="lab-label">From the Lab</p>

        <h1 className="lab-heading mt-3 text-7xl sm:text-8xl">All the Clicks.</h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Small tools, games, and gifts with one clear job and no unnecessary
          nonsense.
        </p>

        <p className="font-handwritten mt-4 text-xl text-[var(--accent-strong)]">
          The shelf is small on purpose. Good things are being made.
        </p>
      </section>

      <section className="lab-card mt-10 overflow-hidden p-0" aria-labelledby="meet-click-title">
        <div className="grid items-center gap-0 md:grid-cols-[0.78fr_1.22fr]">
          <div className="paper-grid flex min-h-72 items-center justify-center border-b border-[var(--border)] p-7 md:min-h-full md:border-b-0 md:border-r">
            <Image
              src="/images/click/02-icon-avatar.png"
              alt="Click, the golden puppy lab assistant, wearing teal goggles and a cursor-shaped collar tag"
              width={500}
              height={400}
              className="h-auto w-full max-w-sm"
              priority
            />
          </div>

          <div className="p-7 sm:p-10">
            <p className="lab-label">Unofficial lab assistant</p>
            <h2 id="meet-click-title" className="lab-heading mt-3 text-5xl sm:text-6xl">
              Meet Click!
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Click is the Lab&apos;s endlessly curious golden helper. He researches tiny
              problems, supervises experiments, delivers finished Clicks, and occasionally
              falls asleep under a lab coat mid-shift.
            </p>
            <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
              The teal goggles mean he is thinking. The cursor-shaped tag means he is ready
              to click. The confidence is entirely his own.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4"
            >
              Meet the rest of the Lab →
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="Available and upcoming Clicks">
        {clicks.map((click) => (
          <ClickCard key={click.slug} click={click} />
        ))}
      </section>
    </div>
  );
}

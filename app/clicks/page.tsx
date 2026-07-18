import { ClickCard } from "@/components/clicks/ClickCard";
import { clicks } from "@/data/clicks";

export const metadata = {
  title: "Clicks",
};

export default function ClicksPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="lab-label">From the Lab</p>

      <h1 className="lab-heading mt-3 text-7xl sm:text-8xl">All the Clicks.</h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        Small tools, games, and gifts with one clear job and no unnecessary
        nonsense.
      </p>

      <p className="font-handwritten mt-4 text-xl text-[var(--accent-strong)]">
        The shelf is small on purpose. Good things are being made.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {clicks.map((click) => (
          <ClickCard key={click.slug} click={click} />
        ))}
      </div>
    </section>
  );
}

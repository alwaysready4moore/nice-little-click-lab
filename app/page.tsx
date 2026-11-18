import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductPreview } from "@/components/clicks/ProductPreview";
import { clicks } from "@/data/clicks";

export const metadata: Metadata = {
  title: {
    absolute:
      "Tiny Web Tools, Games, and Personalized Gifts | Nice Little Click Lab",
  },
  description:
    "Make a custom seating chart, try free browser tools and games, or create a personalized puzzle gift.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tiny Web Tools, Games, and Personalized Gifts",
    description:
      "Free browser tools, tiny games, and personalized digital gifts from Nice Little Click Lab.",
    url: "/",
    type: "website",
    images: ["/images/social/nice-little-click-lab-og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiny Web Tools, Games, and Personalized Gifts",
    description:
      "Free browser tools, tiny games, and personalized digital gifts for oddly specific moments.",
    images: ["/images/social/nice-little-click-lab-og.png"],
  },
};

const shelfChoices = [
  { slug: "meeting-cost-ticker", kind: "Useful", motif: "$00.00" },
  { slug: "please-advise", kind: "Playful", motif: "RE: ALL" },
  { slug: "should-have-been-an-email", kind: "Quick verdict", motif: "YES / NO" },
] as const;

const shelfClicks = shelfChoices.flatMap((choice) => {
  const click = clicks.find((item) => item.slug === choice.slug && item.status === "live");
  return click ? [{ ...choice, click }] : [];
});

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-9 px-6 pb-12 pt-9 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pb-14 lg:pt-12">
        <div>
          <p className="lab-label">GOOD LITTLE THINGS FOR THE INTERNET</p>
          <h1 className="mt-6 max-w-2xl text-[clamp(2.65rem,4.5vw,4.4rem)] font-black leading-[0.88] tracking-[-0.065em]">
            Tiny web tools for{" "}
            <span className="hero-script lab-script block pt-3 font-normal">
              oddly specific moments.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Nice Little Click Lab makes small, useful tools, games, and gifts
            that do one thing well. No account. No clutter. Just something
            delightful that works.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/clicks/take-your-seat"
              className="lab-button lab-button-primary"
            >
              Make a seating chart
            </Link>
            <Link href="/clicks" className="lab-button lab-button-secondary">
              Browse all tools
            </Link>
          </div>
        </div>

        <div className="relative lg:pl-6">
          <div className="folder-stack" aria-hidden="true" />
          <article className="paper-grid relative z-10 overflow-hidden rounded-[1.15rem] border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[0_30px_65px_rgba(75,50,20,0.16)] sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <p className="lab-label">FRESH FROM THE LAB</p>
              <span className="stamp-mark">click</span>
            </div>
            <div className="grid gap-6 py-7 sm:grid-cols-[7.5rem_1fr] sm:items-center">
              <div className="rounded-md border border-[var(--accent-strong)] bg-white/60 p-4 text-center">
                <p className="text-[0.72rem] font-extrabold tracking-[0.18em] text-[var(--accent-strong)]">
                  CLICK NO.
                </p>
                <p className="mt-1 text-5xl font-black text-[var(--accent-strong)]">
                  008
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  Take Your Seat
                </h2>
                <p className="mt-3 text-lg leading-7 text-[var(--muted)]">
                  Wedding tables or classroom desks. Make room for everyone, then put their name on it.
                </p>
              </div>
            </div>
            <ProductPreview slug="take-your-seat" />
            <div className="grid gap-5 border-t border-[var(--border)] pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="lab-label">FREE · NO SIGN-UP</p>
                <p className="mt-3 max-w-md font-mono text-sm leading-6">
                  Arrange your room, add your people, and give everyone a seat.
                  Save your project or print the finished chart.
                </p>
              </div>
              <Link
                href="/clicks/take-your-seat"
                className="lab-button lab-button-primary"
              >
                Take your seat
              </Link>
            </div>
          </article>
          <div className="sticky-note absolute -right-2 -top-7 z-20 rotate-3">
            new click!
            <br />
            no peeking!
          </div>
          <div className="click-supervisor">
            <Image
              src="/images/click/click-sleeping-labcoat.webp"
              alt="Click sleeping under a tiny lab coat"
              width={360}
              height={240}
              priority
            />
          </div>
          <p className="font-handwritten ml-auto -mt-3 max-w-xs rotate-1 text-xl text-[var(--accent-strong)]">
            supervised by one sleepy lab assistant.
          </p>
        </div>
      </section>

      <section aria-labelledby="more-from-lab" className="mx-auto max-w-6xl px-6 pb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="lab-label">A FEW MORE FROM THE LAB</p>
            <h2 id="more-from-lab" className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Pick your particular problem.
            </h2>
          </div>
          <Link href="/clicks" className="font-bold text-[var(--accent-strong)] hover:underline">
            Browse every Click →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelfClicks.map(({ click, kind, motif }) => (
            <Link
              key={click.slug}
              href={`/clicks/${click.slug}`}
              className="lab-card group flex h-full flex-col gap-3 p-5 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-strong)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span aria-hidden="true" className="flex min-h-12 items-center rounded-lg border border-[var(--border-strong)] bg-[var(--accent-soft)] px-3 font-mono text-sm font-black text-[var(--accent-strong)]">
                  {motif}
                </span>
                <span className="rounded-full border border-[var(--border)] bg-white/65 px-3 py-1 text-xs font-semibold">
                  {click.priceLabel}
                </span>
              </div>
              <p className="lab-label">{kind} · CLICK NO. {String(click.number).padStart(3, "0")}</p>
              <h3 className="text-xl font-black tracking-[-0.03em]">{click.name}</h3>
              <p className="leading-6 text-[var(--muted)]">{click.shortDescription}</p>
              <p className="mt-auto pt-1 font-bold text-[var(--accent-strong)] group-hover:underline">
                {click.actionLabel} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="what-is-a-click"
        className="mx-auto grid max-w-6xl scroll-mt-28 gap-6 px-6 pb-20 md:grid-cols-[0.95fr_1.05fr]"
      >
        <article className="lab-card p-7 sm:p-9">
          <p className="click-definition-label lab-label">WHAT IS A CLICK?</p>
          <h2 className="click-definition-title mt-4 font-black tracking-[-0.045em]">
            One useful little thing.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--muted)]">
            “Click” is our name for a tiny, focused web product. It might solve
            a small problem, make a thoughtful gift, or improve one mildly
            ridiculous moment. Each Click is quick to understand and made to do
            one job well.
          </p>
          <Link
            href="/clicks"
            className="mt-6 inline-flex font-bold text-[var(--accent-strong)] hover:underline"
          >
            See all the Clicks →
          </Link>
        </article>

        <article className="next-card relative overflow-hidden rounded-[1.4rem] border border-[#e3c783] p-7 sm:p-9">
          <p className="lab-label">NEW GIFT CLICK</p>
          <h2 className="click-definition-title mt-4 font-black tracking-[-0.045em]">
            Custom Word Search Gift
          </h2>
          <p className="mt-4 max-w-lg leading-7 text-[var(--muted)]">
            Hide names, memories, favorite things, and private jokes in a
            personalized printable puzzle.
          </p>
          <Link
            href="/clicks/custom-word-search"
            className="lab-button lab-button-primary mt-6"
          >
            Make a word search for $3
          </Link>
          <ProductPreview slug="custom-word-search" />
        </article>
      </section>

      <section className="border-t border-dashed border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-handwritten text-2xl text-[var(--accent-strong)]">
            No dashboards. No twelve-step onboarding. Just a nice little click.
          </p>
          <Link href="/about" className="font-bold">
            Meet the Lab →
          </Link>
        </div>
      </section>
    </>
  );
}

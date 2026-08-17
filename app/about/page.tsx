import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbStructuredData, organizationId } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Lab",
  description:
    "Learn how Nice Little Click Lab makes small, focused web tools, games, and personalized gifts without accounts, clutter, or bloated software.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Nice Little Click Lab",
    description:
      "A small web-product studio making useful, playful internet things for oddly specific moments.",
    url: "/about",
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Nice Little Click Lab",
    description:
      "A small web-product studio making useful, playful internet things for oddly specific moments.",
    images: [siteConfig.socialImage],
  },
};

const aboutStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      name: "About Nice Little Click Lab",
      url: `${siteConfig.url}/about`,
      description:
        "How Nice Little Click Lab designs small web tools, games, and personalized digital gifts.",
      about: { "@id": organizationId },
      isPartOf: { "@id": `${siteConfig.url}/#website` },
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ],
};

const clickPrinciples = [
  "Does one thing clearly",
  "Works without an account whenever possible",
  "Feels good on a phone",
  "Collects only what it genuinely needs",
  "Includes one thoughtful or delightful detail",
  "Stops growing before it becomes bloated software",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutStructuredData} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-20">
      <section className="max-w-4xl">
        <p className="lab-label">About the Lab</p>

        <h1 className="lab-heading mt-4 text-[clamp(3.8rem,9vw,7.5rem)]">
          Small ideas, properly made.
        </h1>

        <p className="font-handwritten mt-5 max-w-3xl rotate-[-1deg] text-3xl leading-tight text-[var(--accent-strong)] sm:text-4xl">
          Pleasantly unnecessary counts as necessary around here.
        </p>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
          Nice Little Click Lab is the digital-product studio of Moore Family
          Print Shop LLC. We make useful, playful internet things for oddly
          specific moments. Some Clicks solve small annoyances. Some make
          thoughtful gifts. Some simply began with, “Someone should make that.”
        </p>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <article className="lab-card p-7 sm:p-9">
          <p className="lab-label">What we make</p>
          <h2 className="lab-heading mt-3 text-4xl sm:text-5xl">
            Good little things for the internet.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Every Click should be quick to understand, pleasant to use, and
            useful within a few taps. No giant platform hiding inside a tiny
            idea. No account just because accounts exist.
          </p>
        </article>

        <article className="lab-card p-7 sm:p-9">
          <p className="lab-label">Why the Lab exists</p>
          <h2 className="lab-heading mt-3 text-4xl sm:text-5xl">
            Tiny ideas deserve a proper finish.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            The internet has plenty of enormous software. The Lab is interested
            in smaller things: a useful calculator, a personalized gift, a
            strangely specific problem solved cleanly, and the occasional detail
            that makes someone smile.
          </p>
        </article>
      </section>

      <section className="mt-16 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="lab-label">The Click test</p>
          <h2 className="lab-heading mt-3 text-5xl sm:text-6xl">
            What makes something a Click?
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            A Click earns its place on the workbench by staying focused,
            considerate, and finished.
          </p>
        </div>

        <div className="lab-card grid gap-0 overflow-hidden sm:grid-cols-2">
          {clickPrinciples.map((principle, index) => (
            <div
              className="flex min-h-28 items-start gap-4 border-b border-[var(--border)] p-6 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
              key={principle}
            >
              <span className="font-display text-2xl text-[var(--accent-strong)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="pt-1 font-semibold leading-6">{principle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="lab-label">On the workbench</p>
            <h2 className="lab-heading mt-3 text-5xl sm:text-6xl">
              One Click at a time.
            </h2>
          </div>
          <Link className="lab-button lab-button-secondary" href="/clicks">
            See all Clicks
          </Link>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <article className="lab-card p-7 sm:p-8">
            <p className="click-number">Fresh from the Lab</p>
            <h3 className="lab-heading mt-5 text-4xl">
              Should This Have Been an Email?
            </h3>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Answer seven questions and let Click issue a calendar verdict.
            </p>
            <Link
              className="mt-6 inline-flex font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4"
              href="/clicks/should-have-been-an-email"
            >
              Try the newest Click
            </Link>
          </article>

          <article className="lab-card p-7 sm:p-8">
            <p className="click-number">Newest gift</p>
            <h3 className="lab-heading mt-5 text-4xl">
              Custom Word Search Gift
            </h3>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Hide names, memories, and favorite things in a printable personalized puzzle.
            </p>
            <Link
              className="mt-6 inline-flex font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4"
              href="/clicks/custom-word-search"
            >
              Make a word search
            </Link>
          </article>
        </div>
      </section>

      <section className="lab-card mt-16 p-7 sm:p-9">
        <p className="lab-label">A small studio with a real home</p>
        <h2 className="lab-heading mt-3 text-4xl sm:text-5xl">
          Part of Moore Family Print Shop LLC.
        </h2>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-[var(--muted)]">
          Nice Little Click Lab is the digital-product studio of Moore Family
          Print Shop LLC. The print shop makes physical gifts and creative
          goods. The Lab makes tiny digital experiences: focused tools, games,
          and personalized downloads with a little personality built in.
        </p>
      </section>

      <section
        id="meet-click"
        className="lab-card relative mt-16 overflow-hidden p-7 sm:p-10"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--accent-soft)] opacity-60" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div className="max-w-4xl">
            <p className="lab-label">Behind the workbench</p>
            <h2 className="lab-heading mt-3 text-5xl sm:text-6xl">
              Run by Click. Supervised loosely.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              Click is the Lab’s resident tinkerer, keeper of tiny useful
              things, and extremely unofficial head of quality control. He
              builds Clicks for oddly specific moments, tests them thoroughly,
              and maintains a very high standard for coziness.
            </p>
            <p className="lab-note mt-6">
              Current duties: building, testing, napping near important equipment.
            </p>
          </div>

          <div className="mx-auto w-full max-w-[18rem] rounded-[1.5rem] border border-[var(--border)] bg-white/55 p-5 shadow-[0_20px_45px_rgba(75,50,20,0.12)]">
            <Image
              src="/images/click/Click-Profile.webp"
              alt="Click, the golden retriever lab assistant"
              width={560}
              height={560}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="mt-16 text-center">
        <p className="font-handwritten text-3xl text-[var(--accent-strong)] sm:text-4xl">
          Good little things for the internet.
        </p>
        <p className="mt-3 text-[var(--muted)]">
          Made with curiosity. Built without bloat.
        </p>
      </section>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  formatGuideDate,
  guidePath,
  guides,
  guidesUpdatedAt,
  priceDollars,
  requireClick,
} from "@/data/guides";
import {
  breadcrumbStructuredData,
  socialMetadata,
  websiteId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const crossword = requireClick("custom-crossword");
const wordSearch = requireClick("custom-word-search");
const splitter = requireClick("gift-budget-splitter");
const seating = requireClick("take-your-seat");

const pagePath = "/guides";
const title = "Guides for Gifts, Secret Santa, and Seating";
const description =
  "Practical notes from Nice Little Click Lab on personalized gifts under $5, a fair Secret Santa split, and a holiday dinner seating chart.";

export const metadata: Metadata = socialMetadata({
  title,
  description,
  path: pagePath,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: title,
      description,
      url: `${siteConfig.url}${pagePath}`,
      inLanguage: siteConfig.locale,
      isPartOf: { "@id": websiteId },
      dateModified: guidesUpdatedAt,
      about: [
        { "@type": "Thing", name: crossword.name, url: `${siteConfig.url}/clicks/${crossword.slug}` },
        { "@type": "Thing", name: wordSearch.name, url: `${siteConfig.url}/clicks/${wordSearch.slug}` },
        { "@type": "Thing", name: splitter.name, url: `${siteConfig.url}/clicks/${splitter.slug}` },
        { "@type": "Thing", name: seating.name, url: `${siteConfig.url}/clicks/${seating.slug}` },
      ],
    },
    {
      "@type": "ItemList",
      name: "Nice Little Click Lab guides",
      numberOfItems: guides.length,
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: `${siteConfig.url}${guidePath(guide.slug)}`,
        description: guide.description,
      })),
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Guides", path: pagePath },
    ]),
  ],
};

export default function GuidesIndexPage() {
  const crosswordPrice = priceDollars(crossword);
  const wordSearchPrice = priceDollars(wordSearch);

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-20">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="underline decoration-1 underline-offset-4">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Guides</li>
          </ol>
        </nav>

        <p className="lab-label mt-8">From the workbench</p>
        <h1 className="lab-heading mt-3 max-w-4xl text-[clamp(3rem,7vw,5.6rem)]">
          Guides for the oddly specific parts.
        </h1>
        <p className="font-handwritten mt-4 max-w-2xl text-3xl leading-tight text-[var(--accent-strong)]">
          The shelf is small. The advice can be, too.
        </p>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          {siteConfig.name} is the digital studio of {siteConfig.operator}. A
          Click does one job. A guide on this page explains the occasion around
          that job: what to decide before you open the tool, which limits are
          real, and when a different Click is the better next step. Prices
          below are the ones on the Clicks themselves. Updated{" "}
          <time dateTime={guidesUpdatedAt}>{formatGuideDate(guidesUpdatedAt)}</time>.
        </p>

        <div className="mt-12 grid gap-6">
          {guides.map((guide) => (
            <article key={guide.slug} className="lab-card p-7 sm:p-8">
              <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                <Link href={guidePath(guide.slug)} className="underline decoration-1 underline-offset-4">
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                {guide.summary}
              </p>
              <Link
                href={guidePath(guide.slug)}
                className="mt-5 inline-flex font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4"
              >
                Read the guide
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-16 max-w-3xl" aria-labelledby="which-guide">
          <h2 id="which-guide" className="text-3xl font-black tracking-[-0.04em]">
            Which note to open
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            You need a present and the budget is tiny. Start with{" "}
            <Link href={guidePath("personalized-gifts-under-5")} className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              personalized digital gifts under $5
            </Link>
            . {crossword.name} is {crossword.priceLabel}. {wordSearch.name} is{" "}
            {wordSearch.priceLabel}.
            {crosswordPrice > 0 &&
            crosswordPrice < 5 &&
            wordSearchPrice > 0 &&
            wordSearchPrice < 5
              ? " Each of those prices sits under $5."
              : ""}{" "}
            The guide also points at the free Clicks that can ride along in the
            same card, and it says what those Clicks do so a joke stays a joke.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            You got stuck organizing the exchange. Open{" "}
            <Link href={guidePath("secret-santa-budget")} className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              the Secret Santa guide
            </Link>{" "}
            and then{" "}
            <Link href={`/clicks/${splitter.slug}`} className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              {splitter.name}
            </Link>
            , which is {splitter.priceLabel}. One total goes in. Shares come
            out. The names still get drawn in a hat, or whatever your group
            will not lose. The guide shows the share weights with a{" "}
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(100)}{" "}
            illustration, labeled as an illustration, so the math is visible
            before anyone argues about it.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            You are hosting, and the group text is already full of opinions
            about chairs. Read{" "}
            <Link href={guidePath("holiday-seating-chart")} className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              the holiday seating guide
            </Link>
            , then make the chart in{" "}
            <Link href={`/clicks/${seating.slug}`} className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              {seating.name}
            </Link>
            . It is {seating.priceLabel}. The drawing can start from wedding
            tables, classroom desks, or a blank room. It will not measure your
            hallway, and it will not assign seats for you. That honesty is the
            useful part.
          </p>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="bring-with-you">
          <h2 id="bring-with-you" className="text-3xl font-black tracking-[-0.04em]">
            What to have in front of you
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            For a puzzle gift, bring a list of words you would actually say out
            loud to that person. The crossword wants a clue beside each answer,
            between 8 and 15 pairs. The word search wants 10 to 30 words. Titles
            can run to 60 characters and a dedication to 100. You can load an
            example inside either maker, then replace it. Pay only after the
            watermarked preview looks right, and save the PDF when it arrives.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            For Secret Santa, bring one agreed total and the names of the people
            who are actually playing. {splitter.name} accepts up to 30 people
            and a budget up to $100,000, with a reserve of 0%, 5%, or 10%. Equal
            gift sizes produce equal shares. Copy or print the plan before you
            close the tab, then draw names somewhere else. The{" "}
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(100)}{" "}
            figures in that guide are there to show the weights, and your pot
            can be a completely different number.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            For the dinner, walk the room first. Then open {seating.name} and
            start from the wedding layout, the classroom layout, or a blank
            room. Add the people who are coming, leave a chair if you can, and
            save the project file. There is no automatic save. The chart is a
            diagram you can print, and the overlap warning is about that
            diagram. It is still worth standing in the doorway yourself.
          </p>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="shared-habits">
          <h2 id="shared-habits" className="text-3xl font-black tracking-[-0.04em]">
            Habits the Clicks share
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            None of these asks you to create an account. The free tools keep
            what you type in the browser, and closing the tab is the same as
            leaving, unless you copied, printed, or saved a file. The paid
            puzzles are one-time downloads. Preview them before checkout, then
            keep the PDF, because the Lab does not run a puzzle library.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            The guides describe the Clicks that exist today. If a page names a
            price, a seat count, or a file you can save, that detail comes from
            the Click itself. A guide will not invent a star rating or a
            feature the workbench does not have. When the occasion
            is over, the Click is still the thing you open: the puzzle makers
            for a gift, the splitter for a cap, and the seating chart for a
            room. When you want the full shelf, it is{" "}
            <Link href="/clicks" className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              on the Clicks page
            </Link>
            . When you want the longer story of the studio, it is{" "}
            <Link href="/about" className="font-bold text-[var(--accent-strong)] underline decoration-1 underline-offset-4">
              on the about page
            </Link>
            .
          </p>
          <p className="font-handwritten mt-8 text-2xl text-[var(--accent-strong)]">
            Good little things for the internet. Notes included.
          </p>
        </section>
      </div>
    </>
  );
}

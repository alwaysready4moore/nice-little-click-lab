import { clicks, type Click } from "@/data/clicks";

export const guidesUpdatedAt = "2026-11-08";

export function requireClick(slug: string): Click {
  const click = clicks.find((item) => item.slug === slug);
  if (!click) {
    throw new Error(`Unknown Click slug: ${slug}`);
  }
  return click;
}

export function priceDollars(click: Click): number {
  if (click.priceLabel === "Free") return 0;
  const amount = Number(click.priceLabel.replace(/^\$/, ""));
  if (!Number.isFinite(amount)) {
    throw new Error(`Unparsed price for ${click.slug}: ${click.priceLabel}`);
  }
  return amount;
}

export function assertFree(click: Click) {
  if (click.priceLabel !== "Free") {
    throw new Error(`${click.name} is ${click.priceLabel}; guide copy calls it free.`);
  }
}

export function assertPricedUnderFive(click: Click) {
  const amount = priceDollars(click);
  if (!(amount > 0 && amount < 5)) {
    throw new Error(
      `${click.name} is ${click.priceLabel}; this guide describes it as a gift under $5.`,
    );
  }
}

const crossword = requireClick("custom-crossword");
const wordSearch = requireClick("custom-word-search");
assertPricedUnderFive(crossword);
assertPricedUnderFive(wordSearch);

export const guides = [
  {
    slug: "personalized-gifts-under-5",
    title: "Personalized Digital Gifts Under $5",
    description: `Make a ${crossword.priceLabel} custom crossword or a ${wordSearch.priceLabel} word search from names and memories you already have. Preview before you pay, then print. Free Clicks can ride along.`,
    summary: `A printable crossword at ${crossword.priceLabel} and a word search at ${wordSearch.priceLabel}, plus free Clicks that can travel in the same card.`,
    updatedAt: guidesUpdatedAt,
  },
  {
    slug: "secret-santa-budget",
    title: "How to Plan a Stress-Free Secret Santa (and Split the Budget Fairly)",
    description:
      "Set one Secret Santa cap, then split it in Gift Budget Splitter. Equal shares stay equal, mixed sizes rebalance, and the list stays in your browser.",
    summary:
      "One total, a share for every person, and a cushion you choose. Gift Budget Splitter does the division. You still draw the names.",
    updatedAt: guidesUpdatedAt,
  },
  {
    slug: "holiday-seating-chart",
    title: "How to Make a Holiday Dinner Seating Chart Without the Drama",
    description:
      "Arrange holiday dinner tables in Take Your Seat, assign every name a chair, and print the chart. Free, kept in your browser, and honest about being a diagram.",
    summary:
      "A free diagram for the dinner you are actually hosting: tables, names, seats, and a chart you can print. The feelings stay your department.",
    updatedAt: guidesUpdatedAt,
  },
] as const;

export type GuideEntry = (typeof guides)[number];
export type GuideSlug = GuideEntry["slug"];

export function guidePath(slug: GuideSlug | "") {
  return slug ? `/guides/${slug}` : "/guides";
}

export function guideBySlug(slug: GuideSlug) {
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) throw new Error(`Unknown guide: ${slug}`);
  return guide;
}

export function formatGuideDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

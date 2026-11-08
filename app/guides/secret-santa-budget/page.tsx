import Link from "next/link";
import { ClickMention } from "@/components/guides/ClickMention";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  assertFree,
  assertPricedUnderFive,
  guideBySlug,
  guidePath,
  requireClick,
} from "@/data/guides";
import {
  allocateGiftBudget,
  formatGiftMoney,
  GIFT_TIERS,
  type GiftPerson,
  type GiftPlan,
} from "@/lib/gift-budget";
import {
  articleStructuredData,
  breadcrumbStructuredData,
  howToStructuredData,
  socialMetadata,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const guide = guideBySlug("secret-santa-budget");
const splitter = requireClick("gift-budget-splitter");
const crossword = requireClick("custom-crossword");
const wordSearch = requireClick("custom-word-search");
assertFree(splitter);
assertPricedUnderFive(crossword);
assertPricedUnderFive(wordSearch);

const illustrationCents = 10_000;
const evenPeople: GiftPerson[] = [
  { id: "alex", name: "Alex", tier: "regular" },
  { id: "blake", name: "Blake", tier: "regular" },
  { id: "casey", name: "Casey", tier: "regular" },
  { id: "drew", name: "Drew", tier: "regular" },
];
const mixedPeople: GiftPerson[] = [
  { id: "alex", name: "Alex", tier: "big" },
  { id: "blake", name: "Blake", tier: "regular" },
  { id: "casey", name: "Casey", tier: "regular" },
  { id: "drew", name: "Drew", tier: "little" },
];

function assertBalanced(plan: GiftPlan) {
  const gifts = plan.allocations.reduce((sum, item) => sum + item.amountCents, 0);
  if (gifts + plan.reserveCents !== plan.totalCents || plan.unassignedCents !== 0) {
    throw new Error("Secret Santa illustration did not use the full budget.");
  }
}

const evenPlan = allocateGiftBudget(illustrationCents, 0, evenPeople);
const mixedPlan = allocateGiftBudget(illustrationCents, 0, mixedPeople);
const cushionedPlan = allocateGiftBudget(illustrationCents, 10, mixedPeople);
for (const plan of [evenPlan, mixedPlan, cushionedPlan]) assertBalanced(plan);

const evenAmount = evenPlan.allocations[0]?.amountCents;
if (
  evenAmount === undefined ||
  evenPlan.allocations.some((person) => person.amountCents !== evenAmount)
) {
  throw new Error("Equal Secret Santa shares did not match; update the illustration.");
}

const steps = [
  {
    id: "write-the-rules",
    name: "Write the cap, the guest list, and the kind of gift",
    text: "Agree on one number, who is playing, and what a gift is allowed to be before any names go into a hat.",
  },
  {
    id: "enter-the-total",
    name: "Put one total into Gift Budget Splitter",
    text: `${splitter.name} divides the budget you type. It does not add a surprise on top, and the largest total it accepts is $100,000.`,
  },
  {
    id: "same-size",
    name: "Give everyone the same share unless the group already agreed otherwise",
    text: `${GIFT_TIERS.little.label} is ${GIFT_TIERS.little.weight} share, ${GIFT_TIERS.regular.label.toLowerCase()} is ${GIFT_TIERS.regular.weight} shares, and ${GIFT_TIERS.big.label.toLowerCase()} is ${GIFT_TIERS.big.weight} shares. Same size means the same dollar amount, pennies aside.`,
  },
  {
    id: "cushion",
    name: "Keep 0%, 5%, or 10% for the extras",
    text: "The reserve is a cushion for wrapping, shipping, sales tax, or the person you nearly forgot. You still check the real tax and postage yourself.",
  },
  {
    id: "save-the-plan",
    name: "Copy the plan or print it before you close the tab",
    text: "The Lab does not store the names, the gift list, or the budget. Copying or printing is how the plan leaves the browser.",
  },
  {
    id: "draw-names",
    name: "Draw names somewhere outside the Click",
    text: `${splitter.name} stops at the dollar amounts. The hat, the spreadsheet, or the group message is where a person learns who they are buying for.`,
  },
  {
    id: "match-the-gift",
    name: "Match the gift to the share you actually have",
    text: `${crossword.name} is ${crossword.priceLabel} and ${wordSearch.name} is ${wordSearch.priceLabel}. If the share on your plan covers that price, the puzzle fits. If it does not, use a free Click or something else you already meant to give.`,
  },
] as const;

const pagePath = guidePath(guide.slug);

export const metadata = socialMetadata({
  title: guide.title,
  description: guide.description,
  path: pagePath,
  type: "article",
  publishedTime: guide.updatedAt,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    articleStructuredData({
      headline: guide.title,
      description: guide.description,
      path: pagePath,
      datePublished: guide.updatedAt,
      dateModified: guide.updatedAt,
    }),
    howToStructuredData({
      name: guide.title,
      description: guide.description,
      path: pagePath,
      steps: [...steps],
      tools: [
        { name: splitter.name, path: `/clicks/${splitter.slug}` },
        { name: crossword.name, path: `/clicks/${crossword.slug}` },
        { name: wordSearch.name, path: `/clicks/${wordSearch.slug}` },
      ],
    }),
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: guide.title, path: pagePath },
    ]),
  ],
};

function money(cents: number) {
  return formatGiftMoney(cents);
}

export default function SecretSantaGuidePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <GuideArticle
        guide={guide}
        aside="A cap everyone can see is already most of the peace."
      >
        <p>
          The stressful part of Secret Santa is rarely the present. It is the
          quiet argument about a cap nobody wrote down. One person heard a
          limit. Another heard a suggestion. A third had already bought the
          nice candle.{" "}
          <Link href={`/clicks/${splitter.slug}`}>{splitter.name}</Link> will
          not draw names, and it will not shop. It takes one total and divides
          it so the amounts agree. It is free, it runs in the browser, and{" "}
          {siteConfig.name} does not store the names or the budget.
        </p>
        <p>
          The dollar examples below use {money(illustrationCents)} so the
          shares are easy to see. That figure is an illustration. Your group
          still picks the real number.
        </p>

        <section aria-labelledby="write-the-rules">
          <h2 id="write-the-rules">{steps[0].name}</h2>
          <p>{steps[0].text}</p>
          <p>
            If each person may spend up to a number you all repeat out loud,
            multiply to get the pot. If someone already collected one pool,
            that pool is the pot. Write it down. Partners who want one shared
            gift are one line. Someone who would rather bring the cookies can
            sit the game out, and the game stays nicer for it. Then say what a
            gift is allowed to be: handmade, edible, silly, useful, or “something
            we have laughed about.” Put the theme in the same message as the
            cap.
          </p>
        </section>

        <section aria-labelledby="enter-the-total">
          <h2 id="enter-the-total">{steps[1].name}</h2>
          <p>{steps[1].text}</p>
          <p>
            Type the whole budget before any shopping. Dollars and cents are
            fine, up to two decimal places. You can add up to 30 people, and
            names stop at 42 characters. Blank names print as Person 1, Person
            2, and so on, which is fine while you test the math and useless in
            February. Type the real names before you copy the plan.
          </p>
          <div className="mention-grid">
            <ClickMention click={splitter} />
          </div>
        </section>

        <section aria-labelledby="same-size">
          <h2 id="same-size">{steps[2].name}</h2>
          <p>{steps[2].text}</p>
          <p>
            The descriptions sitting under those sizes are “{GIFT_TIERS.little.description},”
            “{GIFT_TIERS.regular.description},” and “{GIFT_TIERS.big.description}.”
            Change one person’s size and everyone else’s amount moves. For a
            classic exchange, give every person the same size. In the{" "}
            {money(illustrationCents)} illustration with a 0% reserve and four
            people set to {GIFT_TIERS.regular.label.toLowerCase()}, each person
            receives {money(evenAmount)}.
          </p>
          <p>
            Use mixed sizes only when the group has already agreed the gifts
            are different kinds of gifts. A couple sharing one present, and a
            child receiving another, is a real case. A big share handed out
            from guilt is not. The same {money(illustrationCents)}, still with
            no reserve, split across {GIFT_TIERS.big.label.toLowerCase()}, two{" "}
            {GIFT_TIERS.regular.label.toLowerCase()} gifts, and a{" "}
            {GIFT_TIERS.little.label.toLowerCase()}, comes out like this:
          </p>
          <ul>
            {mixedPlan.allocations.map((person) => (
              <li key={person.id}>
                {person.name}, {GIFT_TIERS[person.tier].label}: {money(person.amountCents)}
              </li>
            ))}
          </ul>
          <p>
            Alex, Blake, Casey, and Drew are stand-ins. When the cents do not
            divide evenly, leftover pennies are handed out one at a time, and
            ties follow the order of the list. Gifts plus the reserve still
            equal the total, as long as someone is on the list.
          </p>
        </section>

        <section aria-labelledby="cushion">
          <h2 id="cushion">{steps[3].name}</h2>
          <p>{steps[3].text}</p>
          <p>
            The buttons are “Spend it all” (0%), “A little wiggle room” (5%),
            and “December-proof” (10%). Shipped gifts make 10% the more honest
            button. Gifts crossing a kitchen table can honestly stay at zero.
            Set the mixed illustration to 10% and the cushion is{" "}
            {money(cushionedPlan.reserveCents)}, with{" "}
            {money(cushionedPlan.spendableCents)} left for gifts:
          </p>
          <ul>
            {cushionedPlan.allocations.map((person) => (
              <li key={person.id}>
                {person.name}, {GIFT_TIERS[person.tier].label}: {money(person.amountCents)}
              </li>
            ))}
          </ul>
          <p>
            The total did not grow. The Click divided {money(illustrationCents)}.
            The extras came out of the pot, which is the only place they can
            come from if the cap is real.
          </p>
        </section>

        <section aria-labelledby="save-the-plan">
          <h2 id="save-the-plan">{steps[4].name}</h2>
          <p>{steps[4].text}</p>
          <p>
            Copy gift plan, or use Print / save PDF. The copied note lists the
            total, the percent set aside, the amount left for gifts, and each
            person’s size and amount. Those buttons stay quiet until the budget
            is valid and at least one person is listed. Close the tab and the
            plan leaves with it. There is no account waiting underneath.
          </p>
        </section>

        <section aria-labelledby="draw-names">
          <h2 id="draw-names">{steps[5].name}</h2>
          <p>{steps[5].text}</p>
          <p>
            Write the cap on the same slip as the name, or send one message
            with the number, the theme, and the date. Skip any rule that
            everyone must show receipts. A cap is a ceiling. If someone
            forgets, the reserve is why the reserve exists: a backup gift has
            to exist before the day of the exchange. One person holds the list
            and sends one reminder. Then leave the thread alone.
          </p>
        </section>

        <section aria-labelledby="match-the-gift">
          <h2 id="match-the-gift">{steps[6].name}</h2>
          <p>{steps[6].text}</p>
          <p>
            In the even illustration, each share is {money(evenAmount)}, so
            both puzzles fit inside that particular number. Your real share
            might be smaller. Compare it with the price.{" "}
            <Link href={`/clicks/${crossword.slug}`}>{crossword.name}</Link>{" "}
            takes 8 to 15 answers and clues, shows a watermarked preview, and
            costs {crossword.priceLabel} for a two-page PDF with an answer key.{" "}
            <Link href={`/clicks/${wordSearch.slug}`}>{wordSearch.name}</Link>{" "}
            takes 10 to 30 words and costs {wordSearch.priceLabel}. You bring
            the memories. Programmed puzzle logic arranges them, and the
            entries are not sent to a generative model. The{" "}
            <Link href={guidePath("personalized-gifts-under-5")}>
              gift guide
            </Link>{" "}
            covers previews, dedications, and the free companions for a share
            that cannot hold either puzzle.
          </p>
          <div className="mention-grid">
            <ClickMention click={crossword} />
            <ClickMention click={wordSearch} />
          </div>
          <p>
            A long table full of opinions is a different job. The{" "}
            <Link href={guidePath("holiday-seating-chart")}>seating guide</Link>{" "}
            never sees these dollar amounts, which is the correct arrangement.
          </p>
        </section>
      </GuideArticle>
    </>
  );
}

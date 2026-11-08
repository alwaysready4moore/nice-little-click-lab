import Link from "next/link";
import { ClickMention } from "@/components/guides/ClickMention";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  assertFree,
  assertPricedUnderFive,
  guideBySlug,
  guidePath,
  priceDollars,
  requireClick,
} from "@/data/guides";
import {
  articleStructuredData,
  breadcrumbStructuredData,
  howToStructuredData,
  socialMetadata,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const guide = guideBySlug("personalized-gifts-under-5");
const crossword = requireClick("custom-crossword");
const wordSearch = requireClick("custom-word-search");
const pleaseAdvise = requireClick("please-advise");
const shouldEmail = requireClick("should-have-been-an-email");
const meetingTicker = requireClick("meeting-cost-ticker");
const budgetSplitter = requireClick("gift-budget-splitter");
const seating = requireClick("take-your-seat");

for (const click of [crossword, wordSearch]) assertPricedUnderFive(click);
for (const click of [pleaseAdvise, shouldEmail, meetingTicker, budgetSplitter, seating]) {
  assertFree(click);
}

const pairTotal = priceDollars(crossword) + priceDollars(wordSearch);
const pairLabel = Number.isInteger(pairTotal) ? `$${pairTotal}` : `$${pairTotal.toFixed(2)}`;

const steps = [
  {
    id: "gather-words",
    name: "Gather words only one person would recognize",
    text: "A short pile of names, places, nicknames, and habits is the whole raw material. The crossword wants a clue beside each answer. The word search wants the words themselves.",
  },
  {
    id: "crossword",
    name: `Make the ${crossword.priceLabel} crossword when the clue is the gift`,
    text: `${crossword.name} takes 8 to 15 answers and clues, shows a watermarked preview, and sells the finished two-page PDF for ${crossword.priceLabel}.`,
  },
  {
    id: "word-search",
    name: `Make the ${wordSearch.priceLabel} word search when the list is the gift`,
    text: `${wordSearch.name} takes 10 to 30 words, a difficulty, and a paper mood, then sells a two-page PDF for ${wordSearch.priceLabel} after a watermarked preview.`,
  },
  {
    id: "choose",
    name: "Choose one gift when the cap really is $5",
    text: `${crossword.name} is ${crossword.priceLabel} and ${wordSearch.name} is ${wordSearch.priceLabel}. Together they come to ${pairLabel}, which is a pleasant pair and a different budget.`,
  },
  {
    id: "companions",
    name: "Tuck in a free Click if the card has room",
    text: `${pleaseAdvise.name}, ${shouldEmail.name}, and ${meetingTicker.name} are free browser Clicks. They can ride along with a puzzle. They are entertainment and estimates, and each page says exactly what it does.`,
  },
  {
    id: "hand-it-over",
    name: "Print it, keep the file, and stop while it is still small",
    text: "The paid download is the gift. Save the PDF somewhere you can find it, because the Lab does not keep a puzzle library or a customer account.",
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
      tools: [crossword, wordSearch, pleaseAdvise, shouldEmail, meetingTicker].map(
        (click) => ({
          name: click.name,
          path: `/clicks/${click.slug}`,
        }),
      ),
    }),
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: guide.title, path: pagePath },
    ]),
  ],
};

export default function PersonalizedGiftsGuidePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <GuideArticle guide={guide} aside="Specific beats impressive. The grid can handle the rest.">
        <p>
          A good small gift usually knows something a store shelf cannot. A
          nickname. The diner with the unreliable chairs. The song two people
          sing wrong with complete confidence. {siteConfig.name} makes two
          printable puzzles for that kind of knowing.{" "}
          <Link href={`/clicks/${crossword.slug}`}>{crossword.name}</Link> is{" "}
          {crossword.priceLabel}.{" "}
          <Link href={`/clicks/${wordSearch.slug}`}>{wordSearch.name}</Link> is{" "}
          {wordSearch.priceLabel}. Each one is under $5. You can preview either
          puzzle before paying, and neither Click asks for an account.
        </p>
        <p>
          Order both and the total is {pairLabel}. That pair is no longer a
          single gift under $5, so pick one when the cap is real.
        </p>

        <section aria-labelledby="gather-words">
          <h2 id="gather-words">{steps[0].name}</h2>
          <p>{steps[0].text}</p>
          <p>
            Write the words the way you say them. A first apartment, a dog who
            believes she is invited, a middle name, the weekday when pancakes
            became a policy. You are collecting recognition. A crossword answer
            needs real letters and has to stay within 24 letters. Duplicates
            are turned away, so if two memories want the same word, keep the
            one with the better clue. A word-search entry can run to 40
            characters. Spaces and punctuation step out of the grid, while the
            word bank keeps the wording you typed. Both makers can load an
            example so you can see the shape, then replace every line with
            your own.
          </p>
        </section>

        <section aria-labelledby="crossword">
          <h2 id="crossword">{steps[1].name}</h2>
          <p>{steps[1].text}</p>
          <p>
            Shorter answers that share letters tend to knit. If an entry cannot
            find a place, the preview asks for a shorter answer or a synonym,
            and checkout stays closed until every answer fits. The title can be
            60 characters. Leave it blank and the page uses “A Little Puzzle
            About Us.” A dedication is optional and stops at 100 characters.
          </p>
          <p>
            The preview is watermarked and low-resolution on purpose. The paid
            file is a two-page PDF: the crossword and its clues, then a
            separate answer key. You can include Click on the answer-key page.
            Programmed crossword logic places the answers you typed. Those
            entries are not sent to a generative AI model. The draft stays in
            the browser tab, and you can download a private backup before you
            pay. At checkout the Lab sends the details to its server only to
            validate the puzzle and assemble the PDF. They are not saved to a
            customer account. Keep the finished file.
          </p>
          <div className="mention-grid">
            <ClickMention click={crossword} />
          </div>
        </section>

        <section aria-labelledby="word-search">
          <h2 id="word-search">{steps[2].name}</h2>
          <p>{steps[2].text}</p>
          <p>
            Ten words is the minimum and thirty is the maximum. Each entry
            needs at least two letters once the puzzle tidies it, and a
            duplicate is pointed out. Easy places words
            forward only. Medium lets some run backward. Hard allows every
            direction. Classic paper is warm and quietly giftable. Celebration
            is confetti without the cleanup. Kids is bright, friendly, and
            still printable. Title and dedication use the same 60- and
            100-character limits, and the standing title is “A Little Word
            Search About Us.”
          </p>
          <p>
            Build the watermarked preview before the {wordSearch.priceLabel}{" "}
            purchase. The download is a two-page PDF with the word bank and a
            separate answer key, and Click can sign that key. The draft lives
            in the tab, a backup file is yours to keep private, and the Lab
            does not keep a recoverable copy.
          </p>
          <div className="mention-grid">
            <ClickMention click={wordSearch} />
          </div>
        </section>

        <section aria-labelledby="choose">
          <h2 id="choose">{steps[3].name}</h2>
          <p>{steps[3].text}</p>
          <p>
            Reach for the crossword when the sentence is the present, and the
            word search when several people will hunt the same list. Print the
            paid PDF, not the watermarked preview, and remember the answer key
            is page two. If the money for a whole list is the actual puzzle, the{" "}
            <Link href={guidePath("secret-santa-budget")}>Secret Santa guide</Link>{" "}
            shows how{" "}
            <Link href={`/clicks/${budgetSplitter.slug}`}>{budgetSplitter.name}</Link>{" "}
            divides one total.
          </p>
        </section>

        <section aria-labelledby="companions">
          <h2 id="companions">{steps[4].name}</h2>
          <p>{steps[4].text}</p>
          <p>
            <Link href={`/clicks/${pleaseAdvise.slug}`}>{pleaseAdvise.name}</Link>{" "}
            is a fictional inbox: Reply, Reply All, or Spam / Ignore, in a
            session of 10 or 20 emails that can end after three mistakes. It is
            entertainment, not legal, HR, or workplace-policy advice. No
            account is required. A personal best and a sound preference may be
            stored on the device.{" "}
            <Link href={`/clicks/${shouldEmail.slug}`}>{shouldEmail.name}</Link>{" "}
            asks seven questions and can download the verdict as an image.
            Answers stay in the browser, are not saved by the Lab, and are not
            sent to an AI service. The verdict is a playful prompt, not an HR,
            legal, accessibility, or policy ruling.{" "}
            <Link href={`/clicks/${meetingTicker.slug}`}>{meetingTicker.name}</Link>{" "}
            uses the pay figures you estimate and can download a receipt. The
            number is an estimate, and the meeting details stay in the browser.
          </p>
          <div className="mention-grid">
            <ClickMention click={pleaseAdvise} />
            <ClickMention click={shouldEmail} />
            <ClickMention click={meetingTicker} />
          </div>
          <p>
            Read the Click before you promise a feature. The{" "}
            <Link href="/clicks">full shelf</Link> is short on purpose.
          </p>
        </section>

        <section aria-labelledby="hand-it-over">
          <h2 id="hand-it-over">{steps[5].name}</h2>
          <p>{steps[5].text}</p>
          <p>
            Print the PDF and put it in a card. The{" "}
            <Link href={guidePath("holiday-seating-chart")}>holiday seating guide</Link>{" "}
            uses free{" "}
            <Link href={`/clicks/${seating.slug}`}>{seating.name}</Link> when
            the table is the other project. Purchase questions can go to{" "}
            <Link href="/contact">the Lab</Link>, and the longer notes are on
            the <Link href="/privacy">privacy page</Link>.
          </p>
        </section>
      </GuideArticle>
    </>
  );
}
